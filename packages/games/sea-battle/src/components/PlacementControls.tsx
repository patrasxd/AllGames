import { memo } from 'react'
import type { Locale } from '../types'
import { seaBattleTranslations } from '../i18n'
import { ControlsBar, Button } from '@all/ui'
import { ShuffleIcon, TrashIcon } from '@allgames/ui'

interface PlacementControlsProps {
  locale: Locale
  hasShips: boolean
  onAutoDeploy: () => void
  onClear: () => void
  onStart: () => void
}

export const PlacementControls = memo(function PlacementControls({
  locale,
  hasShips,
  onAutoDeploy,
  onClear,
  onStart,
}: PlacementControlsProps) {
  const t = seaBattleTranslations[locale] || seaBattleTranslations.en

  return (
    <ControlsBar className="bs-placement-bar">
      <Button
        id="bs-auto-btn"
        variant="secondary"
        size="sm"
        onClick={onAutoDeploy}
        icon={<ShuffleIcon />}
      >
        {t.autoDeploy}
      </Button>

      <Button
        id="bs-clear-btn"
        variant="secondary"
        size="sm"
        onClick={onClear}
        disabled={!hasShips}
        icon={<TrashIcon />}
      >
        {t.clearBoard}
      </Button>

      <Button
        id="bs-start-btn"
        variant="primary"
        size="sm"
        onClick={onStart}
        disabled={!hasShips}
      >
        {t.startBattle}
      </Button>
    </ControlsBar>
  )
})
