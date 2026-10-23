import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ShieldCheck, Trash2, UsersRound } from 'lucide-react'
import { useState } from 'react'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Pagination } from '@/components/pagination'
import { Reveal } from '@/components/reveal'
import { SearchInput } from '@/components/search-input'
import { StatusBadge } from '@/components/status-badge'
import { api, ApiError } from '@/lib/api'
import type { AdminAccount } from '@/lib/api'
import { fmtDate, relTime } from '@/lib/format'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent } from '@/ui/card'
import { Skeleton } from '@/ui/skeleton'
import { useToast } from '@/ui/toast'

const PAGE_SIZE = 9

export function AdminAccountsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState<AdminAccount | null>(null)
  const [deleteError, setDeleteError] = useState('')

  const list = useQuery({
    queryKey: ['admin-accounts', { search, page, page_size: PAGE_SIZE }],
    queryFn: () => api.adminAccounts({ search, page, page_size: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.adminUserDelete({ user_id: id }),
    onSuccess: (_data, id) => {
      toast(`账户 ${pendingDelete?.player_name ?? id} 已删除；玩家名仍被占用`)
      void queryClient.invalidateQueries({ queryKey: ['admin-accounts'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  return (
    <div className="mx-auto max-w-[960px] px-7 py-8">
      <Reveal>
        <div className="mb-5">
          <h1 className="font-display text-[24px] font-extrabold tracking-tight text-ink">账户管理</h1>
          <p className="mt-1.5 text-[13px] text-mute">
            中心账户全局唯一；删除后玩家名（忽略大小写）永久占用，管理员账户禁止删除。
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <Card>
          <CardContent className="pt-5">
            <div className="mb-4 max-w-[280px]">
              <SearchInput
                value={search}
                onChange={(value) => {
                  setSearch(value)
                  setPage(1)
                }}
                placeholder="搜索玩家名…"
              />
            </div>

            {list.data ? (
              list.data.items.length === 0 ? (
                <EmptyState icon={UsersRound} title="没有匹配的账户" description="换个关键词试试。" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-line text-[11px] uppercase tracking-wider text-faint">
                        <th className="py-2.5 pr-4 font-medium">玩家</th>
                        <th className="py-2.5 pr-4 font-medium">角色</th>
                        <th className="py-2.5 pr-4 font-medium">状态</th>
                        <th className="py-2.5 pr-4 font-medium">注册时间</th>
                        <th className="py-2.5 pr-4 font-medium">最近登录</th>
                        <th className="py-2.5 pr-3 text-right font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.data.items.map((account) => (
                        <tr key={account.id} className="group border-b border-line transition-colors last:border-none hover:bg-[#f8f8f6]">
                          <td className="py-3 pr-4">
                            <div className="font-mono text-[13px] font-semibold text-ink">{account.player_name}</div>
                            <div className="mt-0.5 font-mono text-[11px] text-faint">#{account.id}</div>
                          </td>
                          <td className="py-3 pr-4">
                            {account.is_admin ? <Badge tone="violet"><ShieldCheck size={11} /> 管理员</Badge> : <Badge tone="neutral">玩家</Badge>}
                          </td>
                          <td className="py-3 pr-4">
                            <StatusBadge status={account.status} />
                          </td>
                          <td className="py-3 pr-4 text-[12.5px] text-mute tabular-nums">{fmtDate(account.created_at)}</td>
                          <td className="py-3 pr-4 text-[12.5px] text-mute">
                            {account.last_login_at ? relTime(account.last_login_at) : '—'}
                          </td>
                          <td className="py-3 pr-3 text-right">
                            {account.is_admin ? (
                              <span className="text-[12px] text-faint" title="禁止删除管理员账户">—</span>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-danger-deep opacity-0 transition-opacity hover:bg-danger-soft hover:text-danger-deep group-hover:opacity-100 focus-visible:opacity-100"
                                disabled={account.status === 'deleted'}
                                onClick={() => {
                                  setDeleteError('')
                                  setPendingDelete(account)
                                }}
                              >
                                <Trash2 size={13} /> 删除
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="space-y-2.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[58px]" />
                ))}
              </div>
            )}

            {list.data && (
              <Pagination page={list.data.page} pageSize={list.data.page_size} total={list.data.total} onChange={setPage} />
            )}
          </CardContent>
        </Card>
      </Reveal>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`删除账户 ${pendingDelete?.player_name ?? ''}？`}
        description="账户为逻辑删除：该玩家名（忽略大小写）将永久占用、无法再次注册，其在线会话会被踢出。此操作不可撤销。"
        confirmLabel="确认删除"
        destructive
        onConfirm={async () => {
          if (!pendingDelete) return
          try {
            await deleteMutation.mutateAsync(pendingDelete.id)
          } catch (error) {
            setDeleteError(error instanceof ApiError ? error.message : '删除失败，请重试')
            throw error
          }
        }}
      >
        {deleteError && (
          <p className="mt-3 rounded-[10px] border border-danger-line bg-danger-soft px-3.5 py-2.5 text-[12.5px] text-danger-deep">
            {deleteError}
          </p>
        )}
      </ConfirmDialog>
    </div>
  )
}
