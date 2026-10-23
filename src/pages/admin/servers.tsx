import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { KeyRound, Plus, RefreshCcw, ServerCog, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { CopyField } from '@/components/copy-field'
import { EmptyState } from '@/components/empty-state'
import { Pagination } from '@/components/pagination'
import { Reveal } from '@/components/reveal'
import { SearchInput } from '@/components/search-input'
import { StatusBadge } from '@/components/status-badge'
import { api, ApiError } from '@/lib/api'
import type { AdminServer, ServerSecret } from '@/lib/api'
import { fmtDateTime, relTime } from '@/lib/format'
import { Button } from '@/ui/button'
import { Card, CardContent } from '@/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Input } from '@/ui/input'
import { FieldLabel } from '@/ui/label'
import { Skeleton } from '@/ui/skeleton'
import { useToast } from '@/ui/toast'

const PAGE_SIZE = 8

/** 一次性凭证交付弹窗：创建/轮换成功后展示，中心不再保存明文 */
function SecretDialog({
  secret,
  contextName,
  onClose,
}: {
  secret: ServerSecret | null
  contextName: string
  onClose: () => void
}) {
  return (
    <Dialog open={secret !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contextName} · 服务器凭证已生成</DialogTitle>
          <DialogDescription>
            该密钥仅此一次展示，中心只保存 SHA-256 摘要，无法再次找回；请立即复制并保存到服务器{' '}
            <code className="rounded bg-paper px-1.5 py-0.5 font-mono text-[11.5px]">config/&lt;mod名&gt;/</code> 目录。
          </DialogDescription>
        </DialogHeader>
        <CopyField value={secret?.secret ?? ''} />
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-warn-line bg-warn-soft px-4 py-3 text-[12px] leading-relaxed text-warn-deep">
          <KeyRound size={13} className="mt-0.5 flex-none" />
          <span>server_id：<b className="font-mono">{secret?.id}</b>。轮换后旧密钥立即失效，停用/删除即时影响后续认证。</span>
        </div>
        <DialogFooter>
          <Button variant="ink" onClick={onClose}>
            已保存，关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AdminServersPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createError, setCreateError] = useState('')
  const [secret, setSecret] = useState<ServerSecret | null>(null)
  const [secretContext, setSecretContext] = useState('')
  const [confirmAction, setConfirmAction] = useState<
    | { kind: 'toggle'; server: AdminServer }
    | { kind: 'rotate'; server: AdminServer }
    | { kind: 'delete'; server: AdminServer }
    | null
  >(null)

  const list = useQuery({
    queryKey: ['admin-servers', { page, page_size: PAGE_SIZE }],
    queryFn: () => api.adminServerList({ page, page_size: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin-servers'] })
    void queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    void queryClient.invalidateQueries({ queryKey: ['admin-audit'] })
  }

  const createMutation = useMutation({
    mutationFn: () => api.adminServerCreate({ server_name: createName }),
    onSuccess: (issued) => {
      setCreateOpen(false)
      setCreateName('')
      setCreateError('')
      setSecretContext('创建成功')
      setSecret(issued)
      invalidate()
    },
    onError: (error) => {
      setCreateError(error instanceof ApiError ? error.message : '创建失败，请重试')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (input: { id: string; enabled: boolean }) =>
      api.adminServerSetEnabled({ server_id: input.id, enabled: input.enabled }),
    onSuccess: (_data, input) => {
      toast(`已${input.enabled ? '启用' : '停用'}，立即影响后续认证`, 'info')
      invalidate()
    },
  })

  const rotateMutation = useMutation({
    mutationFn: (id: string) => api.adminServerRotateSecret({ server_id: id }),
    onSuccess: (issued) => {
      setSecretContext('轮换成功')
      setSecret(issued)
      invalidate()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.adminServerDelete({ server_id: id }),
    onSuccess: () => {
      toast('服务器登记已删除，历史审计保留')
      invalidate()
    },
  })

  const filtered =
    list.data?.items.filter((server) => server.server_name.toLowerCase().includes(search.trim().toLowerCase())) ?? []

  return (
    <div className="mx-auto max-w-[960px] px-7 py-8">
      <Reveal>
        <div className="mb-5 flex flex-wrap items-end gap-4">
          <div>
            <h1 className="font-display text-[24px] font-extrabold tracking-tight text-ink">服务器凭证</h1>
            <p className="mt-1.5 text-[13px] text-mute">
              管理游戏服接入身份；密钥采用一次性交付，中心只保存摘要。
            </p>
          </div>
          <Button variant="primary" className="ml-auto" onClick={() => setCreateOpen(true)}>
            <Plus size={15} /> 接入新服务器
          </Button>
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <Card>
          <CardContent className="pt-5">
            <div className="mb-4 max-w-[280px]">
              <SearchInput value={search} onChange={setSearch} placeholder="搜索服务器名…" />
            </div>

            {list.data ? (
              filtered.length === 0 ? (
                <EmptyState
                  icon={ServerCog}
                  title="没有匹配的服务器"
                  description="调整搜索词，或接入新的游戏服务器。"
                  action={
                    <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
                      <Plus size={14} /> 接入新服务器
                    </Button>
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-line text-[11px] uppercase tracking-wider text-faint">
                        <th className="py-2.5 pr-4 font-medium">服务器</th>
                        <th className="py-2.5 pr-4 font-medium">状态</th>
                        <th className="py-2.5 pr-4 font-medium">最近认证</th>
                        <th className="py-2.5 pr-4 font-medium">创建时间</th>
                        <th className="py-2.5 pr-3 text-right font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((server) => (
                        <tr key={server.id} className="group border-b border-line transition-colors last:border-none hover:bg-[#f8f8f6]">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2.5">
                              <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-em-soft text-em">
                                <ServerCog size={15} />
                              </span>
                              <div>
                                <div className="text-[13.5px] font-semibold text-ink">{server.server_name}</div>
                                <div className="font-mono text-[11px] text-faint">#{server.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <StatusBadge status={server.enabled ? 'enabled' : 'disabled'} />
                          </td>
                          <td className="py-3 pr-4 text-[12.5px] text-mute">
                            {server.last_seen_at ? relTime(server.last_seen_at) : '—'}
                          </td>
                          <td className="py-3 pr-4 text-[12.5px] text-mute tabular-nums">{fmtDateTime(server.created_at)}</td>
                          <td className="py-3 pr-3">
                            <div className="flex justify-end gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                              <Button variant="ghost" size="sm" onClick={() => setConfirmAction({ kind: 'rotate', server })}>
                                <RefreshCcw size={13} /> 轮换
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setConfirmAction({ kind: 'toggle', server })}
                              >
                                {server.enabled ? '停用' : '启用'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-danger-deep hover:bg-danger-soft hover:text-danger-deep"
                                onClick={() => setConfirmAction({ kind: 'delete', server })}
                              >
                                <Trash2 size={13} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="space-y-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-[60px]" />
                ))}
              </div>
            )}

            {list.data && (
              <Pagination
                page={list.data.page}
                pageSize={list.data.page_size}
                total={search.trim() ? filtered.length : list.data.total}
                onChange={setPage}
              />
            )}
          </CardContent>
        </Card>
      </Reveal>

      {/* 创建服务器 */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>接入新服务器</DialogTitle>
            <DialogDescription>
              填写展示名即可；server_id 与密钥由中心生成，创建成功后一次性交付。
            </DialogDescription>
          </DialogHeader>
          <div>
            <FieldLabel htmlFor="server-name">服务器名称</FieldLabel>
            <Input
              id="server-name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="2–24 位中文、字母、数字、- 或 _"
              autoFocus
            />
            {createError && <p className="mt-1.5 text-[12px] text-danger">{createError}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)} disabled={createMutation.isPending}>
              取消
            </Button>
            <Button
              variant="primary"
              disabled={createMutation.isPending || createName.trim().length < 2}
              onClick={() => createMutation.mutate()}
            >
              创建并生成密钥
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SecretDialog secret={secret} contextName={secretContext} onClose={() => setSecret(null)} />

      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={
          confirmAction?.kind === 'toggle'
            ? `${confirmAction.server.enabled ? '停用' : '启用'} ${confirmAction.server.server_name}？`
            : confirmAction?.kind === 'rotate'
              ? `轮换 ${confirmAction.server.server_name} 的密钥？`
              : `删除 ${confirmAction?.server.server_name} 的接入登记？`
        }
        description={
          confirmAction?.kind === 'toggle'
            ? confirmAction.server.enabled
              ? '停用后该服务器的后续认证请求将立即被拒绝；已建立的流在下次收发时失效。'
              : '启用后该服务器可恢复使用现有凭证认证。'
            : confirmAction?.kind === 'rotate'
              ? '轮换会生成新密钥并立即交付，旧密钥即刻失效；请确保能及时更新服务器配置。'
              : '删除登记后该服务器无法再认证接入；历史审计记录保留。此操作不可撤销。'
        }
        confirmLabel={confirmAction?.kind === 'delete' ? '确认删除' : '确认'}
        destructive={confirmAction?.kind === 'delete'}
        onConfirm={async () => {
          if (!confirmAction) return
          if (confirmAction.kind === 'toggle') {
            await toggleMutation.mutateAsync({ id: confirmAction.server.id, enabled: !confirmAction.server.enabled })
          } else if (confirmAction.kind === 'rotate') {
            await rotateMutation.mutateAsync(confirmAction.server.id)
          } else {
            await deleteMutation.mutateAsync(confirmAction.server.id)
          }
        }}
      />
    </div>
  )
}
