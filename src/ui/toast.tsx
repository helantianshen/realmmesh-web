import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, TriangleAlert } from 'lucide-react'

type ToastTone = 'success' | 'info' | 'warn'

interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

interface ToastContextValue {
  toast: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const toast = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = nextId.current++
    setItems((prev) => [...prev, { id, message, tone }])
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 2600)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-7 z-[90] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.16, 0.84, 0.3, 1] }}
              className="pointer-events-auto flex max-w-[min(480px,90vw)] items-center gap-2.5 rounded-xl bg-ink px-5 py-3 text-[13px] font-medium text-white shadow-lg"
              role="status"
            >
              {item.tone === 'success' && <CheckCircle2 size={15} className="flex-none text-[#5fe0b0]" />}
              {item.tone === 'info' && <Info size={15} className="flex-none text-[#8fd4ff]" />}
              {item.tone === 'warn' && <TriangleAlert size={15} className="flex-none text-[#f0c060]" />}
              <span>{item.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast 必须在 ToastProvider 内使用')
  return ctx
}
