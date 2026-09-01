import { memo, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { GameButton } from './GameButton'

export interface ResultStatItem {
  label: string
  value: ReactNode
}

export interface GameResultOverlayProps {
  status: 'won' | 'lost' | 'draw'
  title: string
  subtitle?: string
  stats?: ResultStatItem[]
  isEink?: boolean
  playAgainText?: string
  onPlayAgain: () => void
  playAgainId?: string
  secondaryAction?: {
    label: string
    onClick: () => void
    id?: string
  }
}

export const GameResultOverlay = memo(function GameResultOverlay({
  status,
  title,
  subtitle,
  stats,
  isEink = false,
  playAgainText = 'Play again',
  onPlayAgain,
  playAgainId,
  secondaryAction,
}: GameResultOverlayProps) {
  return (
    <motion.div
      className={`game-result-overlay game-result-overlay--${status}`}
      initial={!isEink ? { opacity: 0, scale: 0.94 } : false}
      animate={{ opacity: 1, scale: 1 }}
      exit={!isEink ? { opacity: 0, scale: 0.94 } : undefined}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
    >
      <div className="game-result-card">
        <h3 className="game-result-title">{title}</h3>
        {subtitle && <p className="game-result-subtitle">{subtitle}</p>}
        {stats && stats.length > 0 && (
          <div className="game-result-stats">
            {stats.map(s => (
              <div key={s.label} className="game-result-stat">
                <span className="game-result-stat-val">{s.value}</span>
                <span className="game-result-stat-key">{s.label}</span>
              </div>
            ))}
          </div>
        )}
        <div className="game-result-actions">
          {secondaryAction && (
            <GameButton
              id={secondaryAction.id}
              variant="secondary"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </GameButton>
          )}
          <GameButton
            id={playAgainId}
            variant="primary"
            onClick={onPlayAgain}
          >
            {playAgainText}
          </GameButton>
        </div>
      </div>
    </motion.div>
  )
})
