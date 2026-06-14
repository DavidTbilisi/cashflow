import type { CSSProperties, ReactNode } from 'react'
import type { AnchorId, BoardSpace, ESBIQuadrant } from '../../domain/entities/types'
import { Tooltip } from './Tooltip'

/** A teachable concept: a heading, an explanation, and an optional rule hint. */
export interface ConceptInfo {
  title: string
  body: string
  /** Short, concrete unlock/advance condition shown in mono under a divider. */
  hint?: string
}

/* ── Six Anchors — copy mirrors the real unlock rules in anchorRules.ts ─── */

export const ANCHOR_INFO: Record<AnchorId, ConceptInfo> = {
  door: {
    title: 'The Door — Get Earning',
    body: 'Your first anchor: money is coming in. You step through the door to wealth the moment you have any monthly income to build on.',
    hint: 'Unlock: any monthly income above $0',
  },
  scale: {
    title: 'The Scale — Live Below Your Means',
    body: 'Keep your cash flow positive three turns in a row. Spending less than you earn is the balance every wealthy plan is built on.',
    hint: 'Unlock: 3 turns of positive cash flow in a row',
  },
  safe: {
    title: 'The Safe — Emergency Buffer',
    body: 'Bank six months of expenses in cash. This cushion lets you invest and take risks without one bad month wiping you out.',
    hint: 'Unlock: cash ≥ 6 × monthly expenses',
  },
  chain: {
    title: 'The Chain — Good Leverage',
    body: "Borrow to acquire an income-producing asset. Used wisely, debt becomes a chain that pulls your wealth forward instead of dragging it down.",
    hint: 'Unlock: a loan tied to an income asset',
  },
  engine: {
    title: 'The Engine — Passive Income',
    body: "Build your first stream of passive income — money that arrives whether or not you work. Even a dollar a month fires up the engine.",
    hint: 'Unlock: passive income above $0',
  },
  shield: {
    title: 'The Shield — Protect It',
    body: 'Your passive income now covers at least half your expenses. Legal structures and insurance shield the wealth you have built.',
    hint: 'Unlock: passive income ≥ 50% of expenses',
  },
}

/* ── ESBI / Cashflow Quadrant — advance rules mirror quadrantRules.ts ───── */

export const QUADRANT_INFO: Record<ESBIQuadrant, ConceptInfo> = {
  E: {
    title: 'E — Employee',
    body: 'You trade time for a paycheck and work for the system. Security is the draw, but your income stops the moment you do.',
    hint: 'Advance to S: add a second, non-job income source',
  },
  S: {
    title: 'S — Self-Employed',
    body: 'You own a job: more control, but the business still depends on you. Turn it into a system that runs without you to reach B.',
    hint: 'Advance to B: own a business asset',
  },
  B: {
    title: 'B — Business Owner',
    body: 'You own a system and people work for you. Your time is freed — now put your capital to work as well.',
    hint: 'Advance to I: earn any passive income',
  },
  I: {
    title: 'I — Investor',
    body: 'Money works for you. Your assets generate income without your labour — the top of the Cashflow Quadrant.',
    hint: 'Top of the ladder',
  },
}

/* ── Financial statement terms ──────────────────────────────────────────── */

export type TermKey =
  | 'netWorth'
  | 'cashFlow'
  | 'passiveIncome'
  | 'assets'
  | 'liabilities'
  | 'cash'
  | 'freedomGauge'
  | 'income'
  | 'expenses'

export const TERM_INFO: Record<TermKey, ConceptInfo> = {
  netWorth: {
    title: 'Net Worth',
    body: 'Everything you own minus everything you owe (total assets − total liabilities). The single scoreboard of financial progress.',
  },
  cashFlow: {
    title: 'Cash Flow — Payday',
    body: "Monthly income minus monthly expenses. Positive cash flow is money left over to invest each turn; negative means you're sinking.",
  },
  passiveIncome: {
    title: 'Passive Income',
    body: "Income from assets that doesn't need your active work. When it grows past your expenses you win — you've escaped the Rat Race.",
  },
  assets: {
    title: 'Assets',
    body: 'Things that put money in your pocket — rentals, businesses, dividends. The rich buy assets; assets buy freedom.',
  },
  liabilities: {
    title: 'Liabilities',
    body: 'Things that take money out of your pocket — loans, credit, mortgages. Trimming these keeps more of your cash flow.',
  },
  cash: {
    title: 'Cash on Hand',
    body: 'Liquid money available right now to seize deals and absorb surprise expenses. Necessary, but idle cash earns nothing.',
  },
  freedomGauge: {
    title: 'Freedom Gauge',
    body: 'How much of your monthly expenses your passive income already covers. Reach 100% and you are financially free.',
  },
  income: {
    title: 'Income',
    body: 'All money flowing in each month — job, side gigs, and passive streams. Growing the passive share is what frees you.',
  },
  expenses: {
    title: 'Expenses',
    body: 'All money flowing out each month — taxes, living costs, and debt payments. Your passive income must clear this bar to win.',
  },
}

/* ── Board tiles ────────────────────────────────────────────────────────── */

const PAYDAY_INFO: ConceptInfo = {
  title: 'Payday',
  body: 'Land on or pass Payday to collect your monthly cash flow — income minus expenses. The bigger your passive income, the fatter every payday.',
}

const FAST_TRACK_ENTRY_INFO: ConceptInfo = {
  title: 'Fast Track',
  body: 'The exit from the Rat Race. Step onto the outer loop where wealth compounds — big deals, big businesses, big dreams.',
  hint: 'Reached once passive income ≥ expenses',
}

const NEUTRAL_INFO: ConceptInfo = {
  title: 'Open Space',
  body: 'A quiet square — nothing happens here. A breather before your next roll.',
}

// Card-draw tiles, keyed by their board label.
const CARD_DRAW_INFO: Record<string, ConceptInfo> = {
  Opportunity: {
    title: 'Opportunity',
    body: 'Draw a deal — a chance to buy an income-producing asset or pick up new income. This is how you climb toward freedom.',
  },
  Setback: {
    title: 'Setback',
    body: 'Draw an expense or obstacle — a surprise bill or bad break. Your emergency buffer (the Safe anchor) is what carries you through.',
  },
  Decide: {
    title: 'Decision',
    body: 'Draw a temptation or a system-building choice. Big ventures must pass the NECST test before you commit your money.',
  },
  Draw: {
    title: 'Draw a Card',
    body: 'Could be income, an expense, or an asset. Stay liquid enough to handle whatever turns up.',
  },
  'Big Deal': {
    title: 'Big Deal',
    body: 'A large-scale investment or business — the high-stakes deals that can multiply your passive income on the Fast Track.',
  },
  Market: {
    title: 'Market',
    body: 'Shifting market conditions and decisions that move the value and income of the assets you hold.',
  },
  Network: {
    title: 'Network',
    body: 'Draw a relationship card. Build Social Capital by giving first, then spend it on off-market deals and favors that cash alone can’t reach.',
  },
}

/** Tooltip copy for any board tile, by its type (anchors reuse ANCHOR_INFO). */
export function boardSpaceInfo(space: BoardSpace): ConceptInfo {
  if (space.type === 'anchor_milestone' && space.anchorId) return ANCHOR_INFO[space.anchorId]
  switch (space.type) {
    case 'payday':
      return PAYDAY_INFO
    case 'fast_track_entry':
      return FAST_TRACK_ENTRY_INFO
    case 'card_draw':
      return CARD_DRAW_INFO[space.label] ?? CARD_DRAW_INFO.Draw
    default:
      return NEUTRAL_INFO
  }
}

/* ── Presentation ───────────────────────────────────────────────────────── */

/** Renders a ConceptInfo as the body of a tooltip. */
export function InfoContent({ info }: { info: ConceptInfo }) {
  return (
    <div>
      <p
        style={{
          margin: 0,
          color: 'var(--color-gold)',
          fontWeight: 700,
          fontSize: '11px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {info.title}
      </p>
      <p style={{ margin: '5px 0 0', color: 'var(--color-snow)' }}>{info.body}</p>
      {info.hint && (
        <p
          style={{
            margin: '7px 0 0',
            paddingTop: '6px',
            borderTop: '1px solid var(--color-rim)',
            color: 'var(--color-fog)',
            fontFamily: 'var(--font-data)',
            fontSize: '10px',
            letterSpacing: '0.02em',
          }}
        >
          {info.hint}
        </p>
      )}
    </div>
  )
}

const helpStyle: CSSProperties = {
  cursor: 'help',
  textDecorationLine: 'underline',
  textDecorationStyle: 'dotted',
  textDecorationColor: 'rgba(128,144,168,0.5)',
  textUnderlineOffset: '3px',
}

/**
 * A label that reveals a concept tooltip after the hover delay. Renders an
 * inline `<span>` (so it slots in wherever a label string would) with a subtle
 * dotted underline + `cursor: help` to signal there's more to read.
 */
export function InfoLabel({
  info,
  children,
  className,
  style,
  delay,
  underline = true,
}: {
  info: ConceptInfo
  children: ReactNode
  className?: string
  style?: CSSProperties
  delay?: number
  underline?: boolean
}) {
  return (
    <Tooltip content={<InfoContent info={info} />} delay={delay}>
      <span className={className} style={{ ...(underline ? helpStyle : { cursor: 'help' }), ...style }}>
        {children}
      </span>
    </Tooltip>
  )
}
