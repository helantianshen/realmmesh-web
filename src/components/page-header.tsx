import type { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end gap-4">
      <div>
        <h1 className="font-display text-[26px] font-extrabold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1.5 text-[13.5px] text-mute">{description}</p>}
      </div>
      {actions && <div className="ml-auto flex gap-2.5">{actions}</div>}
    </div>
  )
}
