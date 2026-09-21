import { memo, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Card, Button, Badge, IconButton, EyeIcon, EyeOffIcon } from '@all/ui'
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
  canMinimize?: boolean
  viewBoardText?: string
  showResultText?: string
}

/**
 * GameResultOverlay
 *
 * Renders a centered result card using AllUI tokens.
 * Supports a minimized "View Board" mode so the user can inspect the final board position.
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
  canMinimize = true,
  viewBoardText = 'View board',
  showResultText = 'Show result',
}: GameResultOverlayProps) {
  const [isMinimized, setIsMinimized] = useState(false)

  if (isMinimized) {
    return (
      <motion.div
        className={`gr-overlay-minimized gr-overlay-minimized--${status}`}
        initial={!isEink ? { opacity: 0, y: 16 } : false}
        animate={{ opacity: 1, y: 0 }}
        exit={!isEink ? { opacity: 0, y: 16 } : undefined}
        transition={{ duration: 0.2 }}
        role="region"
        aria-label={title}
      >
        <Badge
          variant={status === 'won' ? 'success' : status === 'lost' ? 'danger' : 'neutral'}
          className="gr-minimized-badge"
        >
          {title}
        </Badge>
        <Button
          id="gr-restore-btn"
          variant="secondary"
          size="sm"
          icon={<EyeIcon />}
          onClick={() => setIsMinimized(false)}
        >
          {showResultText}
        </Button>
        <Button
          id={playAgainId}
          variant="primary"
          size="sm"
          onClick={onPlayAgain}
        >
          {playAgainText}
        </Button>
      </motion.div>
    )
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
        {canMinimize && (
          <div className="gr-card-header-actions">
            <IconButton
              id="gr-minimize-btn"
              variant="ghost"
              size="sm"
              icon={<EyeOffIcon />}
              onClick={() => setIsMinimized(true)}
              aria-label="Minimize"
              title="Minimize"
            />
          </div>
        )}
        <h3 className="gr-title">{title}</h3>
        {subtitle && <p className="gr-subtitle">{subtitle}</p>}
        {stats && stats.length > 0 && (
          <div className="gr-stats">
            {stats.map(s => (
              <div key={s.label} className="gr-stat">
                <span className="gr-stat-val">{s.value}</span>
                <span className="gr-stat-key">{s.label}</span>
              </div>
            ))}
          </div>
        )}
        <div className="gr-actions">
          {secondaryAction && (
            <Button
              id={secondaryAction.id}
              variant="secondary"
              size="sm"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
          {canMinimize && (
            <Button
              id="gr-view-board-btn"
              variant="secondary"
              size="sm"
              icon={<EyeIcon />}
              onClick={() => setIsMinimized(true)}
            >
              {viewBoardText}
            </Button>
          )}
          <Button
            id={playAgainId}
            variant="primary"
            size="sm"
            onClick={onPlayAgain}
          >
            {playAgainText}
          </Button>
        </div>
      </Card>
    </motion.div>
  )
})

