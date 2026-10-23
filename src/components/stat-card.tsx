import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function StatCard({
  icon: Icon,
  iconTone = 'emerald',
  label,
  value,
  unit,
  footer,
  className,
}: {
  icon: LucideIcon
  iconTone?: 'emerald' | 'violet' | 'amber'
  label: string
  value: string
  unit?: string
  footer?: ReactNode
  className?: string
}) {
  const toneClass = {
    emerald: 'bg-em-soft text-em',
    violet: 'bg-grape-soft text-grape',
    amber: 'bg-warn-soft text-warn',
  }[iconTone]

  return (
    <div className={cn('rounded-card border border-line bg-card p-[18px] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md', className)}>
      <div className="flex items-center gap-2 text-[12.5px] text-mute">
        <span className={cn('grid h-[26px] w-[26px] place-items-center rounded-lg', toneClass)}>
          <Icon size={13} strokeWidth={2.2} />
        </span>
        {label}
      </div>
      <div className="mt-2.5 font-display text-[26px] font-extrabold tracking-tight text-ink tabular-nums">
        {value}
        {unit && <span className="ml-1 text-[12.5px] font-medium text-faint">{unit}</span>}
      </div>
      {footer && <div className="mt-1.5 text-[12px] text-faint">{footer}</div>}
    </div>
  )
}
