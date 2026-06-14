import { useEffect, useState } from 'react'

interface Rect { top: number; left: number; width: number; height: number }

/**
 * Draws a pulsing ring around the element marked [data-tutorial="<target>"].
 * Re-measures on target change, on resize, and on a short interval (the target
 * can move as panels re-render). Renders nothing when the target isn't present.
 */
export function TutorialSpotlight({ target }: { target?: string }) {
  const [rect, setRect] = useState<Rect | null>(null)

  useEffect(() => {
    if (!target) {
      setRect(null)
      return
    }
    const measure = () => {
      const el = document.querySelector(`[data-tutorial="${target}"]`)
      if (!el) {
        setRect(null)
        return
      }
      const r = el.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    }
    measure()
    const id = window.setInterval(measure, 300)
    window.addEventListener('resize', measure)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('resize', measure)
    }
  }, [target])

  if (!target || !rect) return null

  const pad = 6
  return (
    <div
      className="fixed pointer-events-none z-[54] tutorial-ring"
      style={{
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
        border: '2px solid var(--color-gold)',
        borderRadius: '6px',
        boxShadow: '0 0 0 9999px rgba(7,10,18,0.55), 0 0 16px 2px rgba(200,150,60,0.6)',
        transition: 'top 0.2s, left 0.2s, width 0.2s, height 0.2s',
      }}
    />
  )
}
