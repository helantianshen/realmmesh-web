import { useQuery, useQueryClient } from '@tanstack/react-query'
import { KeyRound, LogIn, Server, ShieldAlert, UsersRound, Boxes } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Reveal } from '@/components/reveal'
import { StatCard } from '@/components/stat-card'
import { StatusBadge } from '@/components/status-badge'
import { api } from '@/lib/api'
import { fmtNum, relTime } from '@/lib/format'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Skeleton } from '@/ui/skeleton'

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const stats = useQuery({ queryKey: ['admin-stats'], queryFn: () => api.adminStats() })
  const audit = useQuery({
    queryKey: ['admin-audit', { page: 1, page_size: 6 }],
    queryFn: () => api.adminAudit({ page: 1, page_size: 6 }),
  })
  const servers = useQuery({
    queryKey: ['admin-servers', { page: 1, page_size: 5 }],
    queryFn: () => api.adminServerList({ page: 1, page_size: 5 }),
  })

  return (
    <div className="mx-auto max-w-[960px] px-7 py-8">
      <Reveal>
        <div className="mb-6 flex flex-wrap items-end gap-4">
          <div>
            <h1 className="font-display text-[24px] font-extrabold tracking-tight text-ink">管理概览</h1>
            <p className="mt-1.5 text-[13px] text-mute">中心节点运行状况与今日运营数据（演示数据）。</p>
          </div>
          <div className="ml-auto flex gap-2.5">
            <Button variant="primary" onClick={() => navigate('/admin/servers')}>
              <KeyRound size={14} /> 服务器凭证
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/config')}>
              系统配置
            </Button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {stats.data ? (
            <>
              <StatCard
                icon={Server}
                label="接入服务器"
                value={String(stats.data.servers_online)}
                unit={`/ ${stats.data.servers_total} 启用`}
                footer={<button className="font-semibold text-em-deep hover:underline" onClick={() => navigate('/admin/servers')}>管理凭证 →</button>}
              />
              <StatCard
                icon={UsersRound}
                iconTone="violet"
                label="账户总数"
                value={fmtNum(stats.data.accounts_total)}
                footer={`含管理员；名字删除后仍占用`}
              />
              <StatCard
                icon={LogIn}
                iconTone="emerald"
                label="今日登录"
                value={fmtNum(stats.data.today_logins)}
                footer="游戏内 + Web 端"
              />
              <StatCard
                icon={ShieldAlert}
                iconTone="amber"
                label="休息期账户"
                value={String(stats.data.accounts_cooldown)}
                footer={
                  <button className="font-semibold text-warn-deep hover:underline" onClick={() => { void queryClient.invalidateQueries({ queryKey: ['admin-accounts'] }); navigate('/admin/accounts') }}>
                    查看账户 →
                  </button>
                }
              />
            </>
          ) : (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[122px] rounded-card" />)
          )}
        </div>
      </Reveal>

      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Reveal delay={0.12}>
          <Card>
            <CardHeader>
              <CardTitle>最近审计</CardTitle>
              <button className="ml-auto text-[12.5px] font-semibold text-em-deep hover:underline" onClick={() => navigate('/admin/audit')}>
                全部日志 →
              </button>
            </CardHeader>
            <CardContent className="divide-y divide-line pt-3">
              {audit.data ? (
                audit.data.items.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 py-2.5 text-[12.5px]">
                    <Badge tone={event.actor_type === 'admin' ? 'violet' : event.actor_type === 'server' ? 'emerald' : 'neutral'}>
                      {event.actor_type === 'admin' ? '管理员' : event.actor_type === 'server' ? '服务器' : event.actor_type === 'system' ? '系统' : '玩家'}
                    </Badge>
                    <span className="min-w-0 truncate text-ink">
                      <b className="font-semibold">{event.actor_name}</b>
                      <span className="text-faint"> · {event.detail ?? event.event}</span>
                    </span>
                    <span className="ml-auto flex-none whitespace-nowrap text-faint">{relTime(event.time)}</span>
                  </div>
                ))
              ) : (
                <div className="space-y-2.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-8" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.18}>
          <Card>
            <CardHeader>
              <CardTitle>服务器状态</CardTitle>
              <Boxes size={15} className="ml-auto text-faint" />
            </CardHeader>
            <CardContent className="space-y-1 pt-3">
              {servers.data ? (
                servers.data.items.map((server) => (
                  <div key={server.id} className="flex items-center gap-3 px-1.5 py-2">
                    <StatusBadge status={server.enabled ? 'enabled' : 'disabled'} />
                    <span className="text-[13px] font-medium text-ink">{server.server_name}</span>
                    <span className="ml-auto text-[11.5px] text-faint">
                      {server.last_seen_at ? `最近认证 ${relTime(server.last_seen_at)}` : '尚无认证记录'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="space-y-2.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-9" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  )
}
