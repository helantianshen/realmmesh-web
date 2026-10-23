import {
  ArrowLeft,
  KeyRound,
  LayoutDashboard,
  ScrollText,
  Server,
  UsersRound,
  Settings2,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { BrandLockup } from '@/components/brand'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/auth'

const NAV = [
  { to: '/admin', label: '概览', icon: LayoutDashboard, end: true },
  { to: '/admin/servers', label: '服务器凭证', icon: KeyRound },
  { to: '/admin/accounts', label: '账户管理', icon: UsersRound },
  { to: '/admin/config', label: '系统配置', icon: Settings2 },
  { to: '/admin/audit', label: '审计日志', icon: ScrollText },
]

/** 管理后台框架：左侧导航 + 内容区；B 风格浅色，密级信息展示遵循一次性交付原则 */
export function AdminLayout() {
  const { auth } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-[228px] flex-none flex-col border-r border-line bg-[#fbfaf8] px-3.5 py-5">
        <div className="px-2.5 pb-4">
          <BrandLockup compact />
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] font-medium transition-colors',
                  isActive
                    ? 'bg-ink/[0.055] font-semibold text-ink shadow-[inset_2px_0_0_var(--color-em)]'
                    : 'text-mute hover:bg-ink/[0.04] hover:text-ink',
                )
              }
            >
              <item.icon size={16} strokeWidth={1.9} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] font-medium text-mute transition-colors hover:bg-ink/[0.04] hover:text-ink"
          >
            <ArrowLeft size={16} strokeWidth={1.9} />
            返回玩家端
          </button>
          <div className="rounded-xl border border-line bg-card px-3.5 py-3 text-[11px] leading-relaxed text-faint">
            <div className="flex items-center gap-1.5 font-semibold text-mute">
              <Server size={12} /> 管理身份
            </div>
            <div className="mt-1.5 font-mono">{auth?.account.player_name}</div>
            <div className="mt-0.5">操作将记入审计日志</div>
          </div>
        </div>
      </aside>

      {/* 同玩家端：恒定可滚动，滚动条常驻，路由切换零水平跳动 */}
      <main className="min-h-[calc(100vh+1px)] min-w-0 flex-1 bg-paper">
        <Outlet />
      </main>
    </div>
  )
}
