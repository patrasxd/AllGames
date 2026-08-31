import { memo } from 'react'
import type { Locale } from '../types'
import { battleshipTranslations } from '../i18n'

interface PlacementControlsProps {
  locale: Locale
  hasShips: boolean
  onAutoDeploy: () => void
  onClear: () => void
  onStart: () => void
}

function ShuffleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function SwordsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="19" y1="21" x2="21" y2="19" />
    </svg>
  )
}

export const PlacementControls = memo(function PlacementControls({
  locale,
  hasShips,
  onAutoDeploy,
  onClear,
  onStart,
}: PlacementControlsProps) {
  const t = battleshipTranslations[locale] || battleshipTranslations.en

  return (
    <div className="bs-placement-bar">
      <button
        type="button"
        id="bs-auto-btn"
        className="bs-action-btn"
        onClick={onAutoDeploy}
      >
        <ShuffleIcon />
        <span>{t.autoDeploy}</span>
      </button>

      <button
        type="button"
        id="bs-clear-btn"
        className="bs-action-btn"
        onClick={onClear}
        disabled={!hasShips}
      >
        <TrashIcon />
        <span>{t.clearBoard}</span>
      </button>

      <button
        type="button"
        id="bs-start-btn"
        className="bs-action-btn bs-action-btn--primary"
        onClick={onStart}
        disabled={!hasShips}
      >
        <SwordsIcon />
        <span>{t.startBattle}</span>
      </button>
    </div>
  )
})
