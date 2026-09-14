import { memo, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Card, Button } from '@all/ui'
import './GameResultOverlay.css'

export interface GameStartOverlayProps {
  title: string
  subtitle?: string
  startText?: string
  onStart: () => void
  startId?: string
  isEink?: boolean
  children?: ReactNode
  secondaryAction?: {
    label: string
    onClick: () => void
    id?: string
  }
}

/**
 * GameStartOverlay
 *
 * Unified start / ready / pause overlay card using AllUI Card and tokens.
 * Rendered inside the parent layout's `overlay` slot (BoardLayout / FullBleedLayout).
 */
export const GameStartOverlay = memo(function GameStartOverlay({
  title,
  subtitle,
  startText = 'Start',
  onStart,
  startId,
  isEink = false,
  children,
  secondaryAction,
}: GameStartOverlayProps) {
  return (
    <motion.div
      className="gr-overlay-card"
      initial={!isEink ? { opacity: 0, scale: 0.94 } : false}
      animate={{ opacity: 1, scale: 1 }}
      exit={!isEink ? { opacity: 0, scale: 0.94 } : undefined}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
    >
      <Card variant="elevated" padding="lg" className="gr-card">
        <h3 className="gr-title">{title}</h3>
        {subtitle && <p className="gr-subtitle">{subtitle}</p>}
        {children}
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
          <Button
            id={startId}
            variant="primary"
            size="sm"
            onClick={onStart}
          >
            {startText}
          </Button>
        </div>
      </Card>
    </motion.div>
  )
})
