import { Boxes, Clock4, PackageOpen } from 'lucide-react'
import { Outlet } from 'react-router-dom'

import { BrandLockup } from './brand'
import { Reveal } from './reveal'

/** 登录/注册的分屏布局：左侧品牌叙事 + 右侧表单（对应 B 原型） */
export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(380px,46%)_1fr]">
      <aside className="relative hidden overflow-hidden border-r border-line bg-[#fbfaf8] p-[56px] lg:flex lg:flex-col">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(700px 420px at 88% -6%, #e2f4ec 0%, transparent 60%), radial-gradient(560px 380px at -10% 106%, #eef0fb 0%, transparent 55%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(23,24,26,0.08) 1px, transparent 1.2px)',
            backgroundSize: '22px 22px',
            maskImage: 'linear-gradient(200deg, #000 20%, transparent 62%)',
            WebkitMaskImage: 'linear-gradient(200deg, #000 20%, transparent 62%)',
          }}
        />
        <BrandCubes />
        <div className="relative">
          <Reveal delay={0.05}>
            <BrandLockup />
          </Reveal>
        </div>
        <Reveal delay={0.12} className="relative mt-auto">
          <h1 className="max-w-[13em] font-display text-[clamp(30px,3.4vw,42px)] font-extrabold leading-[1.22] tracking-tight text-ink">
            一个账户，
            <br />
            走遍
            <em className="not-italic text-em">所有服务器</em>。
          </h1>
        </Reveal>
        <div className="relative mt-8 mb-auto grid max-w-[400px] gap-3.5">
          {[
            { icon: Boxes, title: '统一中心账户', desc: '玩家名即账户，所有接入服务器共用一套凭据。' },
            { icon: PackageOpen, title: '跨服共享仓库', desc: '在生存服存入的钻石，到模组服也能取出。' },
            { icon: Clock4, title: '离线资产管理', desc: '不进游戏，网页端随时查看余额与流转记录。' },
          ].map((f, i) => (
            <Reveal key={f.title} delay={0.2 + i * 0.06}>
              <div className="flex items-start gap-3">
                <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-[9px] border border-line bg-card text-em shadow-sm">
                  <f.icon size={14} strokeWidth={2} />
                </span>
                <div>
                  <div className="text-[14px] font-semibold text-ink">{f.title}</div>
                  <div className="mt-0.5 text-[12.5px] leading-relaxed text-mute">{f.desc}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="relative mt-11 flex gap-4 text-[12px] text-faint">
          <span>静态风格原型 · 风格 B 实现</span>
          <span>不含真实业务逻辑</span>
        </div>
      </aside>

      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px] lg:hidden lg:mb-8">
          <div className="mb-8">
            <BrandLockup />
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  )
}

/** 品牌区右侧的立方体线稿装饰 */
function BrandCubes() {
  return (
    <svg
      viewBox="0 0 340 340"
      fill="none"
      aria-hidden
      className="absolute -right-10 top-[70px] h-[340px] w-[340px] opacity-90"
    >
      <g stroke="#0d9d6c" strokeWidth="1.4" opacity=".55">
        <path d="M170 60 258 110v100L170 260 82 210V110Z" />
        <path d="M82 110l88 50 88-50M170 160v100" opacity=".7" />
      </g>
      <g stroke="#17181a" opacity=".18" strokeWidth="1.2">
        <path d="M170 20 210 43M170 20 130 43M40 250l42 24M300 250l-42 24M60 120v30M280 90v30" />
        <circle cx="170" cy="14" r="3.5" />
        <circle cx="52" cy="108" r="3.5" />
        <circle cx="288" cy="78" r="3.5" />
        <circle cx="36" cy="256" r="3.5" />
        <circle cx="304" cy="256" r="3.5" />
      </g>
      <rect x="236" y="196" width="44" height="44" rx="9" stroke="#6d5ce8" strokeWidth="1.4" opacity=".4" />
      <circle cx="76" cy="160" r="18" stroke="#0d9d6c" strokeWidth="1.4" opacity=".35" />
    </svg>
  )
}
