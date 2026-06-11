import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { InfoContent, type ConceptInfo } from '../components/ui/conceptInfo'

const OFFSET = 16
const EDGE = 8

interface Props {
  info: ConceptInfo
  /** Cursor position in viewport (client) coordinates. */
  x: number
  y: number
}

/**
 * A tooltip anchored to a point (the cursor) rather than an element — used by
 * the Pixi board, whose tiles aren't DOM nodes. Portals to the body and flips
 * across the cursor when it would overflow the viewport.
 */
export function BoardTooltip({ info, x, y }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    let left = x + OFFSET
    let top = y + OFFSET
    if (left + r.width > vw - EDGE) left = x - r.width - OFFSET
    if (top + r.height > vh - EDGE) top = y - r.height - OFFSET
    left = Math.max(EDGE, left)
    top = Math.max(EDGE, top)
    setPos({ left, top })
  }, [x, y, info])

  return createPortal(
    <div
      ref={ref}
      role="tooltip"
      style={{
        position: 'fixed',
        left: pos?.left ?? x + OFFSET,
        top: pos?.top ?? y + OFFSET,
        maxWidth: 260,
        zIndex: 9999,
        opacity: pos ? 1 : 0,
        transition: 'opacity 140ms ease',
        pointerEvents: 'none',
        background: 'var(--color-card)',
        color: 'var(--color-snow)',
        border: '1px solid var(--color-wire)',
        borderRadius: '4px',
        boxShadow: '0 8px 26px rgba(0,0,0,0.55)',
        padding: '9px 11px',
        fontFamily: 'var(--font-ui)',
        fontSize: '12px',
        lineHeight: 1.45,
      }}
    >
      <InfoContent info={info} />
    </div>,
    document.body,
  )
}
