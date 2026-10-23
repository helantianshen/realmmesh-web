import { useQuery } from '@tanstack/react-query'
import { Hammer, ServerCog } from 'lucide-react'

import { Reveal } from '@/components/reveal'
import { StatusBadge, StatusDot } from '@/components/status-badge'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Badge } from '@/ui/badge'
import { Skeleton } from '@/ui/skeleton'

/** 延迟迷你柱：静态展示近期采样（mock 数据），接入真实接口后替换为采样序列 */
function SparkBars({ base }: { base: number }) {
  const bars = [0.6, 1, 0.45, 0.85, 0.7].map((k, i) => Math.round(base * k + i))
  const max = Math.max(...bars)
  return (
    <div className="flex h-[18px] items-end gap-[3px]">
      {bars.map((value, i) => (
        <i
          key={i}
          className={'w-[3.5px] rounded-sm ' + (i % 2 === 0 ? 'bg-em/70' : 'bg-line-2')}
          style={{ height: `${Math.max(20, (value / max) * 100)}%` }}
        />
      ))}
    </div>
  )
}

export function ServersPage() {
  const query = useQuery({ queryKey: ['player-servers'], queryFn: () => api.playerServers() })

  return (
    <div>
      <Reveal>
        <div className="mb-5">
          <h1 className="font-display text-[26px] font-extrabold tracking-tight text-ink">接入服务器</h1>
          <p className="mt-1.5 text-[13.5px] text-mute">
            由运营方接入 RealmMesh 的游戏服务器；同一中心账户可在任意接入服务器使用。
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {query.data ? (
          query.data.map((server, i) => (
            <Reveal key={server.id} delay={0.06 + i * 0.05}>
              <Card className="h-full hover:shadow-md">
                <CardContent className="flex h-full flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-em-soft text-em">
                      <ServerCog size={20} strokeWidth={1.9} />
                    </span>
                    <div>
                      <div className="text-[15px] font-bold text-ink">{server.title}</div>
                      <div className="mt-0.5 font-mono text-[11.5px] text-faint">{server.name}</div>
                    </div>
                    <div className="ml-auto">
                      <StatusBadge status={server.status} />
                    </div>
                  </div>

                  {server.status === 'online' ? (
                    <div className="flex items-center gap-3">
                      <StatusDot online />
                      <span className="text-[12.5px] text-mute">连接正常</span>
                      <div className="ml-auto flex items-center gap-2.5">
                        <SparkBars base={server.ping_ms ?? 0} />
                        <span className="font-display text-[13px] font-semibold text-ink tabular-nums">
                          {server.ping_ms}ms
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2.5 rounded-xl border border-warn-line bg-warn-soft px-3.5 py-3 text-[12.5px] leading-relaxed text-warn-deep">
                      <Hammer size={14} className="mt-0.5 flex-none" />
                      <span>维护中：暂时无法进服登录；已存入的中心资产不受影响，可正常在其他服务器取出。</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Reveal>
          ))
        ) : (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[148px] rounded-card" />)
        )}
      </div>

      <Reveal delay={0.3}>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>如何在我的服务器使用这些资产</CardTitle>
            <Badge tone="neutral">说明</Badge>
          </CardHeader>
          <CardContent className="grid gap-2.5 pt-3.5 text-[12.5px] leading-relaxed text-mute sm:grid-cols-3">
            <div className="rounded-xl bg-paper px-4 py-3.5">
              <b className="mb-1 block text-[13px] font-semibold text-ink">1 · 进服登录</b>
              每次进入接入服务器都需要登录中心账户；密码与网页端一致。
            </div>
            <div className="rounded-xl bg-paper px-4 py-3.5">
              <b className="mb-1 block text-[13px] font-semibold text-ink">2 · 游戏内存取</b>
              存入/取出由服务器执行：目标服无法识别的物品会被拒绝取出，中心资产不会丢失。
            </div>
            <div className="rounded-xl bg-paper px-4 py-3.5">
              <b className="mb-1 block text-[13px] font-semibold text-ink">3 · 离线管理</b>
              不进游戏也能在本页查看余额、仓库与流转记录；改密后所有在线会话将被踢出。
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  )
}
