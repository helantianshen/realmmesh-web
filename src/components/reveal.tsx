import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/** 入场淡入：轻微位移 + 短时长，保证页面切换时整体稳定不漂移，delay 为秒 */
export function Reveal({ delay = 0, children, className }: { delay?: number; children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
