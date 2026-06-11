import type { PlayerState, AnchorId } from '../../domain/entities/types'
import { Tooltip } from '../ui/Tooltip'
import { ANCHOR_INFO, InfoContent } from '../ui/conceptInfo'

const ANCHORS: { id: AnchorId; icon: string; label: string }[] = [
  { id: 'door',   icon: '🚪', label: 'Door' },
  { id: 'scale',  icon: '⚖️', label: 'Scale' },
  { id: 'safe',   icon: '🔒', label: 'Safe' },
  { id: 'chain',  icon: '⛓️', label: 'Chain' },
  { id: 'engine', icon: '⚙️', label: 'Engine' },
  { id: 'shield', icon: '🛡️', label: 'Shield' },
]

interface Props { player: PlayerState }

export function AnchorProgressBar({ player }: Props) {
  const completedCount = ANCHORS.filter(({ id }) =>
    player.anchors.find((a) => a.anchorId === id)?.unlocked
  ).length

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-fog)' }}
        >
          Six Anchors
        </p>
        <span
          className="text-[10px]"
          style={{ color: 'var(--color-mist)', fontFamily: 'var(--font-data)' }}
        >
          {completedCount}/6
        </span>
      </div>

      <div className="flex gap-0.5">
        {ANCHORS.map(({ id, icon, label }) => {
          const unlocked = player.anchors.find((a) => a.anchorId === id)?.unlocked ?? false
          return (
            <Tooltip key={id} content={<InfoContent info={ANCHOR_INFO[id]} />}>
              <div className="flex flex-col items-center gap-0.5 flex-1" style={{ cursor: 'help' }}>
                <div
                  className="w-7 h-7 flex items-center justify-center text-sm transition-all duration-300"
                  style={{
                    background: unlocked ? 'rgba(200,150,60,0.15)' : 'var(--color-rim)',
                    border: `1px solid ${unlocked ? 'rgba(200,150,60,0.45)' : 'transparent'}`,
                    borderRadius: '3px',
                    filter: unlocked ? 'none' : 'grayscale(1) brightness(0.25)',
                    boxShadow: unlocked ? '0 0 7px rgba(200,150,60,0.35)' : 'none',
                  }}
                >
                  {icon}
                </div>
                <span
                  className="text-[8px] truncate w-full text-center"
                  style={{ color: unlocked ? 'var(--color-gold)' : 'var(--color-fog)' }}
                >
                  {label}
                </span>
              </div>
            </Tooltip>
          )
        })}
      </div>

      <div
        className="mt-1.5 h-px overflow-hidden"
        style={{ background: 'var(--color-rim)', borderRadius: '1px' }}
      >
        <div
          className="h-full transition-all duration-700"
          style={{
            width: `${(completedCount / 6) * 100}%`,
            background: 'var(--color-gold)',
          }}
        />
      </div>
    </div>
  )
}
