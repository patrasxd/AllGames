import { memo } from 'react'
import type { PlayerProgress } from '../types'
import { StarIcon, LockIcon } from './Icons'

interface LevelSelectModalProps {
  progress: PlayerProgress
  currentLevel: number
  onSelectLevel: (lvl: number) => void
  onClose: () => void
  isPl?: boolean
}

export const LevelSelectModal = memo(function LevelSelectModal({
  progress,
  currentLevel,
  onSelectLevel,
  onClose,
  isPl = false,
}: LevelSelectModalProps) {
  // Show unlocked levels + 6 upcoming preview levels
  const maxDisplayLevel = Math.max(12, progress.unlockedLevel + 6)
  const levels = Array.from({ length: maxDisplayLevel }, (_, i) => i + 1)

  return (
    <div className="cm-modal-overlay" role="dialog" aria-modal="true">
      <div className="cm-level-modal">
        <div className="cm-level-modal-header">
          <h3 className="cm-level-modal-title">
            {isPl ? 'Wybór Poziomu' : 'Select Level'}
          </h3>
          <button
            type="button"
            className="cm-modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="cm-level-grid">
          {levels.map(lvl => {
            const isUnlocked = lvl <= progress.unlockedLevel
            const isCurrent = lvl === currentLevel
            const stars = progress.levelStars[lvl] || 0
            const highScore = progress.levelHighScores[lvl]

            return (
              <button
                key={lvl}
                type="button"
                className={`cm-level-card ${isUnlocked ? 'cm-level-card--unlocked' : 'cm-level-card--locked'} ${
                  isCurrent ? 'cm-level-card--current' : ''
                }`}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectLevel(lvl)
                  }
                }}
                disabled={!isUnlocked}
                aria-label={`Level ${lvl}${isUnlocked ? ` - ${stars} stars` : ' locked'}`}
              >
                <div className="cm-level-num">
                  {isUnlocked ? lvl : <LockIcon />}
                </div>

                {isUnlocked && (
                  <div className="cm-level-stars">
                    <StarIcon filled={stars >= 1} />
                    <StarIcon filled={stars >= 2} />
                    <StarIcon filled={stars >= 3} />
                  </div>
                )}

                {isUnlocked && highScore && (
                  <div className="cm-level-score">{highScore}</div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
})
