// Flat white pictograms drawn on every board tile, echoing the line-art glyphs
// of the physical CASHFLOW board. Each routine paints within roughly [-r, r]
// around (x, y). Kept deliberately simple so they read at ~40px.
import type { Graphics } from 'pixi.js'

const INK = 0xffffff
const A = 0.95

function line(g: Graphics, r: number, mul = 0.24) {
  g.stroke({ width: Math.max(1.5, r * mul), color: INK, alpha: A, cap: 'round', join: 'round' })
}
function fill(g: Graphics) {
  g.fill({ color: INK, alpha: A })
}

type Glyph = (g: Graphics, x: number, y: number, r: number) => void

const coins: Glyph = (g, x, y, r) => {
  // Three stacked coins.
  for (let i = 0; i < 3; i++) {
    const cy = y + r * 0.55 - i * r * 0.55
    g.ellipse(x, cy, r * 0.92, r * 0.4)
    g.fill({ color: INK, alpha: A - i * 0.04 })
  }
}

const arrowUp: Glyph = (g, x, y, r) => {
  g.poly([x, y - r, x + r * 0.8, y + r * 0.05, x - r * 0.8, y + r * 0.05])
  fill(g)
  g.rect(x - r * 0.28, y, r * 0.56, r * 0.95)
  fill(g)
}
const arrowDown: Glyph = (g, x, y, r) => {
  g.poly([x, y + r, x + r * 0.8, y - r * 0.05, x - r * 0.8, y - r * 0.05])
  fill(g)
  g.rect(x - r * 0.28, y - r * 0.95, r * 0.56, r * 0.95)
  fill(g)
}

const branch: Glyph = (g, x, y, r) => {
  // A stem that forks into two arrows — "make a decision".
  g.moveTo(x, y + r)
  g.lineTo(x, y)
  g.moveTo(x, y)
  g.lineTo(x - r * 0.85, y - r * 0.85)
  g.moveTo(x, y)
  g.lineTo(x + r * 0.85, y - r * 0.85)
  line(g, r, 0.22)
  g.poly([x - r * 0.85, y - r * 0.85, x - r * 0.3, y - r * 0.8, x - r * 0.8, y - r * 0.28])
  fill(g)
  g.poly([x + r * 0.85, y - r * 0.85, x + r * 0.3, y - r * 0.8, x + r * 0.8, y - r * 0.28])
  fill(g)
}

const star: Glyph = (g, x, y, r) => {
  const pts: number[] = []
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5
    const rad = i % 2 === 0 ? r : r * 0.44
    pts.push(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad)
  }
  g.poly(pts)
  fill(g)
}

const door: Glyph = (g, x, y, r) => {
  g.moveTo(x - r * 0.62, y + r)
  g.lineTo(x - r * 0.62, y - r * 0.45)
  g.arc(x, y - r * 0.45, r * 0.62, Math.PI, 0)
  g.lineTo(x + r * 0.62, y + r)
  g.closePath()
  line(g, r, 0.2)
  g.circle(x + r * 0.32, y + r * 0.22, r * 0.13)
  fill(g)
}

const scale: Glyph = (g, x, y, r) => {
  // Balance: post, beam, two pans.
  g.moveTo(x, y - r)
  g.lineTo(x, y + r * 0.7)
  g.moveTo(x - r, y - r * 0.55)
  g.lineTo(x + r, y - r * 0.55)
  g.moveTo(x - r * 0.5, y + r)
  g.lineTo(x + r * 0.5, y + r)
  line(g, r, 0.16)
  for (const sx of [-1, 1]) {
    const px = x + sx * r
    g.moveTo(px - r * 0.34, y - r * 0.55)
    g.lineTo(px, y - r * 0.02)
    g.lineTo(px + r * 0.34, y - r * 0.55)
    line(g, r, 0.13)
  }
}

const safe: Glyph = (g, x, y, r) => {
  g.roundRect(x - r, y - r, r * 2, r * 2, r * 0.22)
  line(g, r, 0.16)
  g.circle(x, y, r * 0.5)
  line(g, r, 0.16)
  g.moveTo(x, y)
  g.lineTo(x + r * 0.5, y - r * 0.5)
  line(g, r, 0.16)
}

const chain: Glyph = (g, x, y, r) => {
  g.ellipse(x - r * 0.42, y, r * 0.5, r * 0.74)
  line(g, r, 0.2)
  g.ellipse(x + r * 0.42, y, r * 0.5, r * 0.74)
  line(g, r, 0.2)
}

const gear: Glyph = (g, x, y, r) => {
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    g.moveTo(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7)
    g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
  }
  line(g, r, 0.22)
  g.circle(x, y, r * 0.62)
  line(g, r, 0.18)
  g.circle(x, y, r * 0.24)
  fill(g)
}

const shield: Glyph = (g, x, y, r) => {
  g.moveTo(x, y - r)
  g.lineTo(x + r * 0.85, y - r * 0.55)
  g.lineTo(x + r * 0.7, y + r * 0.35)
  g.lineTo(x, y + r)
  g.lineTo(x - r * 0.7, y + r * 0.35)
  g.lineTo(x - r * 0.85, y - r * 0.55)
  g.closePath()
  line(g, r, 0.16)
  g.moveTo(x - r * 0.4, y)
  g.lineTo(x - r * 0.1, y + r * 0.32)
  g.lineTo(x + r * 0.45, y - r * 0.34)
  line(g, r, 0.16)
}

const house: Glyph = (g, x, y, r) => {
  g.poly([x, y - r, x + r, y - r * 0.05, x - r, y - r * 0.05])
  fill(g)
  g.rect(x - r * 0.66, y - r * 0.05, r * 1.32, r * 0.95)
  fill(g)
}

const chart: Glyph = (g, x, y, r) => {
  const heights = [0.5, 0.9, 0.66, 1.18]
  const bw = r * 0.42
  heights.forEach((h, i) => {
    const bx = x - r + i * (bw + r * 0.16)
    g.rect(bx, y + r * 0.6 - r * h, bw, r * h)
    fill(g)
  })
}

const briefcase: Glyph = (g, x, y, r) => {
  g.moveTo(x - r * 0.34, y - r * 0.5)
  g.lineTo(x - r * 0.34, y - r * 0.8)
  g.lineTo(x + r * 0.34, y - r * 0.8)
  g.lineTo(x + r * 0.34, y - r * 0.5)
  line(g, r, 0.16)
  g.roundRect(x - r, y - r * 0.5, r * 2, r * 1.4, r * 0.18)
  fill(g)
}

const gift: Glyph = (g, x, y, r) => {
  g.rect(x - r, y - r * 0.3, r * 2, r * 1.3)
  fill(g)
  g.rect(x - r * 0.18, y - r * 0.3, r * 0.36, r * 1.3)
  g.fill({ color: 0x000000, alpha: 0.22 })
  g.moveTo(x, y - r * 0.3)
  g.bezierCurveTo(x - r * 0.9, y - r * 1.1, x - r * 0.2, y - r * 1.1, x, y - r * 0.3)
  g.bezierCurveTo(x + r * 0.2, y - r * 1.1, x + r * 0.9, y - r * 1.1, x, y - r * 0.3)
  fill(g)
}

const card: Glyph = (g, x, y, r) => {
  g.roundRect(x - r * 0.9, y - r * 0.66, r * 1.8, r * 1.32, r * 0.18)
  line(g, r, 0.16)
  g.moveTo(x - r * 0.5, y - r * 0.16)
  g.lineTo(x + r * 0.5, y - r * 0.16)
  g.moveTo(x - r * 0.5, y + r * 0.2)
  g.lineTo(x + r * 0.2, y + r * 0.2)
  line(g, r, 0.13)
}

const heart: Glyph = (g, x, y, r) => {
  g.moveTo(x, y + r * 0.85)
  g.bezierCurveTo(x - r * 1.3, y - r * 0.1, x - r * 0.5, y - r * 0.95, x, y - r * 0.25)
  g.bezierCurveTo(x + r * 0.5, y - r * 0.95, x + r * 1.3, y - r * 0.1, x, y + r * 0.85)
  fill(g)
}

const heartBroken: Glyph = (g, x, y, r) => {
  heart(g, x, y, r)
  g.moveTo(x, y - r * 0.2)
  g.lineTo(x - r * 0.18, y + r * 0.12)
  g.lineTo(x + r * 0.14, y + r * 0.34)
  g.lineTo(x - r * 0.05, y + r * 0.62)
  g.stroke({ width: Math.max(1.5, r * 0.16), color: 0x000000, alpha: 0.55, cap: 'round', join: 'round' })
}

const baby: Glyph = (g, x, y, r) => {
  g.circle(x, y + r * 0.05, r * 0.72)
  fill(g)
  g.circle(x - r * 0.4, y - r * 0.55, r * 0.18) // a little curl
  fill(g)
  g.circle(x - r * 0.26, y - r * 0.05, r * 0.1)
  g.fill({ color: 0x000000, alpha: 0.5 })
  g.circle(x + r * 0.26, y - r * 0.05, r * 0.1)
  g.fill({ color: 0x000000, alpha: 0.5 })
  g.arc(x, y + r * 0.12, r * 0.34, 0.18 * Math.PI, 0.82 * Math.PI)
  g.stroke({ width: Math.max(1.5, r * 0.12), color: 0x000000, alpha: 0.5, cap: 'round' })
}

const gavel: Glyph = (g, x, y, r) => {
  g.moveTo(x - r * 0.7, y + r * 0.7)
  g.lineTo(x + r * 0.2, y - r * 0.2)
  line(g, r, 0.2)
  g.moveTo(x - r * 0.05, y - r * 0.6)
  g.lineTo(x + r * 0.7, y + r * 0.1)
  g.stroke({ width: Math.max(2, r * 0.46), color: INK, alpha: A, cap: 'round' })
  g.rect(x - r * 0.95, y + r * 0.78, r * 1.5, r * 0.22)
  fill(g)
}

const diamond: Glyph = (g, x, y, r) => {
  g.poly([x, y - r, x + r * 0.8, y - r * 0.2, x, y + r, x - r * 0.8, y - r * 0.2])
  fill(g)
  g.moveTo(x - r * 0.8, y - r * 0.2)
  g.lineTo(x + r * 0.8, y - r * 0.2)
  g.moveTo(x, y - r)
  g.lineTo(x, y + r)
  g.stroke({ width: Math.max(1, r * 0.08), color: 0x000000, alpha: 0.3 })
}

export const GLYPHS: Record<string, Glyph> = {
  coins,
  up: arrowUp,
  down: arrowDown,
  branch,
  star,
  door,
  scale,
  safe,
  chain,
  engine: gear,
  shield,
  house,
  chart,
  briefcase,
  gift,
  card,
  heart,
  heartBroken,
  baby,
  gavel,
  diamond,
}

/** Pick a glyph key for a board space. */
export function glyphKeyFor(
  type: string,
  label: string,
  anchorId: string | undefined,
  index: number,
): string {
  if (type === 'anchor_milestone' && anchorId && GLYPHS[anchorId]) return anchorId
  switch (type) {
    case 'payday':
    case 'cashflow_day':
      return 'coins'
    case 'fast_track_entry':
      return 'star'
    case 'opportunity':
      return 'up'
    case 'market':
      return 'chart'
    case 'doodad':
      return 'gift'
    case 'charity':
      return 'heart'
    case 'baby':
      return 'baby'
    case 'downsized':
      return 'down'
    case 'business_investment':
      return 'briefcase'
    case 'dream':
      return 'diamond'
    case 'tax_audit':
    case 'lawsuit':
      return 'gavel'
    case 'divorce':
      return 'heartBroken'
  }
  // Custom card-draw tiles, keyed by label.
  switch (label) {
    case 'Decision':
      return 'branch'
    case 'Build':
      return 'engine'
    case 'Obstacle':
      return 'down'
  }
  return ['briefcase', 'chart', 'house', 'gift', 'card'][index % 5]
}
