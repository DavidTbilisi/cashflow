interface Props {
  onBack: () => void
  onStartTutorial: () => void
}

const TILES: Array<{ icon: string; name: string; desc: string }> = [
  { icon: '💰', name: 'Payday', desc: 'Collect your Monthly Cash Flow each time you land on or pass it.' },
  { icon: '🎯', name: 'Opportunity', desc: 'Draw a Small or Big Deal — your chance to buy income-producing assets.' },
  { icon: '💸', name: 'Expense', desc: 'A lifestyle cost. Needs are mandatory; Wants you can skip.' },
  { icon: '📈', name: 'The Market', desc: 'A buyer appears — sell a matching asset at the offered price.' },
  { icon: '❤️', name: 'Charity', desc: 'Donate 10% of income to roll extra dice on your next turns.' },
  { icon: '👶', name: 'Baby', desc: 'A new child (max 3) adds a recurring monthly expense.' },
  { icon: '📉', name: 'Downsized', desc: 'Pay your total expenses and lose two turns.' },
  { icon: '⚓', name: 'Anchor', desc: 'A Six-Anchor milestone on your path to financial security.' },
]

const CONCEPTS: Array<{ title: string; body: string }> = [
  { title: 'Passive income', body: 'Money your assets earn without your effort — rent, dividends, business profit. Growing it is how you win.' },
  { title: 'The Rat Race', body: 'The inner loop: earn a salary, pay expenses, repeat. You escape the instant your passive income covers your expenses.' },
  { title: 'The Fast Track', body: 'The outer loop you reach after escaping. Buy big businesses and your chosen Dream to win the game.' },
  { title: 'ESBI quadrant', body: 'Employee → Self-employed → Business owner → Investor. Advancing shifts how you earn — from your time to your money.' },
]

export function HowToPlayScreen({ onBack, onStartTutorial }: Props) {
  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: 'var(--color-ink)' }}>
      <div className="max-w-2xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="text-xs tracking-wider transition-colors"
            style={{ color: 'var(--color-fog)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-mist)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-fog)' }}
          >
            ← Back
          </button>
          <span className="text-[10px] tracking-[0.3em] uppercase font-medium" style={{ color: 'var(--color-fog)' }}>
            How to Play
          </span>
        </div>

        <h1 className="text-4xl font-light mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-snow)' }}>
          Escape the <span style={{ color: 'var(--color-gold)' }}>Rat Race</span>
        </h1>
        <p className="text-sm leading-relaxed mb-10" style={{ color: 'var(--color-mist)' }}>
          The goal is simple: build enough <strong style={{ color: 'var(--color-azure)' }}>passive income</strong> to cover your monthly
          expenses. The moment it does, you break out of the Rat Race and onto the Fast Track — where you race to buy your Dream.
        </p>

        <Section title="A turn, step by step">
          <ol className="space-y-2.5">
            {[
              ['Roll & move', 'Roll the die (Space or the Roll button) and advance your pawn.'],
              ['Resolve the tile', 'Each tile triggers something — a deal, an expense, a payday. A card or prompt guides you.'],
              ['Decide', 'Buy the asset, pay the expense, or pass. Watch your cash and cash flow.'],
              ['End turn', 'Wrap up (Enter) and play passes on.'],
            ].map(([t, d], i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--color-gold)', color: 'var(--color-ink)', borderRadius: '50%' }}>{i + 1}</span>
                <span className="text-[13px] leading-snug" style={{ color: 'var(--color-mist)' }}>
                  <strong style={{ color: 'var(--color-snow)' }}>{t}.</strong> {d}
                </span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="The tiles">
          <div className="grid grid-cols-2 gap-2">
            {TILES.map((tile) => (
              <div key={tile.name} className="flex gap-2.5 p-2.5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-rim)', borderRadius: '4px' }}>
                <span className="text-lg leading-none flex-shrink-0">{tile.icon}</span>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-snow)' }}>{tile.name}</p>
                  <p className="text-[11px] leading-snug mt-0.5" style={{ color: 'var(--color-fog)' }}>{tile.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Key ideas">
          <div className="space-y-2.5">
            {CONCEPTS.map((c) => (
              <div key={c.title} className="pl-3" style={{ borderLeft: '2px solid var(--color-gold)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-snow)' }}>{c.title}</p>
                <p className="text-[13px] leading-relaxed mt-0.5" style={{ color: 'var(--color-mist)' }}>{c.body}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="How to win — and lose">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3" style={{ background: 'rgba(45,212,191,0.07)', border: '1px solid rgba(45,212,191,0.25)', borderRadius: '4px' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-seafoam)' }}>Win</p>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-mist)' }}>
                Reach the Fast Track, then buy your chosen Dream — or grow your CASHFLOW Day income by +$50,000.
              </p>
            </div>
            <div className="p-3" style={{ background: 'rgba(240,96,112,0.07)', border: '1px solid rgba(240,96,112,0.25)', borderRadius: '4px' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-flame)' }}>Lose</p>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-mist)' }}>
                Go bankrupt — run out of cash with expenses you can't pay and no assets left to sell.
              </p>
            </div>
          </div>
        </Section>

        <div className="flex gap-3 mt-10">
          <button
            onClick={onStartTutorial}
            className="flex-1 py-3.5 font-semibold text-xs tracking-[0.15em] uppercase transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'var(--color-gold)', color: 'var(--color-ink)', borderRadius: '3px', border: 'none', cursor: 'pointer' }}
          >
            Try the Guided Tutorial
          </button>
          <button
            onClick={onBack}
            className="flex-1 py-3.5 font-medium text-xs tracking-[0.1em] uppercase transition-all"
            style={{ border: '1px solid var(--color-rim)', color: 'var(--color-mist)', borderRadius: '3px', background: 'transparent', cursor: 'pointer' }}
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-9">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--color-fog)' }}>{title}</h2>
      {children}
    </div>
  )
}
