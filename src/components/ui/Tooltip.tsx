import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import type { ReactElement, ReactNode } from 'react'
import { createPortal } from 'react-dom'

const GAP = 8 // px between trigger and tooltip
const EDGE = 8 // min px from viewport edge

type Placement = 'top' | 'bottom'

interface Pos {
  left: number
  top: number
  place: Placement
  arrow: number // arrow centre, relative to tooltip left edge
}

export interface TooltipProps {
  /** Rich content shown inside the tooltip card. */
  content: ReactNode
  /** Single host element (div/span/…) that triggers the tooltip on hover/focus. */
  children: ReactElement
  /** Delay before showing, in ms. Defaults to 3000 (3s) per design. */
  delay?: number
  /** Preferred side; auto-flips when there isn't room. */
  placement?: Placement
  /** Max width of the tooltip card in px. */
  maxWidth?: number
  /** When true the tooltip never opens (handlers still pass through). */
  disabled?: boolean
}

/**
 * Hover/focus tooltip with a configurable open delay (3s by default).
 *
 * Renders into a portal on `document.body` so it is never clipped by scrolling
 * or `overflow:hidden` ancestors, and positions itself via fixed coordinates
 * measured from the trigger. The trigger handlers are merged onto the child via
 * `cloneElement`, so no extra wrapper element is introduced into the layout.
 */
export function Tooltip({
  content,
  children,
  delay = 3000,
  placement = 'top',
  maxWidth = 260,
  disabled = false,
}: TooltipProps) {
  const triggerRef = useRef<HTMLElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<Pos | null>(null)
  const id = useId()

  const clearTimer = useCallback(() => {
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current)
      timerRef.current = undefined
    }
  }, [])

  const show = useCallback(() => {
    if (disabled) return
    clearTimer()
    timerRef.current = setTimeout(() => setOpen(true), delay)
  }, [clearTimer, delay, disabled])

  const hide = useCallback(() => {
    clearTimer()
    setOpen(false)
    setPos(null)
  }, [clearTimer])

  // Clear any pending timer on unmount.
  useEffect(() => () => clearTimer(), [clearTimer])

  // Measure + position once open (and keep it pinned on scroll/resize).
  useLayoutEffect(() => {
    if (!open) return

    const compute = () => {
      const trigger = triggerRef.current
      const tip = tooltipRef.current
      if (!trigger || !tip) return

      const t = trigger.getBoundingClientRect()
      const r = tip.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight

      let place: Placement = placement
      if (place === 'top' && t.top - r.height - GAP < EDGE) place = 'bottom'
      else if (place === 'bottom' && t.bottom + r.height + GAP > vh - EDGE) place = 'top'

      const top = place === 'top' ? t.top - r.height - GAP : t.bottom + GAP
      let left = t.left + t.width / 2 - r.width / 2
      left = Math.max(EDGE, Math.min(left, vw - r.width - EDGE))

      const arrow = Math.max(14, Math.min(t.left + t.width / 2 - left, r.width - 14))
      setPos({ left, top, place, arrow })
    }

    compute()
    window.addEventListener('scroll', compute, true)
    window.addEventListener('resize', compute)
    return () => {
      window.removeEventListener('scroll', compute, true)
      window.removeEventListener('resize', compute)
    }
  }, [open, placement])

  // Escape closes an open tooltip.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, hide])

  if (!isValidElement(children)) return children
  const child = children as ReactElement<Record<string, unknown>>
  const childProps = child.props

  const setTriggerRef = (node: HTMLElement | null) => {
    triggerRef.current = node
    const r = (child as unknown as { ref?: unknown }).ref
    if (typeof r === 'function') (r as (n: HTMLElement | null) => void)(node)
    else if (r && typeof r === 'object') (r as { current: unknown }).current = node
  }

  const wrap =
    <E,>(ours: () => void, theirs?: (e: E) => void) =>
    (e: E) => {
      theirs?.(e)
      ours()
    }

  const trigger = cloneElement(Children.only(child), {
    ref: setTriggerRef,
    onMouseEnter: wrap(show, childProps.onMouseEnter as ((e: unknown) => void) | undefined),
    onMouseLeave: wrap(hide, childProps.onMouseLeave as ((e: unknown) => void) | undefined),
    onFocus: wrap(show, childProps.onFocus as ((e: unknown) => void) | undefined),
    onBlur: wrap(hide, childProps.onBlur as ((e: unknown) => void) | undefined),
    'aria-describedby': open ? id : (childProps['aria-describedby'] as string | undefined),
  } as Record<string, unknown>)

  const arrowStyle =
    pos?.place === 'bottom'
      ? { top: -4, borderLeft: '1px solid var(--color-wire)', borderTop: '1px solid var(--color-wire)' }
      : { bottom: -4, borderRight: '1px solid var(--color-wire)', borderBottom: '1px solid var(--color-wire)' }

  return (
    <>
      {trigger}
      {open &&
        createPortal(
          <div
            ref={tooltipRef}
            id={id}
            role="tooltip"
            style={{
              position: 'fixed',
              left: pos?.left ?? -9999,
              top: pos?.top ?? -9999,
              maxWidth,
              zIndex: 9999,
              opacity: pos ? 1 : 0,
              transform: pos ? 'translateY(0)' : 'translateY(2px)',
              transition: 'opacity 140ms ease, transform 140ms ease',
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
            {content}
            <span
              aria-hidden
              style={{
                position: 'absolute',
                left: (pos?.arrow ?? 0) - 4,
                width: 8,
                height: 8,
                background: 'var(--color-card)',
                transform: 'rotate(45deg)',
                ...arrowStyle,
              }}
            />
          </div>,
          document.body,
        )}
    </>
  )
}
