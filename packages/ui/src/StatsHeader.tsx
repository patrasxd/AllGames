import { memo, type ReactNode } from 'react'

export interface StatItem {
  key: string
  label: string
  value: ReactNode
  className?: string
}

interface StatsHeaderProps {
  label: string
  items: StatItem[]
  onReset?: () => void
  resetAriaLabel?: string
  resetId?: string
}

export const StatsHeader = memo(function StatsHeader({
  label,
  items,
  onReset,
  resetAriaLabel = 'Reset stats',
  resetId,
}: StatsHeaderProps) {
  return (
    <div className="game-stats-header">
      <p className="game-stats-header-label">{label}</p>
      <div className="game-stats-header-row">
        {items.map((item, idx) => (
          <span key={item.key} style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.4rem' }}>
            {idx > 0 && <span className="game-stats-header-sep" aria-hidden="true">·</span>}
            <div className="game-stats-header-item">
              <span className={`game-stats-header-val ${item.className || ''}`}>{item.value}</span>
              <span className="game-stats-header-key">{item.label}</span>
            </div>
          </span>
        ))}
        {onReset && (
          <button
            id={resetId}
            type="button"
            className="game-stats-header-reset"
            onClick={onReset}
            aria-label={resetAriaLabel}
            title={resetAriaLabel}
          >
            ↺
          </button>
        )}
      </div>
    </div>
  )
})
