import { useMemo } from 'react'

import { PIX } from './pix-data'
import { cn } from '@/lib/utils'

export type PixelName = keyof typeof PIX

interface PixelIconProps {
  name: PixelName
  /** 每像素边长（px） */
  px?: number
  className?: string
}

/** 像素图标：以 box-shadow 逐像素绘制，继承原型的手工像素图样 */
export function PixelIcon({ name, px = 3, className }: PixelIconProps) {
  const def = PIX[name]
  const { width, height, shadow } = useMemo(() => {
    if (!def) return { width: 0, height: 0, shadow: '' }
    const shadows: string[] = []
    def.rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const color = def.pal[row[x]]
        if (color) shadows.push(`${x * px}px ${y * px}px 0 ${color}`)
      }
    })
    return {
      width: (def.rows[0]?.length ?? 0) * px,
      height: def.rows.length * px,
      shadow: shadows.join(','),
    }
  }, [def, px])

  if (!def) return null

  return (
    <span className={cn('relative inline-block flex-none align-middle', className)} style={{ width, height }} aria-hidden>
      <i className="absolute left-0 top-0 block" style={{ width: px, height: px, boxShadow: shadow }} />
    </span>
  )
}
