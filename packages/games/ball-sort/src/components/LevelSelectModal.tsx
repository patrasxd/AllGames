import { Dialog } from '@all/ui'
import type { PlayerProgress } from '../types'
import { StarIcon, LockIcon } from './Icons'
import type { BallSortTranslations } from '../i18n'

interface LevelSelectModalProps {
  open: boolean
  onClose: () => void
  onSelect: (level: number) => void
  currentLevel: number
  maxLevel: number
  progress: PlayerProgress
  t: BallSortTranslations
}

export function LevelSelectModal({
  open,
  onClose,
  onSelect,
  currentLevel,
  maxLevel,
  progress,
  t,
}: LevelSelectModalProps) {
  return (
    <Dialog open={open} onClose={onClose} title={t.chooseLevel} maxWidth="lg">
      <div className="bs-level-grid">
        {Array.from({ length: maxLevel }, (_, i) => i + 1).map((level) => {
          const unlocked = level <= progress.unlockedLevel
          const stars = progress.levelStars[level] ?? 0
          const isCurrent = level === currentLevel
          return (
            <button
              key={level}
              type="button"
              className={`bs-level-cell ${isCurrent ? 'bs-level-cell--current' : ''} ${!unlocked ? 'bs-level-cell--locked' : ''}`}
              disabled={!unlocked}
              onClick={() => {
                onSelect(level)
                onClose()
              }}
              aria-label={
                unlocked
                  ? `${t.level(level)}${stars > 0 ? `, ${t.levelStars(stars)}` : ''}`
                  : `${t.level(level)}, ${t.levelLocked}`
              }
            >
              {unlocked ? (
                <>
                  <span className="bs-level-num">{level}</span>
                  <span className="bs-level-stars">
                    {[1, 2, 3].map((s) => (
                      <StarIcon key={s} filled={s <= stars} />
                    ))}
                  </span>
                </>
              ) : (
                <LockIcon />
              )}
            </button>
          )
        })}
      </div>
    </Dialog>
  )
}
