import { cn } from '@/lib/utils'

export function Meter({
  ratio,
  tone = 'emerald',
  className,
}: {
  ratio: number
  tone?: 'emerald' | 'amber' | 'danger'
  className?: string
}) {
  const pct = Math.min(100, Math.max(0, ratio * 100))
  const toneClass = {
    emerald: 'bg-gradient-to-r from-em to-[#0aa0b8]',
    amber: 'bg-warn',
    danger: 'bg-danger',
  }[tone]
  return (
    <div className={cn('h-[5px] w-full overflow-hidden rounded-full bg-[#eceae5]', className)}>
      <div className={cn('h-full rounded-full', toneClass)} style={{ width: `${pct}%` }} />
    </div>
  )
}
