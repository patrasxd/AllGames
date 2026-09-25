import { memo } from 'react'
import { Dialog } from '@all/ui'
import type { PlayerProgress } from '../types'
import { StarIcon, LockIcon } from './Icons'

interface LevelSelectModalProps {
  isOpen: boolean
  progress: PlayerProgress
  currentLevel: number
  onSelectLevel: (lvl: number) => void
  onClose: () => void
  title: string
}

export const LevelSelectModal = memo(function LevelSelectModal({
  isOpen,
  progress,
  currentLevel,
  onSelectLevel,
  onClose,
  title,
}: LevelSelectModalProps) {
  // Show unlocked levels + 6 upcoming preview levels
  const maxDisplayLevel = Math.max(12, progress.unlockedLevel + 6)
  const levels = Array.from({ length: maxDisplayLevel }, (_, i) => i + 1)

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} maxWidth="md" className="cm-dialog">
      <div className="cm-level-grid">
        {levels.map((lvl) => {
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
              <div className="cm-level-num">{isUnlocked ? lvl : <LockIcon />}</div>

              {isUnlocked && (
                <div className="cm-level-stars">
                  <StarIcon filled={stars >= 1} />
                  <StarIcon filled={stars >= 2} />
                  <StarIcon filled={stars >= 3} />
                </div>
              )}

              {isUnlocked && highScore && <div className="cm-level-score">{highScore}</div>}
            </button>
          )
        })}
      </div>
    </Dialog>
  )
})
