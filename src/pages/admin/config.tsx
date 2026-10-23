import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Info, PencilLine, TimerReset, Warehouse } from 'lucide-react'
import { useState } from 'react'

import { Reveal } from '@/components/reveal'
import { api, ApiError } from '@/lib/api'
import type { SystemConfigItem } from '@/lib/api'
import { Button } from '@/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/dialog'
import { Input } from '@/ui/input'
import { FieldLabel } from '@/ui/label'
import { Skeleton } from '@/ui/skeleton'
import { useToast } from '@/ui/toast'

function EditConfigDialog({
  item,
  onClose,
  onSaved,
}: {
  item: SystemConfigItem | null
  onClose: () => void
  onSaved: (item: SystemConfigItem) => void
}) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const save = useMutation({
    mutationFn: (next: number) => api.adminSystemConfigUpdate({ key: item!.key, value: next }),
    onSuccess: onSaved,
    onError: (err) => setError(err instanceof ApiError ? err.message : '保存失败，请重试'),
  })

  function handleSave() {
    const next = Number(value)
    if (!item) return
    if (!Number.isInteger(next)) {
      setError('请输入整数')
      return
    }
    if (next < item.min || next > item.max) {
      setError(`取值需在 ${item.min}–${item.max} 之间`)
      return
    }
    setError('')
    save.mutate(next)
  }

  return (
    <Dialog
      open={item !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
          setValue('')
          setError('')
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>调整 · {item?.label}</DialogTitle>
          <DialogDescription>
            {item?.description} 配置保存于中心 system_configs 表，全中心统一生效。
          </DialogDescription>
        </DialogHeader>
        <div>
          <FieldLabel htmlFor="config-value">
            {item?.label}（{item?.min}–{item?.max} {item?.unit}）
          </FieldLabel>
          <Input
            id="config-value"
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`当前 ${item?.value}`}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          {error && <p className="mt-1.5 text-[12px] text-danger">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={save.isPending}>
            取消
          </Button>
          <Button variant="primary" disabled={save.isPending || value === ''} onClick={handleSave}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AdminConfigPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<SystemConfigItem | null>(null)

  const configs = useQuery({ queryKey: ['admin-configs'], queryFn: () => api.adminSystemConfigs() })
  const policy = useQuery({ queryKey: ['admin-warehouse-policy'], queryFn: () => api.adminWarehousePolicy() })

  return (
    <div className="mx-auto max-w-[860px] px-7 py-8">
      <Reveal>
        <div className="mb-5">
          <h1 className="font-display text-[24px] font-extrabold tracking-tight text-ink">系统配置</h1>
          <p className="mt-1.5 text-[13px] text-mute">
            认证与仓库策略集中管理；修改即时生效并记入审计日志。
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {configs.data ? (
          configs.data.map((item, i) => (
            <Reveal key={item.key} delay={0.06 + i * 0.05}>
              <Card className="h-full">
                <CardHeader>
                  <span className="grid h-[26px] w-[26px] place-items-center rounded-lg bg-warn-soft text-warn">
                    <TimerReset size={13} />
                  </span>
                  <CardTitle>{item.label}</CardTitle>
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setEditing(item)}>
                    <PencilLine size={13} /> 调整
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="font-display text-[26px] font-extrabold tracking-tight text-ink tabular-nums">
                    {item.value}
                    <span className="ml-1.5 text-[12.5px] font-medium text-faint">{item.unit}</span>
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-faint">{item.description}</p>
                  <div className="mt-3 border-t border-line pt-2.5 font-mono text-[11px] text-faint">{item.key}</div>
                </CardContent>
              </Card>
            </Reveal>
          ))
        ) : (
          Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-[168px] rounded-card" />)
        )}

        <Reveal delay={0.16}>
          <Card className="h-full">
            <CardHeader>
              <span className="grid h-[26px] w-[26px] place-items-center rounded-lg bg-em-soft text-em">
                <Warehouse size={13} />
              </span>
              <CardTitle>仓库容量策略</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={async () => {
                  if (!policy.data) return
                  try {
                    await api.adminWarehouseSetPolicy({ capacity_slots: policy.data.capacity_slots })
                    toast('仓库策略已确认同步', 'info')
                    void queryClient.invalidateQueries({ queryKey: ['admin-warehouse-policy'] })
                  } catch {
                    toast('策略保存失败', 'warn')
                  }
                }}
              >
                <PencilLine size={13} /> 同步
              </Button>
            </CardHeader>
            <CardContent>
              <div className="font-display text-[26px] font-extrabold tracking-tight text-ink tabular-nums">
                {policy.data?.capacity_slots ?? '…'}
                <span className="ml-1.5 text-[12.5px] font-medium text-faint">格 / 每账户</span>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-faint">
                每账户共享仓库的总格数；调整只影响后续存入，不删除已有物品。
              </p>
              <div className="mt-3 border-t border-line pt-2.5 font-mono text-[11px] text-faint">
                warehouse.capacity_slots
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={0.24}>
        <Card className="mt-4">
          <CardContent className="flex items-start gap-3 pt-5 text-[12.5px] leading-relaxed text-mute">
            <Info size={15} className="mt-0.5 flex-none text-em" />
            <span>
              系统配置在中心启动时只补齐缺失项、不覆盖已有值；必需键被删除或值非法时中心将拒绝启动。
              游戏服侧登录时限等配置由中心每 30 秒热更新推送，无需重启服务器。
            </span>
          </CardContent>
        </Card>
      </Reveal>

      <EditConfigDialog
        item={editing}
        onClose={() => setEditing(null)}
        onSaved={(item) => {
          setEditing(null)
          toast(`${item.label} 已调整为 ${item.value} ${item.unit}`)
          void queryClient.invalidateQueries({ queryKey: ['admin-configs'] })
          void queryClient.invalidateQueries({ queryKey: ['admin-audit'] })
        }}
      />
    </div>
  )
}
