import { memo, useState, useEffect, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Card, Button, IconButton, CloseIcon } from '@all/ui'
import './GameResultOverlay.css'

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
  onClose?: () => void
  closeAriaLabel?: string
}

/**
 * GameResultOverlay
 *
 * Renders a centered result card using AllUI tokens.
 * Features a top-right close button so the player can dismiss the dialog and view the final board.
 * This component renders as a plain `motion.div` — it has NO backdrop of its own.
 * The backdrop (semi-transparent bg) must be provided by the parent layout slot:
 *   - FullBleedLayout: use the `overlay` prop → `.all-fullbleed-layout__overlay`
 *   - BoardLayout:     use the `overlay` prop → `.all-board-layout__overlay`
 */
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
  onClose,
  closeAriaLabel = 'Close dialog',
}: GameResultOverlayProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDismissed(true)
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (isDismissed) {
    return null
  }

  return (
    <motion.div
      className={`gr-overlay-card gr-overlay-card--${status}`}
      initial={!isEink ? { opacity: 0, scale: 0.94 } : false}
      animate={{ opacity: 1, scale: 1 }}
      exit={!isEink ? { opacity: 0, scale: 0.94 } : undefined}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
    >
      <Card variant="elevated" padding="lg" className="gr-card">
        <div className="gr-card-header-actions">
          <IconButton
            id="gr-close-btn"
            variant="ghost"
            size="sm"
            icon={<CloseIcon />}
            onClick={() => {
              setIsDismissed(true)
              onClose?.()
            }}
            aria-label={closeAriaLabel}
            title={closeAriaLabel}
          />
        </div>
        <h3 className="gr-title">{title}</h3>
        {subtitle && <p className="gr-subtitle">{subtitle}</p>}
        {stats && stats.length > 0 && (
          <div className="gr-stats">
            {stats.map((s) => (
              <div key={s.label} className="gr-stat">
                <span className="gr-stat-val">{s.value}</span>
                <span className="gr-stat-key">{s.label}</span>
              </div>
            ))}
          </div>
        )}
        <div className="gr-actions">
          {secondaryAction && (
            <Button id={secondaryAction.id} variant="secondary" size="sm" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          <Button id={playAgainId} variant="primary" size="sm" onClick={onPlayAgain}>
            {playAgainText}
          </Button>
        </div>
      </Card>
    </motion.div>
  )
})
