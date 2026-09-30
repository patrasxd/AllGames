import { Button } from '@all/ui'

interface AimControlsProps {
  disabled: boolean
  labels: { fire: string; left: string; right: string }
  onNudge: (direction: -1 | 1, step?: number) => void
  onFire: () => void
}

/** Touch controls: tap ◀ / ▶ to move the aim by one step, tap Fire to shoot.
 *  Rendered inline inside the footer ControlsBar — not overlaid on the canvas.
 *  Uses size="sm" to match every other game's footer button convention. */
export function AimControls({ disabled, labels, onNudge, onFire }: AimControlsProps) {
  return (
    <div className="bs-aim-row">
      <Button
        id="bs-aim-left-btn"
        variant="secondary"
        size="sm"
        disabled={disabled}
        aria-label={labels.left}
        onClick={() => onNudge(-1)}
      >
        ◀
      </Button>
      <Button id="bs-fire-btn" className="bs-fire-btn" variant="primary" size="sm" disabled={disabled} onClick={onFire}>
        {labels.fire}
      </Button>
      <Button
        id="bs-aim-right-btn"
        variant="secondary"
        size="sm"
        disabled={disabled}
        aria-label={labels.right}
        onClick={() => onNudge(1)}
      >
        ▶
      </Button>
    </div>
  )
}

