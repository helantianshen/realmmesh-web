import type * as React from 'react'
import { forwardRef } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'

/** 下划线式页签：登录/注册切换等表单内分段使用 */
export const Tabs = TabsPrimitive.Root

export const TabsList = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List ref={ref} className={cn('flex gap-6 border-b border-line', className)} {...props} />
))
TabsList.displayName = 'TabsList'

export const TabsTrigger = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'relative pb-3 text-[14px] font-semibold text-faint transition-colors hover:text-mute data-[state=active]:text-ink',
      'after:absolute after:inset-x-0 after:bottom-[-1px] after:h-[2.5px] after:rounded-t-[3px] after:bg-em after:content-empty data-[state=active]:after:opacity-100 after:opacity-0 after:transition-opacity',
      className,
    )}
    {...props}
  />
))
TabsTrigger.displayName = 'TabsTrigger'

export const TabsContent = TabsPrimitive.Content
