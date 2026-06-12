import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'
import { useActiveShortcuts } from '../../hooks/useGameShortcuts'
import type { ActiveShortcut, ShortcutGroup } from '../../hooks/gameShortcuts'

const GROUP_ORDER: ShortcutGroup[] = ['Turn', 'Choice', 'Card', 'Dev']

export function ShortcutHelp() {
  const open = useUIStore((s) => s.helpOpen)
  const setHelp = useUIStore((s) => s.setHelp)
  const shortcuts = useActiveShortcuts()

  // Group the currently-active shortcuts; collapse the dev group label nicely.
  const groups = GROUP_ORDER.map((g) => ({
    group: g,
    items: shortcuts.filter((s) => s.group === g),
  })).filter((g) => g.items.length > 0)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-[60]"
          style={{ background: 'rgba(7,10,18,0.82)', backdropFilter: 'blur(4px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setHelp(false)}
        >
          <motion.div
            className="max-w-md w-full mx-4 overflow-hidden shadow-2xl"
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-rim)', borderRadius: '6px' }}
            initial={{ scale: 0.9, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 16 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-3" style={{ borderBottom: '1px solid var(--color-rim)' }}>
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-snow)' }}>
                Keyboard Shortcuts
              </h2>
              <span className="text-[11px]" style={{ color: 'var(--color-fog)' }}>active now</span>
            </div>

            <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {groups.length === 0 && (
                <p className="text-sm py-4 text-center" style={{ color: 'var(--color-fog)' }}>
                  No shortcuts available right now.
                </p>
              )}
              {groups.map(({ group, items }) => (
                <div key={group}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-fog)' }}>
                    {group === 'Dev' ? 'Developer' : group}
                  </p>
                  <div className="space-y-1.5">
                    {items.map((s) => <Row key={s.id} s={s} />)}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-rim)' }}>
              <span className="text-[11px]" style={{ color: 'var(--color-fog)' }}>
                <Key>↵</Key> / <Key>Space</Key> always = primary action · <Key>Esc</Key> = dismiss
              </span>
              <button
                onClick={() => setHelp(false)}
                className="text-[11px] px-2.5 py-1 transition-opacity hover:opacity-80"
                style={{ border: '1px solid var(--color-rim)', color: 'var(--color-mist)', borderRadius: '3px', background: 'transparent', cursor: 'pointer' }}
              >
                Close <Key>?</Key>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Row({ s }: { s: ActiveShortcut }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: 'var(--color-mist)' }}>{s.description}</span>
      <Key>{s.badge}</Key>
    </div>
  )
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="inline-block text-[11px] font-mono px-1.5 py-0.5 leading-none"
      style={{ border: '1px solid var(--color-wire)', color: 'var(--color-mist)', borderRadius: '3px', background: 'rgba(255,255,255,0.03)' }}
    >
      {children}
    </kbd>
  )
}
