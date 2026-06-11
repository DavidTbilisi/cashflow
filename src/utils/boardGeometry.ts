// ─────────────────────────────────────────────────────────────────────────
// Board geometry — single source of truth for the CASHFLOW board layout.
//
// Two tracks, matching the physical game:
//   • Rat Race   — inner circular ring (annulus of wedge tiles) around a dark hole
//   • Fast Track — outer rounded-rectangle loop running the board's perimeter
//
// The renderer draws tiles from these same primitives, and pawns are placed at
// the tile-centre helpers, so visuals and game state never drift apart.
// ─────────────────────────────────────────────────────────────────────────

export const BOARD_W = 1320
export const BOARD_H = 900
const CX = BOARD_W / 2
const CY = 450

// ── Board panel (dark base the tracks sit on) ──────────────────────────────
export const PANEL = { x: 26, y: 24, w: BOARD_W - 52, h: BOARD_H - 48, r: 64 }

// ── Inner Rat Race ring ────────────────────────────────────────────────────
// Shifted right of centre to leave room for the card-deck stacks on the left.
export const RAT_RACE = {
  cx: 792,
  cy: CY,
  outerR: 288,
  innerR: 170,
  get midR() {
    return (this.outerR + this.innerR) / 2
  },
}

// ── Outer Fast Track loop (rounded-rectangle centreline) ───────────────────
export const FAST_TRACK = {
  cx: CX,
  cy: CY,
  hw: 576, // half-width of the centreline
  hh: 366, // half-height of the centreline
  r: 116, // corner radius
  bandW: 92, // perpendicular tile thickness
}

// ── Card-deck stacks (inside the loop, left side) ──────────────────────────
export const CARD_DECKS = [
  { x: 300, y: 322, w: 168, h: 150, label: 'BIG DEAL' },
  { x: 300, y: 566, w: 168, h: 150, label: 'SMALL DEAL' },
]

// ───────────────────────── Rat Race helpers ───────────────────────────────

/** Angle (radians) at the centre of rat-race tile `i`, starting at the top, clockwise. */
export function ratRaceAngle(index: number, total: number): number {
  return (index / total) * Math.PI * 2 - Math.PI / 2
}

/** Centre point of rat-race tile `i` (where a pawn sits). */
export function ratRacePosition(index: number, total: number): { x: number; y: number } {
  const a = ratRaceAngle(index, total)
  return {
    x: RAT_RACE.cx + Math.cos(a) * RAT_RACE.midR,
    y: RAT_RACE.cy + Math.sin(a) * RAT_RACE.midR,
  }
}

// ──────────────────── Fast Track perimeter sampler ─────────────────────────
// The centreline is a rounded rectangle. We walk its perimeter by arc-length so
// tiles distribute evenly across straights and corners alike.

type LineSeg = { kind: 'line'; x0: number; y0: number; x1: number; y1: number; nx: number; ny: number; len: number; start: number }
type ArcSeg = { kind: 'arc'; cx: number; cy: number; r: number; a0: number; a1: number; len: number; start: number }
type Seg = LineSeg | ArcSeg
type RawSeg = Omit<LineSeg, 'start'> | Omit<ArcSeg, 'start'>

function buildPerimeter(): { segs: Seg[]; total: number } {
  const { cx, cy, hw, hh, r } = FAST_TRACK
  const L = cx - hw // left edge x
  const R = cx + hw // right edge x
  const T = cy - hh // top edge y
  const B = cy + hh // bottom edge y
  const raw: RawSeg[] = []
  const line = (x0: number, y0: number, x1: number, y1: number, nx: number, ny: number) =>
    raw.push({ kind: 'line', x0, y0, x1, y1, nx, ny, len: Math.hypot(x1 - x0, y1 - y0) })
  const arc = (acx: number, acy: number, a0: number, a1: number) =>
    raw.push({ kind: 'arc', cx: acx, cy: acy, r, a0, a1, len: Math.abs(a1 - a0) * r })

  // Clockwise from top-centre so tile index 0 sits at the top, like the rat race.
  line(cx, T, R - r, T, 0, -1) // top-right half
  arc(R - r, T + r, -Math.PI / 2, 0) // TR corner
  line(R, T + r, R, B - r, 1, 0) // right edge
  arc(R - r, B - r, 0, Math.PI / 2) // BR corner
  line(R - r, B, L + r, B, 0, 1) // bottom edge
  arc(L + r, B - r, Math.PI / 2, Math.PI) // BL corner
  line(L, B - r, L, T + r, -1, 0) // left edge
  arc(L + r, T + r, Math.PI, Math.PI * 1.5) // TL corner
  line(L + r, T, cx, T, 0, -1) // top-left half

  let acc = 0
  const segs = raw.map((s) => {
    const withStart = { ...s, start: acc } as Seg
    acc += s.len
    return withStart
  })
  return { segs, total: acc }
}

const PERIMETER = buildPerimeter()
export const FAST_TRACK_PERIMETER = PERIMETER.total

/** Point + outward unit normal at arc-length `s` along the fast-track centreline. */
export function fastTrackPointAt(s: number): { x: number; y: number; nx: number; ny: number } {
  let d = ((s % PERIMETER.total) + PERIMETER.total) % PERIMETER.total
  for (const seg of PERIMETER.segs) {
    if (d > seg.len && seg !== PERIMETER.segs[PERIMETER.segs.length - 1]) {
      d -= seg.len
      continue
    }
    if (seg.kind === 'line') {
      const t = seg.len === 0 ? 0 : d / seg.len
      return { x: seg.x0 + (seg.x1 - seg.x0) * t, y: seg.y0 + (seg.y1 - seg.y0) * t, nx: seg.nx, ny: seg.ny }
    }
    const t = seg.len === 0 ? 0 : d / seg.len
    const a = seg.a0 + (seg.a1 - seg.a0) * t
    const nx = Math.cos(a)
    const ny = Math.sin(a)
    return { x: seg.cx + nx * seg.r, y: seg.cy + ny * seg.r, nx, ny }
  }
  // Unreachable, but keeps the type-checker honest.
  const f = PERIMETER.segs[0] as Extract<Seg, { kind: 'line' }>
  return { x: f.x0, y: f.y0, nx: f.nx, ny: f.ny }
}

/** Arc-length at the centre of fast-track tile `i`. */
export function fastTrackArcLength(index: number, total: number): number {
  return ((index + 0.5) / total) * PERIMETER.total
}

/** Centre point of fast-track tile `i` (where a pawn sits). */
export function fastTrackPosition(index: number, total: number): { x: number; y: number } {
  const p = fastTrackPointAt(fastTrackArcLength(index, total))
  return { x: p.x, y: p.y }
}

export const BOARD_DIMENSIONS = { width: BOARD_W, height: BOARD_H }
