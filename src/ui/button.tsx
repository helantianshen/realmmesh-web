import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[11px] font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-em/55',
  {
    variants: {
      variant: {
        primary: 'bg-em text-white shadow-[0_2px_6px_rgba(23,24,26,0.06),0_12px_28px_-12px_rgba(13,157,108,0.45)] hover:bg-em-deep',
        ink: 'bg-ink text-white shadow-md hover:bg-black',
        outline: 'border border-line-2 bg-card text-ink shadow-sm hover:border-em hover:text-em-deep hover:shadow-md',
        ghost: 'text-mute hover:bg-ink/5 hover:text-ink',
        subtle: 'bg-ink/5 text-ink hover:bg-ink/10',
        danger: 'bg-danger text-white hover:bg-danger-deep',
        dangerOutline: 'border border-danger-line bg-danger-soft text-danger-deep hover:bg-danger hover:text-white',
      },
      size: {
        sm: 'h-8 px-3 text-[12.5px]',
        md: 'h-10 px-4 text-[13.5px]',
        lg: 'h-12 px-6 text-[14.5px]',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'ink', size: 'md' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
)
Button.displayName = 'Button'
