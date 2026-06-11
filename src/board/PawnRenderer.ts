import { Application, Container, Graphics, Ticker } from 'pixi.js'
import type { PlayerState } from '../domain/entities/types'
import { ratRacePosition, fastTrackPosition } from '../utils/boardGeometry'
import { ALL_BOARD_SPACES } from '../domain/data/boardSpaces'

const PAWN_R = 14
const RAT_RACE_TOTAL = ALL_BOARD_SPACES.filter((s) => s.track === 'rat_race').length
const FAST_TRACK_TOTAL = ALL_BOARD_SPACES.filter((s) => s.track === 'fast_track').length

export class PawnRenderer {
  container: Container
  private _pawns: Map<string, Graphics> = new Map()

  constructor(private app: Application) {
    this.container = new Container()
  }

  syncPlayers(players: PlayerState[]) {
    const seen = new Set<string>()
    for (const player of players) {
      seen.add(player.id)
      const pos = player.boardTrack === 'rat_race'
        ? ratRacePosition(player.boardPosition, RAT_RACE_TOTAL)
        : fastTrackPosition(player.boardPosition, FAST_TRACK_TOTAL)

      let pawn = this._pawns.get(player.id)
      if (!pawn) {
        pawn = this.createPawn(player)
        this._pawns.set(player.id, pawn)
        this.container.addChild(pawn)
      }

      // Offset pawns if multiple players on same space
      const idx = players.indexOf(player)
      const offset = { x: (idx % 2) * 12 - 6, y: Math.floor(idx / 2) * 12 - 6 }

      this.tweenTo(pawn, pos.x + offset.x, pos.y + offset.y)
    }

    // Remove pawns for gone players
    for (const [id, pawn] of this._pawns) {
      if (!seen.has(id)) {
        this.container.removeChild(pawn)
        this._pawns.delete(id)
      }
    }
  }

  private createPawn(player: PlayerState): Graphics {
    const g = new Graphics()
    const hex = parseInt(player.color.replace('#', ''), 16)
    const dark = this.shade(hex, 0.62)
    const light = this.shade(hex, 1.32)
    // Drop shadow on the board.
    g.ellipse(1.5, PAWN_R * 0.9, PAWN_R * 1.05, PAWN_R * 0.5).fill({ color: 0x000000, alpha: 0.3 })
    // Token body with a white rim.
    g.circle(0, 0, PAWN_R + 2).fill({ color: 0xffffff, alpha: 0.95 })
    g.circle(0, 0, PAWN_R).fill({ color: hex })
    g.circle(0, 0, PAWN_R).stroke({ width: 1.5, color: dark, alpha: 0.8 })
    // Glossy highlight.
    g.ellipse(-PAWN_R * 0.32, -PAWN_R * 0.36, PAWN_R * 0.5, PAWN_R * 0.34).fill({ color: light, alpha: 0.7 })
    // Centre pip.
    g.circle(0, 0, PAWN_R * 0.3).fill({ color: 0xffffff, alpha: 0.9 })
    return g
  }

  private shade(hex: number, f: number): number {
    const r = Math.min(255, Math.round(((hex >> 16) & 0xff) * f))
    const g = Math.min(255, Math.round(((hex >> 8) & 0xff) * f))
    const b = Math.min(255, Math.round((hex & 0xff) * f))
    return (r << 16) | (g << 8) | b
  }

  private tweenTo(g: Graphics, tx: number, ty: number, duration = 300) {
    const start = { x: g.x, y: g.y }
    const startTime = performance.now()

    const onTick = () => {
      const t = Math.min((performance.now() - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3) // ease-out cubic
      g.x = start.x + (tx - start.x) * ease
      g.y = start.y + (ty - start.y) * ease
      if (t >= 1) Ticker.shared.remove(onTick)
    }

    if (g.x === 0 && g.y === 0) {
      // Initial placement — no tween
      g.x = tx
      g.y = ty
    } else {
      Ticker.shared.add(onTick)
    }
  }
}
