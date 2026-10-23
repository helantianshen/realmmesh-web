import type * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'

import { cn } from '@/lib/utils'

export const Label = LabelPrimitive.Root

export function FieldLabel({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root className={cn('mb-1.5 block text-[13px] font-semibold text-ink', className)} {...props} />
}
