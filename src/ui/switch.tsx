import type * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

export function Switch({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'inline-flex h-[22px] w-[38px] flex-none cursor-pointer items-center rounded-full border border-line-2 bg-line transition-colors data-[state=checked]:border-em data-[state=checked]:bg-em',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block h-[16px] w-[16px] translate-x-[3px] rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[19px]" />
    </SwitchPrimitive.Root>
  )
}
