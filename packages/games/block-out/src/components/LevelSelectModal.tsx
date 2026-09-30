import { Dialog } from '@all/ui'
import type { PlayerProgress } from '../types'
import { StarIcon, LockIcon } from './Icons'
import type { BlockOutTranslations } from '../i18n'

interface LevelSelectModalProps {
  open: boolean
  onClose: () => void
  onSelect: (level: number) => void
  currentLevel: number
  maxLevel: number
  progress: PlayerProgress
  t: BlockOutTranslations
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
    <Dialog isOpen={open} onClose={onClose} title={t.chooseLevel} maxWidth="lg" className="bo-dialog">
      <div className="bo-level-grid">
        {Array.from({ length: maxLevel }, (_, i) => i + 1).map((level) => {
          const unlocked = level <= progress.unlockedLevel
          const stars = progress.levelStars[level] ?? 0
          const isCurrent = level === currentLevel

          return (
            <button
              key={level}
              type="button"
              className={`bo-level-cell ${isCurrent ? 'bo-level-cell--current' : ''} ${
                !unlocked ? 'bo-level-cell--locked' : ''
              }`}
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
                  <span className="bo-level-num">{level}</span>
                  <span className="bo-level-stars">
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
