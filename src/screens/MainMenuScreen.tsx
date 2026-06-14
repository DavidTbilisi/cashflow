import { loadGame } from '../utils/persistence'

interface Props {
  onNewGame: () => void
  onContinue: () => void
  onTutorial: () => void
  onHowToPlay: () => void
}

export function MainMenuScreen({ onNewGame, onContinue, onTutorial, onHowToPlay }: Props) {
  const hasSave = !!loadGame()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background: 'var(--color-ink)',
        backgroundImage: [
          'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(200,150,60,0.07) 0%, transparent 70%)',
          'linear-gradient(rgba(200,150,60,0.022) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(200,150,60,0.022) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: 'auto, 60px 60px, 60px 60px',
      }}
    >
      <div className="flex flex-col items-center gap-8 px-8">

        <div className="flex items-center gap-3">
          <div className="h-px w-10" style={{ background: 'rgba(200,150,60,0.35)' }} />
          <span
            className="text-[10px] font-medium tracking-[0.32em] uppercase"
            style={{ color: 'rgba(200,150,60,0.6)', fontFamily: 'var(--font-ui)' }}
          >
            Financial Intelligence Game
          </span>
          <div className="h-px w-10" style={{ background: 'rgba(200,150,60,0.35)' }} />
        </div>

        <div className="text-center">
          <h1
            className="leading-none font-light tracking-tight"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(72px, 10vw, 108px)' }}
          >
            <span style={{ color: 'var(--color-gold)' }}>Cash</span>
            <span style={{ color: 'var(--color-snow)' }}>Flow</span>
          </h1>
          <p
            className="text-lg italic tracking-wide mt-2"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-mist)' }}
          >
            Escape the Rat Race. Build lasting wealth.
          </p>
        </div>

        <div className="flex items-center gap-3 w-48">
          <div className="h-px flex-1" style={{ background: 'var(--color-rim)' }} />
          <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(200,150,60,0.45)' }} />
          <div className="h-px flex-1" style={{ background: 'var(--color-rim)' }} />
        </div>

        <div className="flex flex-col gap-2.5 w-52">
          <button
            onClick={onNewGame}
            className="w-full py-3.5 font-semibold text-xs tracking-[0.15em] uppercase transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{
              background: 'var(--color-gold)',
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-ui)',
              borderRadius: '3px',
            }}
          >
            New Game
          </button>
          <button
            onClick={onTutorial}
            className="w-full py-3 font-medium text-xs tracking-[0.1em] uppercase transition-all"
            style={{
              border: '1px solid rgba(200,150,60,0.45)',
              color: 'var(--color-gold)',
              fontFamily: 'var(--font-ui)',
              borderRadius: '3px',
              background: 'rgba(200,150,60,0.06)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(200,150,60,0.14)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(200,150,60,0.06)' }}
          >
            Tutorial
          </button>
          <button
            onClick={onHowToPlay}
            className="w-full py-3 font-medium text-xs tracking-[0.1em] transition-all"
            style={{
              border: '1px solid var(--color-rim)',
              color: 'var(--color-mist)',
              fontFamily: 'var(--font-ui)',
              borderRadius: '3px',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-wire)'
              e.currentTarget.style.color = 'var(--color-snow)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-rim)'
              e.currentTarget.style.color = 'var(--color-mist)'
            }}
          >
            How to Play
          </button>
          {hasSave && (
            <button
              onClick={onContinue}
              className="w-full py-3 font-medium text-xs tracking-[0.1em] transition-all"
              style={{
                border: '1px solid var(--color-rim)',
                color: 'var(--color-mist)',
                fontFamily: 'var(--font-ui)',
                borderRadius: '3px',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-wire)'
                e.currentTarget.style.color = 'var(--color-snow)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-rim)'
                e.currentTarget.style.color = 'var(--color-mist)'
              }}
            >
              Continue
            </button>
          )}
        </div>

        <p
          className="text-[11px] text-center max-w-xs leading-loose tracking-wide"
          style={{ color: 'var(--color-fog)' }}
        >
          Build passive income · Complete Six Anchors · Achieve financial freedom
        </p>

      </div>
    </div>
  )
}
