import { motion } from 'framer-motion'
import type { Cell } from '../logic'
import { gameTranslations, type Locale } from '../i18n'

interface CellProps {
  value: Cell
  index: number
  isWinning: boolean
  canClick: boolean
  locale?: Locale
  isEink?: boolean
  onClick: () => void
}

/**
 * SVG X mark — animated with strokes unless in E-ink mode.
 */
function XMark({ isWinning, isEink }: { isWinning: boolean; isEink: boolean }) {
  const color = isWinning ? 'var(--accent)' : 'var(--text)'
  const stroke = { stroke: color, strokeWidth: 5, strokeLinecap: 'round' as const, fill: 'none' }

  if (isEink) {
    return (
      <svg viewBox="0 0 80 80" width="60" height="60" aria-hidden="true">
        <line x1="18" y1="18" x2="62" y2="62" {...stroke} />
        <line x1="62" y1="18" x2="18" y2="62" {...stroke} />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 80 80" width="60" height="60" aria-hidden="true">
      <motion.line
        x1="18" y1="18" x2="62" y2="62"
        {...stroke}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.line
        x1="62" y1="18" x2="18" y2="62"
        {...stroke}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.25, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  )
}

/**
 * SVG O mark — animated with stroke unless in E-ink mode.
 */
function OMark({ isWinning, isEink }: { isWinning: boolean; isEink: boolean }) {
  const color = isWinning ? 'var(--accent)' : 'var(--text-dim)'

  if (isEink) {
    return (
      <svg viewBox="0 0 80 80" width="60" height="60" aria-hidden="true">
        <circle cx="40" cy="40" r="24" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 80 80" width="60" height="60" aria-hidden="true">
      <motion.circle
        cx="40" cy="40" r="24"
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        style={{ rotate: -90, transformOrigin: '40px 40px' }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  )
}

export function GameCell({
  value,
  index,
  isWinning,
  canClick,
  locale = 'en',
  isEink = false,
  onClick,
}: CellProps) {
  const t = gameTranslations[locale] || gameTranslations.en

  return (
    <motion.button
      className={`ttt-cell ${isWinning ? 'ttt-cell--winning' : ''} ${canClick ? 'ttt-cell--clickable' : ''}`}
      onClick={onClick}
      disabled={!canClick || !!value}
      aria-label={value ? t.filledCellAria(index, value) : t.emptyCellAria(index)}
      id={`ttt-cell-${index}`}
      whileTap={canClick && !value && !isEink ? { scale: 0.95 } : {}}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {value === 'X' && <XMark isWinning={isWinning} isEink={isEink} />}
      {value === 'O' && <OMark isWinning={isWinning} isEink={isEink} />}
    </motion.button>
  )
}
