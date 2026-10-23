import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'

import { cn } from '@/lib/utils'

/** 一次性凭证等敏感值的复制框：等宽字体 + 复制反馈 */
export function CopyField({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(timer)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      /* 剪贴板不可用时静默失败，仅给视觉反馈 */
    }
    setCopied(true)
  }

  return (
    <button
      type="button"
      onClick={copy}
      title="点击复制"
      className={cn(
        'flex w-full items-center gap-2.5 rounded-xl border border-line-2 bg-paper px-3.5 py-3 text-left font-mono text-[13px] text-ink transition-colors hover:border-em',
        className,
      )}
    >
      <span className="min-w-0 flex-1 truncate">{value}</span>
      {copied ? <Check size={15} className="flex-none text-em" /> : <Copy size={15} className="flex-none text-faint" />}
    </button>
  )
}
