import { Application, Container, Graphics, Polygon, Text, TextStyle } from 'pixi.js'
import type { FederatedPointerEvent } from 'pixi.js'
import { ALL_BOARD_SPACES } from '../domain/data/boardSpaces'
import type { BoardSpace } from '../domain/entities/types'
import {
  BOARD_W,
  BOARD_H,
  PANEL,
  RAT_RACE,
  FAST_TRACK,
  FAST_TRACK_PERIMETER,
  ratRaceAngle,
  ratRacePosition,
  fastTrackArcLength,
  fastTrackPointAt,
  CARD_DECKS,
} from '../utils/boardGeometry'
import { GLYPHS, glyphKeyFor } from './tileIcons'

// ── CASHFLOW palette ───────────────────────────────────────────────────────
const C = {
  woodBase: 0xb07c3e,
  woodDark: 0x8a5e2b,
  woodLight: 0xcd9d60,
  panel: 0x171221,
  panelEdge: 0x2c2440,
  hole: 0x0b0810,
  green: 0x9bbb4c,
  purple: 0x806ea2,
  teal: 0x6ea7b3,
  orange: 0xefa63c,
  red: 0xd96a3a,
  gold: 0xf2c24a,
  pink: 0xd9799f,
  deck: 0x8fb24a,
  logoFill: 0xf4a93a,
  logoStroke: 0x3a2752,
}

const RR_ROTATION = [C.green, C.purple, C.green, C.teal, C.green, C.purple, C.teal]

function shade(hex: number, f: number): number {
  const r = Math.min(255, Math.round(((hex >> 16) & 0xff) * f))
  const g = Math.min(255, Math.round(((hex >> 8) & 0xff) * f))
  const b = Math.min(255, Math.round((hex & 0xff) * f))
  return (r << 16) | (g << 8) | b
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface TileMeta {
  path: (g: Graphics) => void
  base: number
  /** Flat [x0,y0,x1,y1,…] polygon outline, used as the hover hit area. */
  points: number[]
  space: BoardSpace
}

export class BoardRenderer {
  container: Container
  private _tiles = new Map<string, TileMeta>()
  private _overlay = new Graphics()

  constructor(private app: Application) {
    this.container = new Container()
    this.drawWood()
    this.drawPanel()
    this.drawGlow()
    this.drawFastTrack()
    this.drawRatRace()
    this.drawCenter()
    this.drawCardDecks()
    this.container.addChild(this._overlay)
  }

  // ── Wood table ────────────────────────────────────────────────────────────
  private drawWood() {
    const g = new Graphics()
    g.rect(0, 0, BOARD_W, BOARD_H).fill({ color: C.woodBase })

    const rnd = mulberry32(20260610)
    // Plank seams.
    for (let i = 1; i < 7; i++) {
      const x = (BOARD_W / 7) * i + (rnd() - 0.5) * 30
      g.moveTo(x, 0).lineTo(x + (rnd() - 0.5) * 16, BOARD_H)
      g.stroke({ width: 2.5, color: C.woodDark, alpha: 0.32 })
    }
    // Grain strokes.
    for (let i = 0; i < 220; i++) {
      const y = rnd() * BOARD_H
      const x0 = rnd() * BOARD_W
      const w = 60 + rnd() * 260
      const amp = (rnd() - 0.5) * 10
      g.moveTo(x0, y)
      g.bezierCurveTo(x0 + w * 0.33, y + amp, x0 + w * 0.66, y - amp, x0 + w, y)
      const light = rnd() > 0.5
      g.stroke({ width: 0.8 + rnd() * 1.4, color: light ? C.woodLight : C.woodDark, alpha: 0.05 + rnd() * 0.1 })
    }
    // A couple of knots.
    for (let i = 0; i < 3; i++) {
      const x = 120 + rnd() * (BOARD_W - 240)
      const y = 80 + rnd() * (BOARD_H - 160)
      for (let k = 0; k < 4; k++) {
        g.ellipse(x, y, 8 + k * 5, 5 + k * 3).stroke({ width: 1.2, color: C.woodDark, alpha: 0.16 - k * 0.03 })
      }
    }
    // Edge vignette to focus the centre.
    for (let k = 0; k < 5; k++) {
      const inset = k * 9
      g.rect(inset, inset, BOARD_W - inset * 2, BOARD_H - inset * 2).stroke({
        width: 10,
        color: 0x4a2f12,
        alpha: 0.05,
      })
    }
    this.container.addChild(g)
  }

  // ── Board panel ───────────────────────────────────────────────────────────
  private drawPanel() {
    const g = new Graphics()
    // Cast shadow on the wood.
    g.roundRect(PANEL.x + 6, PANEL.y + 14, PANEL.w, PANEL.h, PANEL.r).fill({ color: 0x000000, alpha: 0.32 })
    // Panel base.
    g.roundRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h, PANEL.r).fill({ color: C.panel })
    // Bevelled rim.
    g.roundRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h, PANEL.r).stroke({ width: 3, color: C.panelEdge, alpha: 0.9 })
    g.roundRect(PANEL.x + 5, PANEL.y + 5, PANEL.w - 10, PANEL.h - 10, PANEL.r - 5).stroke({
      width: 1.5,
      color: 0x000000,
      alpha: 0.45,
    })
    // Soft inner glow toward the centre.
    for (let k = 0; k < 6; k++) {
      const inset = 14 + k * 26
      g.roundRect(PANEL.x + inset, PANEL.y + inset, PANEL.w - inset * 2, PANEL.h - inset * 2, Math.max(8, PANEL.r - inset))
        .stroke({ width: 26, color: 0x4a3a6a, alpha: 0.035 })
    }
    this.container.addChild(g)
  }

  // ── Glow halo behind the inner wheel ───────────────────────────────────────
  private drawGlow() {
    const g = new Graphics()
    const { cx, cy, outerR } = RAT_RACE
    for (let k = 18; k >= 0; k--) {
      const rr = outerR + 6 + k * 7
      const hue = k > 9 ? 0x6a3a86 : 0x8a4aa0
      g.circle(cx, cy, rr).fill({ color: hue, alpha: 0.018 })
    }
    this.container.addChild(g)
  }

  // ── Fast Track (outer rounded-rectangle loop) ──────────────────────────────
  private drawFastTrack() {
    const spaces = ALL_BOARD_SPACES.filter((s) => s.track === 'fast_track')
    const total = spaces.length
    const tileLen = FAST_TRACK_PERIMETER / total
    const half = FAST_TRACK.bandW / 2
    const tiles = new Graphics()
    const icons = new Graphics()

    spaces.forEach((space, i) => {
      const sCenter = fastTrackArcLength(i, total)
      const gap = 7
      const s0 = sCenter - tileLen / 2 + gap / 2
      const s1 = sCenter + tileLen / 2 - gap / 2
      const steps = Math.max(2, Math.round((s1 - s0) / 9))
      const outer: number[] = []
      const inner: number[] = []
      for (let k = 0; k <= steps; k++) {
        const p = fastTrackPointAt(s0 + ((s1 - s0) * k) / steps)
        outer.push(p.x + p.nx * half, p.y + p.ny * half)
        inner.push(p.x - p.nx * half, p.y - p.ny * half)
      }
      const pts: number[] = []
      for (let k = 0; k < outer.length; k += 2) pts.push(outer[k], outer[k + 1])
      for (let k = inner.length - 2; k >= 0; k -= 2) pts.push(inner[k], inner[k + 1])

      const base = this.tileColor(space, i)
      const path = (g: Graphics) => g.poly(pts)
      this._tiles.set(space.id, { path, base, points: pts, space })

      path(tiles)
      tiles.fill({ color: base })
      path(tiles)
      tiles.stroke({ width: 2.5, color: shade(base, 0.58), alpha: 0.95 })
      path(tiles)
      tiles.stroke({ width: 1, color: shade(base, 1.28), alpha: 0.4 })

      const c = fastTrackPointAt(sCenter)
      this.placeIcon(icons, space, i, c.x, c.y, base)
    })

    this.container.addChild(tiles)
    this.container.addChild(icons)
  }

  // ── Rat Race (inner annular ring) ──────────────────────────────────────────
  private drawRatRace() {
    const spaces = ALL_BOARD_SPACES.filter((s) => s.track === 'rat_race')
    const total = spaces.length
    const step = (Math.PI * 2) / total
    const gapAng = 0.014
    const { cx, cy, outerR, innerR } = RAT_RACE
    const tiles = new Graphics()
    const icons = new Graphics()

    spaces.forEach((space, i) => {
      const aMid = ratRaceAngle(i, total)
      const a0 = aMid - step / 2 + gapAng
      const a1 = aMid + step / 2 - gapAng
      const path = (g: Graphics) => {
        g.moveTo(cx + Math.cos(a0) * outerR, cy + Math.sin(a0) * outerR)
        g.arc(cx, cy, outerR, a0, a1, false)
        g.lineTo(cx + Math.cos(a1) * innerR, cy + Math.sin(a1) * innerR)
        g.arc(cx, cy, innerR, a1, a0, true)
        g.closePath()
      }

      // Sample the wedge outline (outer arc out, inner arc back) for the hit area.
      const points: number[] = []
      const arcSteps = 6
      for (let k = 0; k <= arcSteps; k++) {
        const a = a0 + ((a1 - a0) * k) / arcSteps
        points.push(cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR)
      }
      for (let k = arcSteps; k >= 0; k--) {
        const a = a0 + ((a1 - a0) * k) / arcSteps
        points.push(cx + Math.cos(a) * innerR, cy + Math.sin(a) * innerR)
      }

      const base = this.tileColor(space, i)
      this._tiles.set(space.id, { path, base, points, space })

      path(tiles)
      tiles.fill({ color: base })
      path(tiles)
      tiles.stroke({ width: 2.5, color: shade(base, 0.58), alpha: 0.95 })
      path(tiles)
      tiles.stroke({ width: 1, color: shade(base, 1.28), alpha: 0.4 })

      const pos = ratRacePosition(i, total)
      this.placeIcon(icons, space, i, pos.x, pos.y, base)
    })

    this.container.addChild(tiles)
    this.container.addChild(icons)
  }

  private tileColor(space: BoardSpace, i: number): number {
    switch (space.type) {
      case 'payday':
      case 'cashflow_day':
        return C.orange
      case 'anchor_milestone':
        return C.red
      case 'fast_track_entry':
        return C.gold
      case 'opportunity':
      case 'business_investment':
        return C.green
      case 'market':
        return C.teal
      case 'doodad':
        return C.purple
      case 'charity':
      case 'dream':
        return C.pink
      case 'baby':
        return C.teal
      case 'downsized':
      case 'tax_audit':
      case 'divorce':
      case 'lawsuit':
        return C.red
      default:
        return RR_ROTATION[i % RR_ROTATION.length]
    }
  }

  private placeIcon(g: Graphics, space: BoardSpace, i: number, x: number, y: number, base: number) {
    const key = glyphKeyFor(space.type, space.label, space.anchorId, i)
    const glyph = GLYPHS[key]
    if (!glyph) return
    const r = space.track === 'rat_race' ? 16 : 19
    glyph(g, x, y, r)
  }

  // ── Centre hole ────────────────────────────────────────────────────────────
  private drawCenter() {
    const g = new Graphics()
    const { cx, cy, innerR } = RAT_RACE
    g.circle(cx, cy, innerR).fill({ color: C.hole })
    // Inner-edge shadow ring.
    for (let k = 0; k < 5; k++) {
      g.circle(cx, cy, innerR - k * 3).stroke({ width: 4, color: 0x000000, alpha: 0.14 - k * 0.02 })
    }
    g.circle(cx, cy, innerR).stroke({ width: 2, color: 0x2a2238, alpha: 0.8 })
    this.container.addChild(g)

    const label = new Text({
      text: 'THE RAT RACE',
      style: new TextStyle({ fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: '700', fill: 0x5a5070, letterSpacing: 5 }),
    })
    label.anchor.set(0.5)
    label.x = cx
    label.y = cy
    label.alpha = 0.55
    this.container.addChild(label)
  }

  // ── Card-deck stacks ───────────────────────────────────────────────────────
  private drawCardDecks() {
    for (const deck of CARD_DECKS) {
      const g = new Graphics()
      const { x, y, w, h } = deck
      // Stacked cards behind.
      for (let k = 3; k >= 1; k--) {
        g.roundRect(x - w / 2 + k * 4, y - h / 2 + k * 4, w, h, 12).fill({ color: shade(C.deck, 0.7 - k * 0.04) })
      }
      g.roundRect(x - w / 2 - 3, y - h / 2 - 3, w, h, 12).fill({ color: 0x000000, alpha: 0.25 })
      g.roundRect(x - w / 2, y - h / 2, w, h, 12).fill({ color: C.deck })
      g.roundRect(x - w / 2, y - h / 2, w, h, 12).stroke({ width: 2.5, color: shade(C.deck, 1.18), alpha: 0.8 })
      g.roundRect(x - w / 2 + 7, y - h / 2 + 7, w - 14, h - 14, 8).stroke({ width: 1.5, color: shade(C.deck, 0.6), alpha: 0.5 })
      this.drawHandshake(g, x, y - 6, 30)
      this.container.addChild(g)

      const t = new Text({
        text: deck.label,
        style: new TextStyle({ fontFamily: '"Arial Black", Sora, sans-serif', fontSize: 13, fontWeight: '900', fill: shade(C.deck, 0.34), letterSpacing: 1 }),
      })
      t.anchor.set(0.5)
      t.x = x
      t.y = y + h / 2 - 18
      this.container.addChild(t)
    }
  }

  private drawHandshake(g: Graphics, x: number, y: number, r: number) {
    // Two forearms clasping at the centre, with a knuckle block + fingers.
    for (const dir of [-1, 1]) {
      g.moveTo(x + dir * r * 1.5, y + r * 0.55)
      g.lineTo(x + dir * r * 0.18, y - r * 0.12)
      g.stroke({ width: r * 0.52, color: 0xffffff, alpha: 0.95, cap: 'round' })
    }
    // Clasped grip.
    g.roundRect(x - r * 0.44, y - r * 0.36, r * 0.88, r * 0.62, r * 0.18).fill({ color: 0xffffff, alpha: 0.95 })
    // Fingers folding over.
    for (let i = -1; i <= 1; i++) {
      g.moveTo(x + i * r * 0.26 + r * 0.1, y - r * 0.36)
      g.lineTo(x + i * r * 0.26 - r * 0.14, y + r * 0.04)
      g.stroke({ width: r * 0.13, color: shade(C.deck, 0.7), alpha: 0.85, cap: 'round' })
    }
  }

  // ── Per-tile hover hit layer ────────────────────────────────────────────────
  /**
   * Build a transparent, interactive layer — one hit polygon per tile — so the
   * React canvas can drive a DOM tooltip. The visible tiles are merged Graphics
   * and can't carry their own listeners, so these invisible siblings stand in.
   */
  enableTileHover(handlers: {
    onEnter: (space: BoardSpace, clientX: number, clientY: number) => void
    onMove: (clientX: number, clientY: number) => void
    onLeave: (space: BoardSpace) => void
  }) {
    const layer = new Container()
    layer.eventMode = 'static'
    for (const meta of this._tiles.values()) {
      const hit = new Graphics()
      hit.hitArea = new Polygon(meta.points)
      hit.eventMode = 'static'
      hit.cursor = 'help'
      hit.on('pointerover', (e: FederatedPointerEvent) => {
        const ev = e.nativeEvent as PointerEvent
        handlers.onEnter(meta.space, ev.clientX, ev.clientY)
      })
      hit.on('pointermove', (e: FederatedPointerEvent) => {
        const ev = e.nativeEvent as PointerEvent
        handlers.onMove(ev.clientX, ev.clientY)
      })
      hit.on('pointerout', () => handlers.onLeave(meta.space))
      layer.addChild(hit)
    }
    this.container.addChild(layer)
  }

  // ── Highlight (game-driven + hover) ────────────────────────────────────────
  highlightSpace(spaceId: string, on: boolean) {
    const meta = this._tiles.get(spaceId)
    this._overlay.clear()
    if (!meta || !on) return
    meta.path(this._overlay)
    this._overlay.fill({ color: 0xffffff, alpha: 0.16 })
    meta.path(this._overlay)
    this._overlay.stroke({ width: 3.5, color: 0xfff2c4, alpha: 0.95 })
  }
}
