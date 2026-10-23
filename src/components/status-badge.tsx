import { Badge } from '@/ui/badge'

export function StatusBadge({ status }: { status: 'online' | 'maintenance' | 'enabled' | 'disabled' | 'normal' | 'cooldown' | 'deleted' }) {
  switch (status) {
    case 'online':
    case 'enabled':
    case 'normal':
      return <Badge tone="emerald">{status === 'online' ? '在线' : status === 'enabled' ? '已启用' : '正常'}</Badge>
    case 'maintenance':
      return <Badge tone="amber">维护中</Badge>
    case 'cooldown':
      return <Badge tone="amber">休息期</Badge>
    case 'disabled':
      return <Badge tone="neutral">已停用</Badge>
    case 'deleted':
      return <Badge tone="danger">已删除</Badge>
  }
}

export function StatusDot({ online }: { online: boolean }) {
  return (
    <span className="relative flex h-2 w-2 flex-none">
      {online && (
        <span className="absolute inset-0 animate-ping rounded-full bg-em opacity-60" style={{ animationDuration: '2.2s' }} />
      )}
      <span className={cnDot(online)} />
    </span>
  )
}

function cnDot(online: boolean) {
  const base = 'relative h-2 w-2 rounded-full'
  return online ? base + ' bg-em shadow-[0_0_0_3.5px_var(--color-em-soft)]' : base + ' bg-warn shadow-[0_0_0_3.5px_var(--color-warn-soft)]'
}
