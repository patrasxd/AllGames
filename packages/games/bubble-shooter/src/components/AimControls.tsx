import { Button } from '@all/ui'

interface AimControlsProps {
  disabled: boolean
  labels: { fire: string; left: string; right: string }
  onNudge: (direction: -1 | 1, step?: number) => void
  onFire: () => void
}

/** Touch controls: tap ◀ / ▶ to move the aim by one step, tap Fire to shoot. */
export function AimControls({ disabled, labels, onNudge, onFire }: AimControlsProps) {
  return (
    <div
      className="bs-touch-dock"
      onPointerDown={(event) => event.stopPropagation()}
      onPointerMove={(event) => event.stopPropagation()}
    >
      <Button
        id="bs-aim-left-btn"
        variant="secondary"
        size="md"
        disabled={disabled}
        aria-label={labels.left}
        onClick={() => onNudge(-1)}
      >
        ◀
      </Button>
      <Button id="bs-fire-btn" className="bs-fire-btn" variant="primary" size="md" disabled={disabled} onClick={onFire}>
        {labels.fire}
      </Button>
      <Button
        id="bs-aim-right-btn"
        variant="secondary"
        size="md"
        disabled={disabled}
        aria-label={labels.right}
        onClick={() => onNudge(1)}
      >
        ▶
      </Button>
    </div>
  )
}
