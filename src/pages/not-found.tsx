import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PixelIcon } from '@/components/pixel-icon'

export function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper px-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <PixelIcon name="chest" px={7} />
        <div>
          <h1 className="font-display text-[42px] font-extrabold tracking-tight text-ink">404</h1>
          <p className="mt-2 text-[13.5px] text-mute">这里没有你找的方块——页面不存在或已被移走。</p>
        </div>
        <Link
          to="/"
          className="inline-flex h-10 items-center gap-2 rounded-[11px] bg-ink px-4 text-[13.5px] font-semibold text-white shadow-md transition-colors hover:bg-black"
        >
          <ArrowLeft size={15} /> 回到总览
        </Link>
      </div>
    </div>
  )
}
