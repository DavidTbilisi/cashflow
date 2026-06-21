import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { useDiscoveryStore } from '../../store/discoveryStore'
import { useUIStore } from '../../store/uiStore'
import { principleById, SURFACE_LABELS } from '../../domain/data/principles'

/**
 * Bottom-left stack of "principle discovered" toasts. Each appears when a new
 * principle is encountered in play, auto-dismisses, and opens the Codex on tap.
 */
export function PrincipleToast() {
  const queue = useDiscoveryStore((s) => s.toastQueue)
  const clearToast = useDiscoveryStore((s) => s.clearToast)
  const setCodex = useUIStore((s) => s.setCodex)

  const shown = queue.slice(0, 3) // cap visible; the rest stagger in as these clear

  return (
    <div className="fixed left-3 bottom-3 z-50 flex flex-col gap-2" style={{ pointerEvents: 'none' }}>
      <AnimatePresence>
        {shown.map((id) => (
          <ToastItem key={id} id={id} onDone={() => clearToast(id)} onOpen={() => { clearToast(id); setCodex(true) }} />
        ))}
      </AnimatePresence>
    </div>
  )
}

/** Toasts linger for 10s, then auto-dismiss (or close immediately via the ✕). */
const TOAST_TTL_MS = 10_000

function ToastItem({ id, onDone, onOpen }: { id: string; onDone: () => void; onOpen: () => void }) {
  const p = principleById(id)
  useEffect(() => {
    const t = setTimeout(onDone, TOAST_TTL_MS)
    return () => clearTimeout(t)
  }, [onDone])
  if (!p) return null
  return (
    <motion.div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      initial={{ opacity: 0, x: -36, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -36, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 360, damping: 26 }}
      className="arcade-clip-sm text-left px-3 py-2 max-w-[280px]"
      style={{
        pointerEvents: 'auto',
        background: 'var(--color-card)',
        border: '1px solid var(--color-gold)',
        boxShadow: '0 0 18px rgba(255,201,60,0.35), inset 0 0 10px rgba(255,201,60,0.08)',
        cursor: 'pointer',
      }}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <span aria-hidden>📖</span>
        <span className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--color-gold)' }}>
          Principle discovered
        </span>
        <span
          className="ml-auto text-[8px] font-bold uppercase tracking-wider px-1 py-0.5"
          style={{ color: 'var(--color-fog)', border: '1px solid var(--color-rim)', borderRadius: '2px' }}
        >
          {SURFACE_LABELS[p.surface]}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onDone() }}
          aria-label="Dismiss"
          title="Dismiss"
          className="flex items-center justify-center transition-colors"
          style={{
            width: '16px', height: '16px', flexShrink: 0,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--color-fog)', fontSize: '13px', lineHeight: 1,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-snow)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-fog)' }}
        >
          ✕
        </button>
      </div>
      <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--color-snow)', fontFamily: 'var(--font-ui)' }}>
        {p.name}
      </p>
      <p className="text-[10.5px] leading-snug mt-0.5" style={{ color: 'var(--color-mist)' }}>
        {p.oneLiner}
      </p>
    </motion.div>
  )
}
