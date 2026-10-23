import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ink/5 text-faint">
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <div>
        <div className="text-[14px] font-semibold text-ink">{title}</div>
        {description && <div className="mt-1 text-[12.5px] leading-relaxed text-faint">{description}</div>}
      </div>
      {action}
    </div>
  )
}
