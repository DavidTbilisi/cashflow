import { useEffect, useRef, useState } from 'react'
import { Application } from 'pixi.js'
import { BoardRenderer } from './BoardRenderer'
import { PawnRenderer } from './PawnRenderer'
import { BoardTooltip } from './BoardTooltip'
import { BOARD_DIMENSIONS } from '../utils/boardGeometry'
import { boardSpaceInfo, type ConceptInfo } from '../components/ui/conceptInfo'
import { useBoardSync } from './useBoardSync'
import { useGameStore } from '../store/gameStore'

interface TipState {
  info: ConceptInfo
  x: number
  y: number
}

export function PixiBoardCanvas({ tileTooltipDelay = 3000 }: { tileTooltipDelay?: number } = {}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const boardRef = useRef<BoardRenderer | null>(null)
  const pawnRef = useRef<PawnRenderer | null>(null)
  const tipTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const cursor = useRef({ x: 0, y: 0 })
  const delayRef = useRef(tileTooltipDelay)
  delayRef.current = tileTooltipDelay
  const [tip, setTip] = useState<TipState | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const app = new Application()
    appRef.current = app
    let destroyed = false
    let ro: ResizeObserver | null = null

    app.init({
      width: BOARD_DIMENSIONS.width,
      height: BOARD_DIMENSIONS.height,
      backgroundColor: 0x070a12,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    }).then(() => {
      if (destroyed || !containerRef.current || !wrapperRef.current) return
      const canvas = app.canvas as HTMLCanvasElement
      canvas.style.display = 'block'
      containerRef.current.appendChild(canvas)

      const board = new BoardRenderer(app)
      boardRef.current = board
      app.stage.addChild(board.container)

      const pawns = new PawnRenderer(app)
      pawnRef.current = pawns
      app.stage.addChild(pawns.container)

      // Initial paint — useBoardSync only fires on subsequent changes.
      const initialPlayers = useGameStore.getState().game?.players
      if (initialPlayers) pawns.syncPlayers(initialPlayers)

      // Per-tile hover → DOM tooltip after a 3s dwell. Pawns stay out of the
      // way so they never steal hover from the tile underneath.
      app.stage.eventMode = 'static'
      pawns.container.eventMode = 'none'
      board.enableTileHover({
        onEnter: (space, x, y) => {
          cursor.current = { x, y }
          if (tipTimer.current) clearTimeout(tipTimer.current)
          tipTimer.current = setTimeout(() => {
            setTip({ info: boardSpaceInfo(space), x: cursor.current.x, y: cursor.current.y })
          }, delayRef.current)
        },
        onMove: (x, y) => {
          cursor.current = { x, y }
        },
        onLeave: () => {
          if (tipTimer.current) clearTimeout(tipTimer.current)
          setTip(null)
        },
      })

      const syncScale = () => {
        if (!wrapperRef.current || !containerRef.current) return
        const { width: w, height: h } = wrapperRef.current.getBoundingClientRect()
        const scale = Math.min(w / BOARD_DIMENSIONS.width, h / BOARD_DIMENSIONS.height, 1)
        canvas.style.transformOrigin = 'top left'
        canvas.style.transform = `scale(${scale})`
        containerRef.current.style.width = `${BOARD_DIMENSIONS.width * scale}px`
        containerRef.current.style.height = `${BOARD_DIMENSIONS.height * scale}px`
      }

      syncScale()
      ro = new ResizeObserver(syncScale)
      ro.observe(wrapperRef.current)
    }).catch((err: unknown) => {
      if (!destroyed) console.error('[Pixi] init failed:', err)
    })

    return () => {
      destroyed = true
      ro?.disconnect()
      if (tipTimer.current) clearTimeout(tipTimer.current)
      boardRef.current = null
      pawnRef.current = null
      appRef.current = null
      try { app.destroy(true) } catch { /* safe to ignore if init never resolved */ }
    }
  }, [])

  useBoardSync(boardRef, pawnRef)

  return (
    <div
      ref={wrapperRef}
      className="flex-1 flex items-center justify-center overflow-hidden"
      style={{ minWidth: 0, minHeight: 0 }}
    >
      <div ref={containerRef} style={{ overflow: 'hidden', borderRadius: '8px' }} />
      {tip && <BoardTooltip info={tip.info} x={tip.x} y={tip.y} />}
    </div>
  )
}
