import { forwardRef, type InputHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-[11px] border border-line-2 bg-card px-3.5 text-[14px] text-ink shadow-sm outline-none transition-colors placeholder:text-[#b3b7bd] focus:border-em focus:shadow-[0_0_0_3.5px_rgba(13,157,108,0.13)] disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
