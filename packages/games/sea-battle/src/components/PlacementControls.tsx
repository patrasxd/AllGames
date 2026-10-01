import { memo } from 'react'
import type { Locale } from '../types'
import { seaBattleTranslations } from '../i18n'
import { ControlsBar, Button, IconButton, RotateCcwIcon, Badge } from '@all/ui'
import { ShuffleIcon, TrashIcon } from '@allgames/ui'

interface PlacementControlsProps {
  locale: Locale
  hasShips: boolean
  canStart: boolean
  canRotate: boolean
  nextShip: string | null
  orientation: 'horizontal' | 'vertical'
  onAutoDeploy: () => void
  onRotate: () => void
  onClear: () => void
  onStart: () => void
}

export const PlacementControls = memo(function PlacementControls({
  locale,
  hasShips,
  canStart,
  canRotate,
  nextShip,
  orientation,
  onAutoDeploy,
  onRotate,
  onClear,
  onStart,
}: PlacementControlsProps) {
  const t = seaBattleTranslations[locale] || seaBattleTranslations.en

  return (
    <ControlsBar className="bs-placement-bar">
      <div className="bs-placement-summary" aria-live="polite">
        <Badge variant={nextShip ? 'accent' : 'success'} size="sm">
          {nextShip ?? t.fleetReady}
        </Badge>
        {nextShip && (
          <Badge variant="default" size="sm">
            {orientation === 'horizontal' ? t.horizontal : t.vertical}
          </Badge>
        )}
      </div>
      <IconButton
        id="bs-rotate-btn"
        aria-label={t.rotateShip}
        title={t.rotateShip}
        icon={<RotateCcwIcon />}
        variant="secondary"
        size="sm"
        onClick={onRotate}
        disabled={!canRotate}
      />
      <Button id="bs-auto-btn" variant="secondary" size="sm" onClick={onAutoDeploy} icon={<ShuffleIcon />}>
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

      <Button id="bs-start-btn" variant="primary" size="sm" onClick={onStart} disabled={!canStart}>
        {t.startBattle}
      </Button>
    </ControlsBar>
  )
})
