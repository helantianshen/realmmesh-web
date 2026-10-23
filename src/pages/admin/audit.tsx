import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ScrollText } from 'lucide-react'
import { useState } from 'react'

import { EmptyState } from '@/components/empty-state'
import { FilterTabs } from '@/components/filter-tabs'
import { Pagination } from '@/components/pagination'
import { Reveal } from '@/components/reveal'
import { SearchInput } from '@/components/search-input'
import { api } from '@/lib/api'
import { fmtDateTime } from '@/lib/format'
import { Badge } from '@/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Skeleton } from '@/ui/skeleton'

type ActorFilter = 'all' | 'player' | 'server' | 'admin' | 'system'

const ACTOR_OPTIONS: { value: ActorFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'player', label: '玩家' },
  { value: 'server', label: '服务器' },
  { value: 'admin', label: '管理员' },
  { value: 'system', label: '系统' },
]

const PAGE_SIZE = 10

const EVENT_LABEL: Record<string, string> = {
  'player.join': '进服',
  'player.leave': '离服',
  'auth.login': '登录',
  'auth.cooldown': '休息期触发',
  'account.register': '注册',
  'account.password_changed': '改密',
  'account.delete': '账户删除',
  'warehouse.in': '仓库存入',
  'warehouse.out': '仓库取出',
  'server.create': '服务器创建',
  'server.rotate_secret': '凭证轮换',
  'server.set_enabled': '服务器启用',
  'server.set_disabled': '服务器停用',
  'server.delete': '服务器删除',
  'server.registered': '服务器接入',
  'config.update': '配置调整',
  'config.hot_reload': '配置热更新',
}

export function AdminAuditPage() {
  const [actor, setActor] = useState<ActorFilter>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const query = useQuery({
    queryKey: ['admin-audit', { search, page, page_size: PAGE_SIZE }],
    queryFn: () => api.adminAudit({ search, page, page_size: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  })

  const filtered =
    query.data?.items.filter((event) => actor === 'all' || event.actor_type === actor) ?? []

  return (
    <div className="mx-auto max-w-[960px] px-7 py-8">
      <Reveal>
        <div className="mb-5">
          <h1 className="font-display text-[24px] font-extrabold tracking-tight text-ink">审计日志</h1>
          <p className="mt-1.5 text-[13px] text-mute">
            进离服、认证、资产流转与管理操作的只读记录；不记录密码与密钥。
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>事件流</CardTitle>
            <Badge tone="neutral">{query.data ? `${query.data.total} 条` : '…'}</Badge>
            <div className="ml-auto w-full max-w-[240px] pb-1">
              <SearchInput
                value={search}
                onChange={(value) => {
                  setSearch(value)
                  setPage(1)
                }}
                placeholder="搜索操作者 / 服务器 / 详情…"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <FilterTabs
              options={ACTOR_OPTIONS}
              value={actor}
              onChange={setActor}
              className="mb-4"
            />

            {query.data ? (
              filtered.length === 0 ? (
                <EmptyState icon={ScrollText} title="没有匹配的审计记录" description="调整筛选或搜索词试试。" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-line text-[11px] uppercase tracking-wider text-faint">
                        <th className="py-2.5 pr-4 font-medium">时间</th>
                        <th className="py-2.5 pr-4 font-medium">来源</th>
                        <th className="py-2.5 pr-4 font-medium">操作者</th>
                        <th className="py-2.5 pr-4 font-medium">事件</th>
                        <th className="py-2.5 pr-3 font-medium">详情</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((event) => (
                        <tr key={event.id} className="border-b border-line transition-colors last:border-none hover:bg-[#f8f8f6]">
                          <td className="whitespace-nowrap py-3 pr-4 text-[12px] text-faint tabular-nums">
                            {fmtDateTime(event.time)}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge tone={event.actor_type === 'admin' ? 'violet' : event.actor_type === 'server' ? 'emerald' : 'neutral'}>
                              {event.actor_type === 'admin' ? '管理员' : event.actor_type === 'server' ? '服务器' : event.actor_type === 'system' ? '系统' : '玩家'}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4 font-mono text-[12.5px] font-semibold text-ink">{event.actor_name}</td>
                          <td className="py-3 pr-4">
                            <span className="rounded-full bg-ink/[0.05] px-2.5 py-1 text-[11.5px] font-medium text-mute">
                              {EVENT_LABEL[event.event] ?? event.event}
                            </span>
                          </td>
                          <td className="py-3 pr-3 text-[12.5px] text-mute">
                            {event.server_name && <span className="text-faint">{event.server_name} · </span>}
                            {event.detail ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="space-y-2.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-[52px]" />
                ))}
              </div>
            )}

            {query.data && (
              <Pagination
                page={query.data.page}
                pageSize={query.data.page_size}
                total={search.trim() ? filtered.length : query.data.total}
                onChange={setPage}
              />
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  )
}
