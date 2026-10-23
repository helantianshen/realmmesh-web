import { cn } from '@/lib/utils'

export function CubeMark({ size = 33, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn('grid flex-none place-items-center rounded-[10px] bg-ink shadow-md', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none" stroke="#5fe0b0" strokeWidth="1.7" strokeLinejoin="round">
        <path d="M12 2.5 21 7.5v9L12 21.5 3 16.5v-9L12 2.5Z" />
        <path d="M3 7.5 12 12.5l9-5M12 12.5v9" opacity=".7" />
      </svg>
    </div>
  )
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <CubeMark size={compact ? 33 : 42} />
      <div>
        <div className={cn('font-display font-extrabold tracking-tight text-ink', compact ? 'text-[16px]' : 'text-[19px]')}>
          Realm<em className="not-italic text-em">Mesh</em>
        </div>
        {!compact && <div className="mt-0.5 text-[11px] tracking-[0.34em] text-faint">领域网格</div>}
      </div>
    </div>
  )
}
