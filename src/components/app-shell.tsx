import { useQuery } from '@tanstack/react-query'
import { Bell, ChevronDown, LogOut, ShieldCheck, LayoutDashboard } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { PixelIcon } from '@/components/pixel-icon'
import { BrandLockup } from '@/components/brand'
import { api } from '@/lib/api'
import { fmtNum } from '@/lib/format'
import { initialsOf, cn } from '@/lib/utils'
import { useAuth } from '@/hooks/auth'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip'

const NAV = [
  { to: '/', label: '总览', end: true },
  { to: '/warehouse', label: '仓库' },
  { to: '/activity', label: '动态' },
  { to: '/servers', label: '服务器' },
  { to: '/security', label: '安全' },
]

/** 玩家端框架：顶栏导航 + 内容区（对应 B 原型总览布局） */
export function AppShell() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()

  const overview = useQuery({
    queryKey: ['assets-overview'],
    queryFn: () => api.assetsOverview(),
  })

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-card/85 backdrop-blur-md">
        <div className="mx-auto flex h-[62px] max-w-[1160px] items-center gap-8 px-7">
          <BrandLockup compact />

          <nav className="hidden items-center gap-0.5 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'relative rounded-[9px] px-3.5 py-2 text-[13.5px] font-semibold transition-colors',
                    isActive ? 'text-ink' : 'text-mute hover:bg-ink/[0.045] hover:text-ink',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    <span
                      className={cn(
                        'absolute inset-x-3.5 bottom-[2px] h-[2px] rounded-full bg-em transition-opacity',
                        isActive ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {overview.data && (
              <div className="hidden items-center gap-2 rounded-full border border-em-line bg-em-soft px-3.5 py-[7px] text-[13px] font-semibold text-em-deep sm:flex tabular-nums">
                <PixelIcon name="diamond" px={2.6} />
                {fmtNum(overview.data.balance)}
              </div>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-[10px] text-mute transition-colors hover:bg-ink/5 hover:text-ink"
                  aria-label="通知"
                >
                  <Bell size={17} strokeWidth={1.8} />
                </button>
              </TooltipTrigger>
              <TooltipContent>暂无新通知</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2.5 rounded-full border border-line bg-card py-1 pl-1 pr-3 shadow-sm transition-colors hover:border-line-2"
                >
                  <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-gradient-to-br from-em to-[#0aa0b8] text-[11px] font-bold text-white">
                    {initialsOf(auth?.account.player_name ?? 'RM')}
                  </span>
                  <span className="hidden text-[13px] font-semibold text-ink sm:block">{auth?.account.player_name}</span>
                  <ChevronDown size={14} className="text-faint" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => navigate('/security')}>
                  <ShieldCheck size={15} /> 安全中心
                </DropdownMenuItem>
                {auth?.account.is_admin && (
                  <DropdownMenuItem onSelect={() => navigate('/admin')}>
                    <LayoutDashboard size={15} /> 管理后台
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={logout} className="text-danger-deep data-[highlighted]:text-danger-deep">
                  <LogOut size={15} /> 退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* 高出视口 1px 让垂直滚动条在所有路由常驻，避免页面切换时滚动条
          出现/消失引起顶栏水平跳动；62px 为顶栏高度 */}
      <main className="mx-auto min-h-[calc(100vh-61px)] max-w-[1160px] px-7 pb-20 pt-[30px]">
        <Outlet />
      </main>
    </div>
  )
}
