import { useCallback, useEffect, useRef } from 'react'
import { Button } from '@all/ui'

interface AimControlsProps {
  disabled: boolean
  labels: { fire: string; left: string; right: string }
  onNudge: (direction: -1 | 1, step?: number) => void
  onFire: () => void
}

const HOLD_STEP = 0.03
const HOLD_INTERVAL_MS = 30

/** Touch controls: hold ◀ / ▶ to sweep the aim, tap Fire to shoot. */
export function AimControls({ disabled, labels, onNudge, onFire }: AimControlsProps) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const start = useCallback(
    (direction: -1 | 1) => {
      stop()
      onNudge(direction, HOLD_STEP)
      timerRef.current = setInterval(() => onNudge(direction, HOLD_STEP), HOLD_INTERVAL_MS)
    },
    [onNudge, stop],
  )

  useEffect(() => stop, [stop])

  const holdProps = (direction: -1 | 1) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault()
      start(direction)
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  })

  return (
    <div className="bs-touch-controls">
      <Button
        id="bs-aim-left-btn"
        variant="secondary"
        size="md"
        disabled={disabled}
        aria-label={labels.left}
        {...holdProps(-1)}
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
        {...holdProps(1)}
      >
        ▶
      </Button>
    </div>
  )
}
