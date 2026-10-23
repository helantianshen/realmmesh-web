import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/ui/button'

export function Pagination({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number
  pageSize: number
  total: number
  onChange: (page: number) => void
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (total === 0) return null

  return (
    <div className="flex items-center justify-between px-1 pt-3">
      <span className="text-[12px] text-faint tabular-nums">
        共 {total} 条 · 第 {page} / {pages} 页
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft size={14} /> 上一页
        </Button>
        <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          下一页 <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  )
}
