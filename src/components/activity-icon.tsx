import { ArrowDownToLine, ArrowUpFromLine, ShieldCheck, Sparkles } from 'lucide-react'

import type { ActivityType } from '@/lib/api'

const CONF = {
  in: { icon: ArrowDownToLine, cls: 'bg-em-soft text-em' },
  out: { icon: ArrowUpFromLine, cls: 'bg-warn-soft text-warn' },
  bonus: { icon: Sparkles, cls: 'bg-grape-soft text-grape' },
  security: { icon: ShieldCheck, cls: 'bg-ink/5 text-mute' },
} as const

export function ActivityIcon({ type, size = 13 }: { type: ActivityType; size?: number }) {
  const { icon: Icon, cls } = CONF[type]
  return (
    <span className={`grid h-8 w-8 flex-none place-items-center rounded-full border border-line bg-card shadow-sm ${cls}`}>
      <Icon size={size} strokeWidth={2.2} />
    </span>
  )
}
