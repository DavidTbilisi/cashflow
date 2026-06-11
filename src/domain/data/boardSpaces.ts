import type { BoardSpace, SpaceType, CardType } from '../entities/types'
import { DREAMS, FAST_TRACK_BUSINESSES } from './fastTrack'

// Board layout helpers — placeholder pixel positions; the renderer computes the
// real geometry from utils/boardGeometry.ts. These keep BoardSpace well-formed.
function ratRacePos(i: number, total: number): { pixelX: number; pixelY: number } {
  const angle = (i / total) * Math.PI * 2 - Math.PI / 2
  const r = 260
  return { pixelX: 400 + Math.cos(angle) * r, pixelY: 350 + Math.sin(angle) * r }
}

function fastTrackPos(i: number, total: number): { pixelX: number; pixelY: number } {
  const angle = (i / total) * Math.PI * 2 - Math.PI / 2
  const r = 380
  return { pixelX: 400 + Math.cos(angle) * r, pixelY: 350 + Math.sin(angle) * r }
}

const RAT_RACE_COUNT = 40
const FAST_TRACK_COUNT = 24

// ── Rat Race plan ───────────────────────────────────────────────────────────
// Pay Check ×4, the custom Six-Anchor milestones, one Fast Track entry, and the
// rulebook spaces (Opportunity, The Market, Doodad, Charity, Baby ×3, Downsized)
// plus a few custom card-draw tiles (Anchors / ESBI / NECST layer).
const RR_PAYDAY = new Set([0, 10, 20, 30])
const RR_ANCHORS: Record<number, BoardSpace['anchorId']> = {
  4: 'door', 8: 'scale', 14: 'safe', 18: 'chain', 24: 'engine', 28: 'shield',
}
const RR_PLAN: Record<number, { type: SpaceType; label: string; deck?: CardType }> = {
  1: { type: 'opportunity', label: 'Opportunity' },
  2: { type: 'doodad', label: 'Doodad' },
  3: { type: 'opportunity', label: 'Opportunity' },
  5: { type: 'opportunity', label: 'Opportunity' },
  6: { type: 'market', label: 'The Market' },
  7: { type: 'opportunity', label: 'Opportunity' },
  9: { type: 'baby', label: 'Baby' },
  11: { type: 'charity', label: 'Charity' },
  12: { type: 'opportunity', label: 'Opportunity' },
  13: { type: 'doodad', label: 'Doodad' },
  15: { type: 'doodad', label: 'Doodad' },
  16: { type: 'opportunity', label: 'Opportunity' },
  17: { type: 'market', label: 'The Market' },
  19: { type: 'baby', label: 'Baby' },
  21: { type: 'card_draw', label: 'Decision', deck: 'decision_temptation' },
  22: { type: 'opportunity', label: 'Opportunity' },
  23: { type: 'doodad', label: 'Doodad' },
  25: { type: 'opportunity', label: 'Opportunity' },
  26: { type: 'opportunity', label: 'Opportunity' },
  27: { type: 'market', label: 'The Market' },
  29: { type: 'card_draw', label: 'Build', deck: 'system_building' },
  31: { type: 'downsized', label: 'Downsized' },
  32: { type: 'baby', label: 'Baby' },
  33: { type: 'doodad', label: 'Doodad' },
  34: { type: 'charity', label: 'Charity' },
  35: { type: 'doodad', label: 'Doodad' },
  37: { type: 'card_draw', label: 'Obstacle', deck: 'obstacle_challenge' },
  38: { type: 'opportunity', label: 'Opportunity' },
  39: { type: 'doodad', label: 'Doodad' },
}

export const RAT_RACE_SPACES: BoardSpace[] = Array.from({ length: RAT_RACE_COUNT }, (_, i) => {
  const base: BoardSpace = { id: `rr_${i}`, index: i, track: 'rat_race', type: 'neutral', label: '', ...ratRacePos(i, RAT_RACE_COUNT) }

  if (RR_PAYDAY.has(i)) return { ...base, type: 'payday', label: 'PAYDAY' }
  if (RR_ANCHORS[i]) {
    const anchorId = RR_ANCHORS[i]!
    const label = anchorId.charAt(0).toUpperCase() + anchorId.slice(1)
    return { ...base, type: 'anchor_milestone', label, anchorId }
  }
  if (i === 36) return { ...base, type: 'fast_track_entry', label: 'FAST TRACK' }

  const plan = RR_PLAN[i]
  if (plan) return { ...base, type: plan.type, label: plan.label, cardDeckFilter: plan.deck ? [plan.deck] : undefined }

  return base
})

// ── Fast Track plan ───────────────────────────────────────────────────────────
// CASHFLOW Day ×4, green Business Investments, pink Dreams, and the penalty
// spaces (Tax Audit, Divorce, Lawsuit) plus a Charity.
const FT_CASHFLOW = new Set([0, 6, 12, 18])
const FT_DREAM = [1, 3, 5, 8, 10, 14, 19, 22] // one per entry in DREAMS (8)
const FT_BUSINESS = [2, 7, 9, 11, 15, 20, 21, 23] // one per entry in FAST_TRACK_BUSINESSES (8)
const FT_SPECIAL: Record<number, { type: SpaceType; label: string }> = {
  4: { type: 'tax_audit', label: 'Tax Audit' },
  13: { type: 'divorce', label: 'Divorce' },
  16: { type: 'lawsuit', label: 'Lawsuit' },
  17: { type: 'charity', label: 'Charity' },
}

export const FAST_TRACK_SPACES: BoardSpace[] = Array.from({ length: FAST_TRACK_COUNT }, (_, i) => {
  const base: BoardSpace = { id: `ft_${i}`, index: i, track: 'fast_track', type: 'neutral', label: '', ...fastTrackPos(i, FAST_TRACK_COUNT) }

  if (FT_CASHFLOW.has(i)) return { ...base, type: 'cashflow_day', label: 'CASHFLOW Day' }

  const bizIdx = FT_BUSINESS.indexOf(i)
  if (bizIdx >= 0) {
    const biz = FAST_TRACK_BUSINESSES[bizIdx % FAST_TRACK_BUSINESSES.length]
    return { ...base, type: 'business_investment', label: biz.label, businessId: biz.id }
  }

  const dreamIdx = FT_DREAM.indexOf(i)
  if (dreamIdx >= 0) {
    const dream = DREAMS[dreamIdx % DREAMS.length]
    return { ...base, type: 'dream', label: dream.label, dreamId: dream.id }
  }

  const special = FT_SPECIAL[i]
  if (special) return { ...base, type: special.type, label: special.label }

  return base
})

export const ALL_BOARD_SPACES: BoardSpace[] = [...RAT_RACE_SPACES, ...FAST_TRACK_SPACES]
