import type * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[11px] font-semibold leading-none',
  {
    variants: {
      tone: {
        neutral: 'bg-ink/6 text-mute',
        emerald: 'bg-em-soft text-em-deep',
        amber: 'bg-warn-soft text-warn-deep',
        violet: 'bg-grape-soft text-grape',
        danger: 'bg-danger-soft text-danger-deep',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
