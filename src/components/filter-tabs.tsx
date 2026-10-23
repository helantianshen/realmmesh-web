import { cn } from '@/lib/utils'

export interface FilterOption<T extends string> {
  value: T
  label: string
}

/** 胶囊式筛选器：仓库分类、动态类型等列表过滤 */
export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: FilterOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors',
            value === opt.value
              ? 'bg-ink font-semibold text-white'
              : 'bg-ink/5 text-mute hover:bg-ink/10 hover:text-ink',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
