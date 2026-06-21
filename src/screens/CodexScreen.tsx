import { useMemo, useState } from 'react'
import {
  CATEGORY_LABELS,
  PRINCIPLES,
  PRINCIPLE_CATEGORIES,
  SURFACE_LABELS,
  type Principle,
  type PrincipleCategory,
  type PrincipleSurface,
} from '../domain/data/principles'
import { useDiscoveryStore, discoveredCount } from '../store/discoveryStore'

interface Props {
  onBack: () => void
  /** Label/handler for the primary action — "Back to Menu" or "Back to Game". */
  backLabel?: string
}

/** Accent colour per category — keeps the neon language consistent. */
const CATEGORY_ACCENT: Record<PrincipleCategory, string> = {
  foundations: 'var(--color-gold)',
  mindset: 'var(--color-iris)',
  saving: 'var(--color-seafoam)',
  investing: 'var(--color-azure)',
  debt: 'var(--color-flame)',
  earning: 'var(--color-neon)',
  business: 'var(--color-honey)',
}

const SURFACE_TINT: Record<PrincipleSurface, string> = {
  mechanic: 'var(--color-azure)',
  card: 'var(--color-iris)',
  gauge: 'var(--color-seafoam)',
  win_lose: 'var(--color-gold)',
  concept: 'var(--color-mist)',
}

export function CodexScreen({ onBack, backLabel = 'Back to Menu' }: Props) {
  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState<PrincipleCategory | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [studyMode, setStudyMode] = useState(false)
  const [discoveredOnly, setDiscoveredOnly] = useState(false)

  const discovered = useDiscoveryStore((s) => s.discovered)
  const found = discoveredCount(discovered)
  const total = PRINCIPLES.length
  const pct = Math.round((found / total) * 100)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PRINCIPLES.filter((p) => {
      if (activeCat !== 'all' && p.category !== activeCat) return false
      if (discoveredOnly && !discovered[p.id]) return false
      if (!q) return true
      // Search matches names always; deep fields only on revealed cards.
      const revealed = studyMode || discovered[p.id]
      return (
        p.name.toLowerCase().includes(q) ||
        (revealed &&
          (p.oneLiner.toLowerCase().includes(q) ||
            p.detail.toLowerCase().includes(q) ||
            p.inGame.toLowerCase().includes(q) ||
            p.sources.some((s) => s.toLowerCase().includes(q))))
      )
    })
  }, [query, activeCat, discoveredOnly, studyMode, discovered])

  // Group filtered results by category, preserving canonical order.
  const groups = useMemo(() => {
    return PRINCIPLE_CATEGORIES.map((cat) => ({
      cat,
      items: filtered.filter((p) => p.category === cat),
    })).filter((g) => g.items.length > 0)
  }, [filtered])

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: 'var(--color-ink)' }}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-xs tracking-wider transition-colors"
            style={{ color: 'var(--color-fog)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-mist)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-fog)' }}
          >
            ← {backLabel}
          </button>
          <span className="text-[10px] tracking-[0.3em] uppercase font-medium" style={{ color: 'var(--color-fog)' }}>
            {PRINCIPLES.length} principles
          </span>
        </div>

        <h1
          className="text-4xl font-light mb-1"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-snow)' }}
        >
          The <span style={{ color: 'var(--color-gold)' }} className="text-glow-soft">Wealth Codex</span>
        </h1>
        <p className="text-sm leading-relaxed mb-7 max-w-2xl" style={{ color: 'var(--color-mist)' }}>
          Every idea this game is built on — from <em>Rich Dad Poor Dad</em> and the{' '}
          <em>Richest Man in Babylon</em> to <em>Psychology of Money</em>, <em>Naval</em>,{' '}
          <em>Profit First</em> and the <em>Fastlane</em>. You <strong style={{ color: 'var(--color-snow)' }}>unlock
          each one by meeting it in play</strong> — drawing its card, or reaching the financial state it describes.
        </p>

        {/* Discovery progress */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--color-gold)' }}>
              Discovered in play
            </span>
            <span className="text-xs font-bold" style={{ color: 'var(--color-snow)', fontFamily: 'var(--font-data)' }}>
              {found} / {total}
              <span style={{ color: 'var(--color-fog)' }}> · {pct}%</span>
            </span>
          </div>
          <div className="neon-bar h-2">
            <div
              className="neon-bar-fill"
              style={{ width: `${pct}%`, background: 'var(--color-gold)', boxShadow: '0 0 10px var(--color-gold)' }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
            <ToggleChip label="Show locked" active={!discoveredOnly} onClick={() => setDiscoveredOnly((v) => !v)} />
            <ToggleChip label="Study mode (reveal all)" active={studyMode} onClick={() => setStudyMode((v) => !v)} />
            {found === total && (
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-seafoam)' }}>
                ◆ Codex complete — every principle played ◆
              </span>
            )}
          </div>
        </div>

        {/* Search */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search principles, books, ideas…"
          className="w-full mb-4 px-3.5 py-2.5 text-sm outline-none"
          style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-rim)',
            borderRadius: '4px',
            color: 'var(--color-snow)',
            fontFamily: 'var(--font-ui)',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-gold)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-rim)' }}
        />

        {/* Category filter rail */}
        <div className="flex flex-wrap gap-2 mb-7">
          <FilterChip label="All" active={activeCat === 'all'} accent="var(--color-snow)" onClick={() => setActiveCat('all')} />
          {PRINCIPLE_CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              label={CATEGORY_LABELS[cat]}
              active={activeCat === cat}
              accent={CATEGORY_ACCENT[cat]}
              onClick={() => setActiveCat(cat)}
            />
          ))}
        </div>

        {/* Grouped results */}
        {groups.length === 0 && (
          <p className="text-sm py-10 text-center" style={{ color: 'var(--color-fog)' }}>
            {query.trim()
              ? `No principles match “${query}”.`
              : discoveredOnly
                ? 'Nothing discovered yet — play a few turns, or turn on “Study mode” to read them all.'
                : 'No principles to show.'}
          </p>
        )}

        {groups.map((g) => (
          <section key={g.cat} className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-1.5 h-4" style={{ background: CATEGORY_ACCENT[g.cat], borderRadius: '1px' }} />
              <h2
                className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: 'var(--color-mist)' }}
              >
                {CATEGORY_LABELS[g.cat]}
              </h2>
              <span className="text-[10px]" style={{ color: 'var(--color-fog)', fontFamily: 'var(--font-data)' }}>
                {g.items.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {g.items.map((p) => (
                <PrincipleCard
                  key={p.id}
                  principle={p}
                  accent={CATEGORY_ACCENT[p.category]}
                  revealed={studyMode || !!discovered[p.id]}
                  discovered={!!discovered[p.id]}
                  open={expanded === p.id}
                  onToggle={() => setExpanded((cur) => (cur === p.id ? null : p.id))}
                />
              ))}
            </div>
          </section>
        ))}

        <div className="flex justify-center mt-10">
          <button
            onClick={onBack}
            className="py-3 px-8 font-medium text-xs tracking-[0.1em] uppercase transition-all"
            style={{ border: '1px solid var(--color-rim)', color: 'var(--color-mist)', borderRadius: '3px', background: 'transparent', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-wire)'; e.currentTarget.style.color = 'var(--color-snow)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-rim)'; e.currentTarget.style.color = 'var(--color-mist)' }}
          >
            {backLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function FilterChip({ label, active, accent, onClick }: { label: string; active: boolean; accent: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase transition-all"
      style={{
        borderRadius: '999px',
        border: `1px solid ${active ? accent : 'var(--color-rim)'}`,
        background: active ? accent : 'transparent',
        color: active ? 'var(--color-ink)' : 'var(--color-fog)',
        fontFamily: 'var(--font-ui)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--color-mist)' }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--color-fog)' }}
    >
      {label}
    </button>
  )
}

function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors"
      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: active ? 'var(--color-mist)' : 'var(--color-fog)' }}
    >
      <span
        className="flex items-center justify-center"
        style={{
          width: '13px', height: '13px', borderRadius: '3px',
          border: `1px solid ${active ? 'var(--color-gold)' : 'var(--color-wire)'}`,
          background: active ? 'var(--color-gold)' : 'transparent',
          color: 'var(--color-ink)', fontSize: '9px', fontWeight: 900,
        }}
      >
        {active ? '✓' : ''}
      </span>
      {label}
    </button>
  )
}

function PrincipleCard({
  principle: p,
  accent,
  revealed,
  discovered,
  open,
  onToggle,
}: {
  principle: Principle
  accent: string
  revealed: boolean
  discovered: boolean
  open: boolean
  onToggle: () => void
}) {
  // Locked = not yet encountered in play and not in study mode. Show a teaser only.
  if (!revealed) {
    return (
      <div
        className="text-left p-3.5"
        style={{
          background: 'var(--color-paper)',
          border: '1px dashed var(--color-rim)',
          borderRadius: '5px',
          opacity: 0.7,
        }}
        title="Encounter this principle in play to unlock it"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--color-fog)' }}>
            {p.name}
          </h3>
          <span className="flex-shrink-0 text-[11px]" aria-hidden>🔒</span>
        </div>
        <p className="text-[10px] mt-2 tracking-wider uppercase" style={{ color: 'var(--color-fog)' }}>
          Locked · {SURFACE_LABELS[p.surface]} · reach it in play
        </p>
      </div>
    )
  }

  return (
    <button
      onClick={onToggle}
      className="text-left p-3.5 transition-all"
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-rim)',
        borderLeft: `2px solid ${accent}`,
        borderRadius: '5px',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-wire)'; e.currentTarget.style.borderLeftColor = accent }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-rim)'; e.currentTarget.style.borderLeftColor = accent }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[13px] font-semibold leading-tight flex items-center gap-1.5" style={{ color: 'var(--color-snow)' }}>
          {discovered && <span aria-hidden style={{ color: 'var(--color-seafoam)', fontSize: '10px' }}>✓</span>}
          {p.name}
        </h3>
        <span
          className="flex-shrink-0 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5"
          style={{
            color: SURFACE_TINT[p.surface],
            border: `1px solid ${SURFACE_TINT[p.surface]}`,
            borderRadius: '3px',
            opacity: 0.85,
          }}
        >
          {SURFACE_LABELS[p.surface]}
        </span>
      </div>

      <p className="text-[12px] leading-snug mt-1.5" style={{ color: 'var(--color-mist)' }}>
        {p.oneLiner}
      </p>

      {open && (
        <div className="mt-3 space-y-2.5">
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-fog)' }}>
            {p.detail}
          </p>
          <div className="pl-2.5" style={{ borderLeft: `2px solid ${accent}` }}>
            <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: accent }}>
              In the game
            </p>
            <p className="text-[11.5px] leading-snug" style={{ color: 'var(--color-mist)' }}>
              {p.inGame}
            </p>
          </div>
          <p className="text-[10px]" style={{ color: 'var(--color-fog)', fontFamily: 'var(--font-data)' }}>
            {p.sources.join(' · ')}
          </p>
        </div>
      )}

      {!open && (
        <p className="text-[9px] mt-2 tracking-wider uppercase" style={{ color: 'var(--color-fog)' }}>
          {p.sources[0]}{p.sources.length > 1 ? ` +${p.sources.length - 1}` : ''} · tap to expand
        </p>
      )}
    </button>
  )
}
