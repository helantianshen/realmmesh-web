import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Info, PackageSearch } from 'lucide-react'
import { useState } from 'react'

import { itemPixel } from '@/pages/overview'
import { FilterTabs } from '@/components/filter-tabs'
import { PixelIcon } from '@/components/pixel-icon'
import { Meter } from '@/components/meter'
import { EmptyState } from '@/components/empty-state'
import { Pagination } from '@/components/pagination'
import { Reveal } from '@/components/reveal'
import { SearchInput } from '@/components/search-input'
import { api } from '@/lib/api'
import type { ItemCategory } from '@/lib/api'
import { fmtNum, relTime } from '@/lib/format'
import { Badge } from '@/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog'
import { Skeleton } from '@/ui/skeleton'

type CategoryFilter = ItemCategory | 'all'

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'mat', label: '材料' },
  { value: 'tool', label: '工具' },
  { value: 'build', label: '建筑' },
  { value: 'redstone', label: '红石' },
  { value: 'use', label: '消耗品' },
]

const CATEGORY_LABEL: Record<ItemCategory, string> = {
  mat: '材料',
  tool: '工具',
  build: '建筑',
  redstone: '红石',
  use: '消耗品',
}

const PAGE_SIZE = 8

export function WarehousePage() {
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [detailId, setDetailId] = useState<string | null>(null)

  const query = useQuery({
    queryKey: ['warehouse-items', { category, search, page, page_size: PAGE_SIZE }],
    queryFn: () =>
      api.warehouseItems({
        category,
        search,
        page,
        page_size: PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
  })

  const overview = useQuery({ queryKey: ['assets-overview'], queryFn: () => api.assetsOverview() })
  const detail = query.data?.items.find((item) => item.id === detailId) ?? null

  return (
    <div>
      <Reveal>
        <div className="mb-5 flex flex-wrap items-end gap-4">
          <div>
            <h1 className="font-display text-[26px] font-extrabold tracking-tight text-ink">共享仓库</h1>
            <p className="mt-1.5 text-[13.5px] text-mute">
              跨服务器同步的物品资产；目标服无法识别的物品会被拒绝取出，资产不会丢失。
            </p>
          </div>
          {overview.data && (
            <div className="ml-auto w-[220px]">
              <div className="mb-1.5 flex items-baseline justify-between text-[12px] text-mute">
                <span>容量</span>
                <span className="font-semibold text-ink tabular-nums">
                  {fmtNum(overview.data.warehouse.used_slots)} / {fmtNum(overview.data.warehouse.total_slots)} 格
                </span>
              </div>
              <Meter ratio={overview.data.warehouse.used_slots / overview.data.warehouse.total_slots} />
            </div>
          )}
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>物品清单</CardTitle>
            <Badge tone="neutral">{query.data ? `${query.data.total} 类` : '…'}</Badge>
            <div className="ml-auto w-full max-w-[240px] pb-1">
              <SearchInput
                value={search}
                onChange={(value) => {
                  setSearch(value)
                  setPage(1)
                }}
                placeholder="搜索物品名…"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <FilterTabs
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={(value) => {
                setCategory(value)
                setPage(1)
              }}
              className="mb-4"
            />

            {query.data ? (
              query.data.items.length === 0 ? (
                <EmptyState
                  icon={PackageSearch}
                  title="没有匹配的物品"
                  description="换个分类或关键词试试；新存入的物品会出现在这里。"
                />
              ) : (
                <div className="divide-y divide-line">
                  {query.data.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDetailId(item.id)}
                      className="flex w-full items-center gap-3.5 rounded-xl px-3 py-[11px] text-left transition-colors hover:bg-[#f8f8f6]"
                    >
                      <span className="grid h-11 w-11 flex-none place-items-center rounded-[11px] border border-line bg-[#f2f2ef]">
                        <PixelIconInline name={item.name} />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
                          {item.rare && <span className="text-grape">◆</span>}
                          {item.name}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-faint">
                          <span className="rounded-full bg-ink/[0.06] px-2 py-px">{CATEGORY_LABEL[item.category]}</span>
                          {item.source_server} 存入 · {relTime(item.updated_at)}
                        </div>
                      </div>
                      <span className="ml-auto font-display text-[14px] font-bold text-mute tabular-nums">
                        × {fmtNum(item.count)}
                      </span>
                      <span className="text-[12px] text-faint">详情 ›</span>
                    </button>
                  ))}
                </div>
              )
            ) : (
              <div className="space-y-2.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[62px]" />
                ))}
              </div>
            )}

            {query.data && (
              <Pagination page={query.data.page} pageSize={query.data.page_size} total={query.data.total} onChange={setPage} />
            )}
          </CardContent>
        </Card>
      </Reveal>

      <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetailId(null)}>
        <DialogContent>
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2.5">
                  <span className="grid h-11 w-11 place-items-center rounded-[11px] border border-line bg-[#f2f2ef]">
                    <PixelIconInline name={detail.name} />
                  </span>
                  <span>
                    {detail.rare && <span className="mr-1 text-grape">◆</span>}
                    {detail.name}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  {CATEGORY_LABEL[detail.category]} · 由 {detail.source_server} 存入 · {relTime(detail.updated_at)}
                </DialogDescription>
              </DialogHeader>

              <dl className="space-y-2.5 rounded-xl bg-paper px-4 py-3.5 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-faint">数量</dt>
                  <dd className="font-semibold tabular-nums">× {fmtNum(detail.count)}</dd>
                </div>
                {detail.note && (
                  <div className="flex justify-between gap-6">
                    <dt className="flex-none text-faint">备注</dt>
                    <dd className="text-right text-mute">{detail.note}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-faint">资产编号</dt>
                  <dd className="font-mono text-[12px] text-mute">{detail.id}</dd>
                </div>
              </dl>

              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-warn-line bg-warn-soft px-4 py-3 text-[12.5px] leading-relaxed text-warn-deep">
                <Info size={14} className="mt-0.5 flex-none" />
                <span>
                  取出需要在游戏内发起：目标服务器会校验本服是否支持该物品及数据，无法安全恢复时将拒绝取出。
                  Web 端不直接操作背包。
                </span>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

/** 缩略图与详情弹窗共用的像素图标呈现 */
function PixelIconInline({ name }: { name: string }) {
  return <PixelIcon name={itemPixel(name)} px={3.4} />
}
