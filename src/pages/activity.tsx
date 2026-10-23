import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { History } from 'lucide-react'
import { useState } from 'react'

import { ActivityIcon } from '@/components/activity-icon'
import { EmptyState } from '@/components/empty-state'
import { FilterTabs } from '@/components/filter-tabs'
import { Pagination } from '@/components/pagination'
import { Reveal } from '@/components/reveal'
import { api } from '@/lib/api'
import type { ActivityType } from '@/lib/api'
import { fmtDateTime } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Badge } from '@/ui/badge'
import { Skeleton } from '@/ui/skeleton'

type TypeFilter = ActivityType | 'all'

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'in', label: '存入' },
  { value: 'out', label: '取出' },
  { value: 'bonus', label: '奖励' },
  { value: 'security', label: '安全' },
]

const PAGE_SIZE = 10

export function ActivityPage() {
  const [type, setType] = useState<TypeFilter>('all')
  const [page, setPage] = useState(1)

  const query = useQuery({
    queryKey: ['activity', { type, page, page_size: PAGE_SIZE }],
    queryFn: () => api.activityList({ type, page, page_size: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  })

  return (
    <div>
      <Reveal>
        <div className="mb-5">
          <h1 className="font-display text-[26px] font-extrabold tracking-tight text-ink">动态记录</h1>
          <p className="mt-1.5 text-[13.5px] text-mute">资产的每一次跨服流转与账户安全事件，按时间倒序。</p>
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>流转历史</CardTitle>
            <Badge tone="neutral">{query.data ? `${query.data.total} 条` : '…'}</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <FilterTabs
              options={TYPE_OPTIONS}
              value={type}
              onChange={(value) => {
                setType(value)
                setPage(1)
              }}
              className="mb-4"
            />

            {query.data ? (
              query.data.items.length === 0 ? (
                <EmptyState icon={History} title="暂无相关记录" description="该分类下还没有动态。" />
              ) : (
                <div className="divide-y divide-line">
                  {query.data.items.map((record) => (
                    <div key={record.id} className="flex items-center gap-3.5 px-1 py-[13px]">
                      <ActivityIcon type={record.type} />
                      <div className="min-w-0">
                        <div className="text-[13.5px] text-ink">
                          <b className="font-semibold">{record.title}</b>
                          {record.server_name && <span className="text-faint"> · {record.server_name}</span>}
                        </div>
                        {record.detail && <div className="mt-0.5 text-[12px] text-faint">{record.detail}</div>}
                      </div>
                      <span className="ml-auto whitespace-nowrap text-[12px] text-faint tabular-nums">
                        {fmtDateTime(record.time)}
                      </span>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="space-y-2.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-[58px]" />
                ))}
              </div>
            )}

            {query.data && (
              <Pagination page={query.data.page} pageSize={query.data.page_size} total={query.data.total} onChange={setPage} />
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  )
}
