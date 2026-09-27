import { useRef, useEffect, useCallback, useState, memo } from 'react'
import type { PlayerId, GameMode, Tank, GamePhase, DifficultyLevel, WeaponType } from '../types'
import { Button, PillGroup, ControlsBar } from '@all/ui'
import type { ArtilleryTranslations } from '../i18n'
import { sound } from '../audio'

const DIFFICULTIES: DifficultyLevel[] = ['easy', 'medium', 'hard']

export interface ArtilleryTacticalDockProps {
  t?: ArtilleryTranslations
  phase: GamePhase
  currentTurn: PlayerId
  mode: GameMode
  activeTank: Tank
  onAngleChange: (angle: number) => void
  onFireWithPower: (power: number) => void
  onSelectWeapon?: (weapon: WeaponType) => void
  isScouting?: boolean
  onScout?: () => void
  theme?: string
  isEink?: boolean
}

export const ArtilleryTacticalDock = memo(function ArtilleryTacticalDock({
  t,
  phase,
  currentTurn,
  mode,
  activeTank,
  onAngleChange,
  onFireWithPower,
  onSelectWeapon,
  isScouting,
  onScout,
  theme = 'dark',
  isEink = false,
}: ArtilleryTacticalDockProps) {
  const isControlsDisabled = phase !== 'aiming' || (mode === 'ai' && currentTurn === 'p2') || Boolean(isScouting)

  // Holding +/- angle adjustment with acceleration
  const currentAngleRef = useRef(activeTank.angle)
  useEffect(() => {
    currentAngleRef.current = activeTank.angle
  }, [activeTank.angle])

  const angleRafRef = useRef<number | null>(null)
  const angleRepeatStartRef = useRef<number>(0)
  const lastAngleStepTimeRef = useRef<number>(0)
  const activeDeltaRef = useRef<number>(0)

  const stopAngleRepeat = useCallback(() => {
    if (angleRafRef.current) {
      cancelAnimationFrame(angleRafRef.current)
      angleRafRef.current = null
    }
    activeDeltaRef.current = 0
  }, [])

  const startAngleRepeat = useCallback(
    (delta: number) => {
      if (isControlsDisabled) return
      stopAngleRepeat()

      activeDeltaRef.current = delta
      const now = performance.now()
      angleRepeatStartRef.current = now
      lastAngleStepTimeRef.current = now

      // Immediate 1st step on initial press
      const nextAngle = Math.max(0, Math.min(90, currentAngleRef.current + delta))
      currentAngleRef.current = nextAngle
      onAngleChange(nextAngle)

      const loop = (time: number) => {
        if (activeDeltaRef.current === 0) return

        const holdDuration = time - angleRepeatStartRef.current

        // Initial delay before repeating begins: 250ms
        if (holdDuration >= 250) {
          // Dynamic interval based on hold duration (acceleration):
          // 250ms - 750ms: 70ms interval (~14 deg/s)
          // 750ms - 1500ms: 40ms interval (~25 deg/s)
          // > 1500ms: 20ms interval (~50 deg/s)
          let stepInterval = 70
          if (holdDuration > 1500) {
            stepInterval = 20
          } else if (holdDuration > 750) {
            stepInterval = 40
          }

          if (time - lastAngleStepTimeRef.current >= stepInterval) {
            lastAngleStepTimeRef.current = time
            const target = Math.max(0, Math.min(90, currentAngleRef.current + activeDeltaRef.current))
            if (target !== currentAngleRef.current) {
              currentAngleRef.current = target
              onAngleChange(target)
            } else {
              stopAngleRepeat()
              return
            }
          }
        }

        angleRafRef.current = requestAnimationFrame(loop)
      }

      angleRafRef.current = requestAnimationFrame(loop)
    },
    [isControlsDisabled, onAngleChange, stopAngleRepeat],
  )

  useEffect(() => {
    return stopAngleRepeat
  }, [stopAngleRepeat])

  const handlePointerDownAngle = (e: React.PointerEvent<HTMLButtonElement>, delta: number) => {
    sound.init()
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // ignore if pointer capture unsupported
    }
    startAngleRepeat(delta)
  }

  const handlePointerUpAngle = (e: React.PointerEvent<HTMLButtonElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    } catch {
      // ignore
    }
    stopAngleRepeat()
  }

  // Charging Power logic (Circular Hold to Fire): Base state is 0%
  const [chargingPower, setChargingPower] = useState<number>(0)
  const chargingRef = useRef<boolean>(false)
  const chargeDirectionRef = useRef<number>(1)
  const chargePowerRef = useRef<number>(0)
  const chargeRafRef = useRef<number | null>(null)
  const lastChargeTimeRef = useRef<number>(0)

  const stopChargingAndFire = useCallback(() => {
    if (!chargingRef.current) return
    chargingRef.current = false
    if (chargeRafRef.current) {
      cancelAnimationFrame(chargeRafRef.current)
      chargeRafRef.current = null
    }

    const finalPower = Math.max(15, Math.round(chargePowerRef.current))
    setChargingPower(0)
    chargePowerRef.current = 0

    onFireWithPower(finalPower)
  }, [onFireWithPower])

  const startCharging = useCallback(() => {
    sound.init()
    if (isControlsDisabled || chargingRef.current) return
    chargingRef.current = true
    chargeDirectionRef.current = 1
    chargePowerRef.current = 0
    setChargingPower(0)
    lastChargeTimeRef.current = performance.now()

    const chargeStep = (now: number) => {
      if (!chargingRef.current) return
      const dt = (now - lastChargeTimeRef.current) / 1000
      lastChargeTimeRef.current = now

      // Charges from 0% to 100% in ~1.3 seconds, then oscillates
      const chargeSpeed = 80 * dt
      let newPower = chargePowerRef.current + chargeSpeed * chargeDirectionRef.current

      if (newPower >= 100) {
        newPower = 100
        chargeDirectionRef.current = -1
      } else if (newPower <= 10) {
        newPower = 10
        chargeDirectionRef.current = 1
      }

      chargePowerRef.current = newPower
      setChargingPower(Math.round(newPower))
      chargeRafRef.current = requestAnimationFrame(chargeStep)
    }

    chargeRafRef.current = requestAnimationFrame(chargeStep)
  }, [isControlsDisabled])

  // Keyboard shortcut listener for Space (Hold to fire) and Arrow keys
  useEffect(() => {
    if (isControlsDisabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.code === 'Space' && !e.repeat && !chargingRef.current) {
        e.preventDefault()
        startCharging()
      } else if (e.code === 'Digit1' || e.code === 'Numpad1') {
        if (activeTank.ammo.standard > 0) onSelectWeapon?.('standard')
      } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
        if (activeTank.ammo.mortar > 0) onSelectWeapon?.('mortar')
      } else if (e.code === 'Digit3' || e.code === 'Numpad3') {
        if (activeTank.ammo.cluster > 0) onSelectWeapon?.('cluster')
      } else if (e.code === 'ArrowUp' || e.code === 'ArrowRight') {
        e.preventDefault()
        const target = Math.min(90, currentAngleRef.current + 1)
        currentAngleRef.current = target
        onAngleChange(target)
      } else if (e.code === 'ArrowDown' || e.code === 'ArrowLeft') {
        e.preventDefault()
        const target = Math.max(0, currentAngleRef.current - 1)
        currentAngleRef.current = target
        onAngleChange(target)
      } else if (e.code === 'KeyS' || e.code === 'KeyR') {
        if (onScout) {
          e.preventDefault()
          onScout()
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && chargingRef.current) {
        e.preventDefault()
        stopChargingAndFire()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isControlsDisabled, startCharging, stopChargingAndFire, onAngleChange, onSelectWeapon, activeTank.ammo])

  // Circular progress calculations (Radius = 30, Circumference ~ 188.5)
  const ringRadius = 30
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringOffset = ringCircumference * (1 - chargingPower / 100)

  const isDark = theme !== 'light' && theme !== 'e-ink-light'
  const dockVariantClass = isEink
    ? isDark
      ? 'artillery-canvas-bottom-dock--eink-dark'
      : 'artillery-canvas-bottom-dock--eink-light'
    : isDark
      ? 'artillery-canvas-bottom-dock--dark'
      : 'artillery-canvas-bottom-dock--light'

  const weaponList: Array<{ id: 'standard' | 'mortar' | 'cluster'; key: '1' | '2' | '3'; color: string }> = [
    { id: 'standard', key: '1', color: '#38bdf8' },
    { id: 'mortar', key: '2', color: '#f97316' },
    { id: 'cluster', key: '3', color: '#a855f7' },
  ]

  return (
    <div
      className={`artillery-canvas-bottom-dock ${dockVariantClass}`}
      data-eink={isEink ? 'true' : undefined}
      data-theme={theme}
    >
      {/* Primary Row: Aiming ([-] 45° [+]) and Enlarged FIRE Button */}
      <div className="artillery-dock-primary-row">
        {/* Angle Adjustment Group */}
        <div className="artillery-angle-group">
          <Button
            id="artillery-angle-dec-btn"
            variant="secondary"
            size="md"
            className="artillery-icon-btn"
            disabled={isControlsDisabled || activeTank.angle <= 0}
            onPointerDown={(e) => handlePointerDownAngle(e, -1)}
            onPointerUp={handlePointerUpAngle}
            onPointerLeave={handlePointerUpAngle}
            onPointerCancel={handlePointerUpAngle}
            onContextMenu={(e) => e.preventDefault()}
            aria-label="Decrease angle"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </Button>

          <div className="artillery-angle-display">
            <span className="artillery-angle-number">{activeTank.angle}°</span>
          </div>

          <Button
            id="artillery-angle-inc-btn"
            variant="secondary"
            size="md"
            className="artillery-icon-btn"
            disabled={isControlsDisabled || activeTank.angle >= 90}
            onPointerDown={(e) => handlePointerDownAngle(e, 1)}
            onPointerUp={handlePointerUpAngle}
            onPointerLeave={handlePointerUpAngle}
            onPointerCancel={handlePointerUpAngle}
            onContextMenu={(e) => e.preventDefault()}
            aria-label="Increase angle"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </Button>
        </div>

        <div className="artillery-dock-divider" />

        {/* Enlarged Circular HOLD TO FIRE Button with SVG Power Ring */}
        <div className="artillery-circle-fire-wrapper">
          <button
            type="button"
            id="artillery-fire-btn"
            className={`artillery-circle-fire-btn ${chargingRef.current ? 'artillery-circle-fire-btn--active' : ''}`}
            disabled={isControlsDisabled}
            onPointerDown={startCharging}
            onPointerUp={stopChargingAndFire}
            onPointerLeave={stopChargingAndFire}
            onPointerCancel={stopChargingAndFire}
            aria-label="Hold to charge power and fire"
          >
            <svg className="artillery-circle-ring-svg" viewBox="0 0 68 68">
              <circle
                className="artillery-circle-ring-track"
                cx="34"
                cy="34"
                r={ringRadius}
                fill="none"
                strokeWidth="3.6"
              />
              <circle
                className="artillery-circle-ring-progress"
                cx="34"
                cy="34"
                r={ringRadius}
                fill="none"
                strokeWidth="3.6"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                transform="rotate(-90 34 34)"
              />
            </svg>

            <div className="artillery-circle-inner">
              {chargingPower > 0 ? (
                <span className="artillery-circle-power-val">{chargingPower}%</span>
              ) : (
                <div className="artillery-circle-label">
                  <span className="artillery-circle-text">FIRE</span>
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Row 2: Weapon Selector Group (Positioned Lower / "Niżej") */}
      <div className="artillery-weapon-group" role="group" aria-label={t?.weaponSelectLabel || 'Ammunition'}>
        {weaponList.map((w) => {
          const isSelected = activeTank.selectedWeapon === w.id
          const ammo = activeTank.ammo[w.id]
          const isAmmoEmpty = ammo <= 0
          const isDisabled = isControlsDisabled || isAmmoEmpty
          const ammoDisplay = ammo === Infinity ? (t?.unlimitedAmmo || '∞') : ammo
          const wInfo = t?.weapons[w.id]

          return (
            <button
              key={w.id}
              type="button"
              id={`artillery-weapon-${w.id}-btn`}
              className={`artillery-weapon-btn ${isSelected ? 'artillery-weapon-btn--selected' : ''} ${isAmmoEmpty ? 'artillery-weapon-btn--empty' : ''}`}
              disabled={isDisabled}
              onClick={() => {
                sound.init()
                onSelectWeapon?.(w.id)
              }}
              style={{
                '--weapon-accent': w.color,
              } as React.CSSProperties}
              aria-label={`${wInfo?.name || w.id} (${ammoDisplay})`}
              aria-pressed={isSelected}
              title={`${wInfo?.name || w.id}: ${wInfo?.desc || ''} [${w.key}]`}
            >
              <span className="artillery-weapon-icon">
                {w.id === 'standard' && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2c2 3.5 3 7 3 11v6H9v-6c0-4 1-7.5 3-11z" fill="currentColor" fillOpacity="0.25" />
                  </svg>
                )}
                {w.id === 'mortar' && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="14" r="7" fill="currentColor" fillOpacity="0.25" />
                    <path d="M12 7v-4m-3 1h6" />
                    <path d="M15 4l2-2" />
                  </svg>
                )}
                {w.id === 'cluster' && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="7" cy="8" r="3" fill="currentColor" fillOpacity="0.25" />
                    <circle cx="17" cy="8" r="3" fill="currentColor" fillOpacity="0.25" />
                    <circle cx="12" cy="16" r="3" fill="currentColor" fillOpacity="0.25" />
                  </svg>
                )}
              </span>
              <span className="artillery-weapon-name">{wInfo?.short || w.id}</span>
              <span className="artillery-weapon-ammo">{ammoDisplay}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
})

export interface ArtilleryFooterProps {
  t: ArtilleryTranslations
  difficulty: DifficultyLevel
  onDifficultyChange: (d: DifficultyLevel) => void
  onChangeMode: () => void
  onNewGame: () => void
}

export const ArtilleryFooterBar = memo(function ArtilleryFooterBar({
  t,
  difficulty,
  onDifficultyChange,
  onChangeMode,
  onNewGame,
}: ArtilleryFooterProps) {
  return (
    <ControlsBar className="artillery-footer-bar">
      <Button id="artillery-new-game-btn" variant="secondary" size="sm" onClick={onNewGame}>
        {t.newGame}
      </Button>

      <Button id="artillery-change-mode-btn" variant="secondary" size="sm" onClick={onChangeMode}>
        {t.changeMode}
      </Button>

      <PillGroup<DifficultyLevel>
        label={t.difficultyLabel}
        size="sm"
        value={difficulty}
        onChange={onDifficultyChange}
        options={DIFFICULTIES.map((d) => ({
          value: d,
          label: t.difficulties[d],
          id: `artillery-diff-${d}`,
        }))}
      />
    </ControlsBar>
  )
})

export const ArtilleryControlPanel = ArtilleryTacticalDock
