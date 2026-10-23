import { useQuery } from '@tanstack/react-query'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  ChevronRight,
  Server,
  ShieldCheck,
  Coins,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { ActivityIcon } from '@/components/activity-icon'
import { PixelIcon, type PixelName } from '@/components/pixel-icon'
import { Meter } from '@/components/meter'
import { Reveal } from '@/components/reveal'
import { StatCard } from '@/components/stat-card'
import { StatusDot } from '@/components/status-badge'
import { api } from '@/lib/api'
import { fmtNum, greeting, relTime } from '@/lib/format'
import { useAuth } from '@/hooks/auth'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog'
import { Skeleton } from '@/ui/skeleton'
import { useToast } from '@/ui/toast'

/** 物品名到像素图样的映射：新增物品时在 pix-data 补图样即可 */
const ITEM_PIX: Record<string, PixelName> = {
  钻石: 'diamond',
  金锭: 'gold',
  绿宝石: 'emerald',
  下界合金锭: 'netherite',
  末影珍珠: 'pearl',
  '喷溅治疗药水': 'potion',
  '附魔书 · 经验修补': 'book',
  白色混凝土: 'concrete',
  铁块: 'chest',
  望远镜: 'pearl',
  面包: 'chest',
  TNT: 'tnt',
}

export function itemPixel(name: string): PixelName {
  return ITEM_PIX[name] ?? 'chest'
}

/** 存入/取出均需游戏服执行：Web 端以说明弹窗呈现边界，不做假操作 */
function GameActionDialog({
  open,
  onOpenChange,
  mode,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'in' | 'out'
}) {
  const isIn = mode === 'in'
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isIn ? '存入物品需要在游戏内操作' : '取出物品需要在游戏内操作'}</DialogTitle>
          <DialogDescription>
            {isIn
              ? '物品从背包进入中心仓库由游戏服务器执行校验与扣除，Web 端不直接操作背包。'
              : '取出时目标服务器需确认本服支持该物品及其数据，无法识别的物品会被拒绝取出，中心资产不会丢失。'}
          </DialogDescription>
        </DialogHeader>
        <ol className="space-y-2.5 rounded-xl bg-paper px-4 py-3.5 text-[12.5px] leading-relaxed text-mute">
          <li>
            <b className="font-semibold text-ink">1.</b> 进入任意接入 RealmMesh 的服务器并登录中心账户
          </li>
          <li>
            <b className="font-semibold text-ink">2.</b> 使用模组命令{' '}
            <code className="rounded bg-card px-1.5 py-0.5 font-mono text-[11.5px] text-em-deep">
              /realmmesh {isIn ? 'deposit' : 'withdraw'}
            </code>{' '}
            发起{isIn ? '存入' : '取出'}
          </li>
          <li>
            <b className="font-semibold text-ink">3.</b> 服务器校验通过后，本页资产与动态会自动更新
          </li>
        </ol>
      </DialogContent>
    </Dialog>
  )
}

export function OverviewPage() {
  const { auth } = useAuth()
  const { toast } = useToast()
  const [gameAction, setGameAction] = useState<'in' | 'out' | null>(null)

  const overview = useQuery({ queryKey: ['assets-overview'], queryFn: () => api.assetsOverview() })
  const items = useQuery({
    queryKey: ['warehouse-items', { page: 1, page_size: 6 }],
    queryFn: () => api.warehouseItems({ page: 1, page_size: 6 }),
  })
  const activity = useQuery({
    queryKey: ['activity', { page: 1, page_size: 4, type: 'all' }],
    queryFn: () => api.activityList({ page: 1, page_size: 4, type: 'all' }),
  })
  const servers = useQuery({ queryKey: ['player-servers'], queryFn: () => api.playerServers() })

  const data = overview.data

  return (
    <div className="space-y-4">
      <Reveal>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <h1 className="font-display text-[26px] font-extrabold tracking-tight text-ink">
              {greeting()}，{auth?.account.player_name}
            </h1>
            <p className="mt-1.5 text-[13.5px] text-mute">你的跨服资产一切正常，最后同步于 2 分钟前。</p>
          </div>
          <div className="ml-auto flex gap-2.5">
            <Button
              variant="primary"
              onClick={() => {
                setGameAction('in')
                toast('存入入口已在游戏中提供，见弹窗说明', 'info')
              }}
            >
              <ArrowDownToLine size={14} /> 存入物品
            </Button>
            <Button variant="outline" onClick={() => setGameAction('out')}>
              <ArrowUpFromLine size={14} /> 取出物品
            </Button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data ? (
            <>
              <StatCard
                icon={Coins}
                label="虚拟货币"
                value={fmtNum(data.balance)}
                unit="金币"
                footer={
                  <>
                    本周 <b className="font-semibold text-em-deep">+{fmtNum(data.balance_week_delta)}</b> · 含登录奖励
                  </>
                }
              />
              <StatCard
                icon={Boxes}
                iconTone="violet"
                label="共享仓库"
                value={fmtNum(data.warehouse.used_slots)}
                unit={`/ ${fmtNum(data.warehouse.total_slots)} 格`}
                footer={
                  <Meter
                    ratio={data.warehouse.used_slots / data.warehouse.total_slots}
                    className="mt-[9px] w-[150px]"
                  />
                }
              />
              <StatCard
                icon={Server}
                iconTone="amber"
                label="接入服务器"
                value={String(data.servers_online)}
                unit={`/ ${data.servers_total} 在线`}
                footer="模组服维护中，其余正常"
              />
              <StatCard
                icon={ShieldCheck}
                label="本月流转"
                value={fmtNum(data.month_txns)}
                unit="笔"
                footer={`存入 ${data.month_in} · 取出 ${data.month_out} · 无失败退库`}
              />
            </>
          ) : (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[122px] rounded-card" />)
          )}
        </div>
      </Reveal>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.9fr_1fr]">
        <div className="space-y-4">
          <Reveal delay={0.12}>
            <Card>
              <CardHeader>
                <CardTitle>共享仓库</CardTitle>
                <Badge tone="neutral">跨服同步</Badge>
                <Link to="/warehouse" className="ml-auto flex items-center gap-1 text-[12.5px] font-semibold text-em-deep hover:underline">
                  全部物品 <ChevronRight size={13} />
                </Link>
              </CardHeader>
              <CardContent className="pt-3.5">
                {items.data ? (
                  <div className="divide-y divide-line">
                    {items.data.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3.5 rounded-xl px-3 py-[11px] transition-colors hover:bg-[#f8f8f6]">
                        <span className="grid h-11 w-11 flex-none place-items-center rounded-[11px] border border-line bg-[#f2f2ef]">
                          <PixelIcon name={itemPixel(item.name)} px={3.4} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
                            {item.rare && <span className="text-grape">◆</span>}
                            {item.name}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-faint">
                            <span className="rounded-full bg-ink/[0.06] px-2 py-px">
                              {item.category === 'mat' ? '材料' : item.category === 'tool' ? '工具' : item.category === 'build' ? '建筑' : item.category === 'redstone' ? '红石' : '消耗品'}
                            </span>
                            {item.source_server} · {relTime(item.updated_at)}
                          </div>
                        </div>
                        <span className="ml-auto font-display text-[14px] font-bold text-mute tabular-nums">
                          × {fmtNum(item.count)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-[62px]" />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={0.18}>
            <Card>
              <CardHeader>
                <CardTitle>近期动态</CardTitle>
                <Link to="/activity" className="ml-auto flex items-center gap-1 text-[12.5px] font-semibold text-em-deep hover:underline">
                  全部记录 <ChevronRight size={13} />
                </Link>
              </CardHeader>
              <CardContent className="pt-3.5">
                {activity.data ? (
                  <div className="relative space-y-3.5">
                    {activity.data.items.map((record) => (
                      <div key={record.id} className="flex items-start gap-3.5">
                        <ActivityIcon type={record.type} />
                        <div className="min-w-0 pt-0.5">
                          <div className="text-[13.5px] text-ink">
                            <b className="font-semibold">{record.title}</b>
                            {record.server_name && <span className="text-faint"> · {record.server_name}</span>}
                          </div>
                          {record.detail && <div className="mt-0.5 text-[12px] text-faint">{record.detail}</div>}
                        </div>
                        <span className="ml-auto whitespace-nowrap pt-1 text-[12px] text-faint">{relTime(record.time)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-8" />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </Reveal>
        </div>

        <div className="space-y-4">
          <Reveal delay={0.15}>
            <Card>
              <CardHeader>
                <CardTitle>接入服务器</CardTitle>
                <Badge tone="emerald">
                  {data ? `${data.servers_online} / ${data.servers_total} 在线` : '…'}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-1 pt-2">
                {servers.data ? (
                  servers.data.map((server) => (
                    <div key={server.id} className="flex items-center gap-3 rounded-[10px] px-2.5 py-[11px] transition-colors hover:bg-[#f8f8f6]">
                      <StatusDot online={server.status === 'online'} />
                      <div>
                        <div className="text-[13px] font-semibold text-ink">{server.title}</div>
                        <div className="mt-0.5 text-[11.5px] text-faint">
                          {server.name} · {server.status === 'online' ? '在线' : '维护中'}
                        </div>
                      </div>
                      <span className="ml-auto font-display text-[12.5px] font-semibold text-mute tabular-nums">
                        {server.ping_ms !== null ? `${server.ping_ms}ms` : '—'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="space-y-2.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-11" />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={0.21}>
            <Card>
              <CardHeader>
                <CardTitle>账户安全</CardTitle>
                <Link to="/security" className="ml-auto flex items-center gap-1 text-[12.5px] font-semibold text-em-deep hover:underline">
                  安全中心 <ChevronRight size={13} />
                </Link>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-3.5 text-[12.5px] leading-relaxed text-mute">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck size={13} className="mt-1 flex-none text-em" />
                  <span>登录失败计数跨服务器共享，休息期结束后自动从零重新计数。</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck size={13} className="mt-1 flex-none text-em" />
                  <span>修改密码成功后，所有已连接服务器上的该账户将被踢出。</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck size={13} className="mt-1 flex-none text-em" />
                  <span>Web 会话有效期 2 小时，期间无需重复登录。</span>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>

      <GameActionDialog open={gameAction !== null} onOpenChange={(open) => !open && setGameAction(null)} mode={gameAction ?? 'in'} />
    </div>
  )
}
