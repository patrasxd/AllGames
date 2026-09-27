import { useEffect, useRef, useState, useCallback, useContext, memo } from 'react'
import type { Tank, TerrainData, Projectile, Explosion, FloatingText, GameTheme, PlayerId, GamePhase, GameMode, Locale } from '../types'
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  getMuzzlePosition,
  getTankSlopeAngle,
  TURRET_HUB_OFFSET,
  BARREL_LENGTH,
} from '../logic'
import { ArtilleryTacticalDock } from './ArtilleryHUD'
import type { ArtilleryTranslations } from '../i18n'
import { MotionContext } from '@all/ui'

export type IntroStage = 'focus_p1' | 'pan_to_p2' | 'focus_p2' | 'pan_to_p1' | 'done'

interface ArtilleryCanvasProps {
  tanks: Record<PlayerId, Tank>
  terrain: TerrainData
  projectiles: Projectile[]
  explosions: Explosion[]
  floatingTexts?: FloatingText[]
  currentTurn: PlayerId
  phase: GamePhase
  wind: number
  screenShake?: number
  isEink?: boolean
  theme?: GameTheme
  turnTitle: string
  windText?: string
  mode?: GameMode
  p2Label?: string
  activeTank?: Tank
  matchId?: number
  onAngleChange?: (angle: number) => void
  onFireWithPower?: (power: number) => void
  locale?: Locale
  t?: ArtilleryTranslations
}

export const ArtilleryCanvas = memo(function ArtilleryCanvas({
  tanks,
  terrain,
  projectiles,
  explosions,
  floatingTexts = [],
  currentTurn,
  phase,
  wind,
  screenShake = 0,
  isEink = false,
  theme = 'dark',
  turnTitle,
  windText,
  mode = 'ai',
  p2Label,
  activeTank: propActiveTank,
  matchId,
  onAngleChange,
  onFireWithPower,
  locale = 'pl',
  t,
}: ArtilleryCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDark = theme !== 'light' && theme !== 'e-ink-light'
  const motionCtx = useContext(MotionContext)
  const isReducedMotion = motionCtx?.isReducedMotion ?? (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false)
  const isMotionEnabled = motionCtx?.isMotionEnabled ?? !isReducedMotion
  const disableMotion = isEink || isReducedMotion || !isMotionEnabled

  // Volumetric cloud state with subtle ambient drift across the landscape
  const cloudsRef = useRef([
    { x: 120, y: 110, scale: 0.95 },
    { x: 480, y: 75, scale: 0.8 },
    { x: 880, y: 130, scale: 1.05 },
    { x: 1280, y: 85, scale: 0.88 },
    { x: 1680, y: 120, scale: 0.95 },
    { x: 2080, y: 70, scale: 0.78 },
  ])
  const lastTimeRef = useRef<number>(performance.now())

  // Camera state for calm, cinematic panoramic framing
  const cameraRef = useRef<{
    x: number
    y: number
    zoom: number
  }>({
    x: tanks.p1.x + 60,
    y: tanks.p1.y - 25,
    zoom: 1.0,
  })

  const floatingTextsRef = useRef<FloatingText[]>(floatingTexts)
  floatingTextsRef.current = floatingTexts

  // Impact and damage camera tracking (Worms style: holds camera on target during blast and damage popup)
  const lastImpactRef = useRef<{ x: number; y: number; time: number } | null>(null)

  // Intro position tour state machine (guarantees camera smoothly reaches and holds on enemy ONLY at match start)
  const introStateRef = useRef<{
    stage: IntroStage
    timer: number
  }>({
    stage: 'focus_p1',
    timer: 0,
  })
  const prevMatchIdRef = useRef<number>(matchId || 1)
  const isIntroSkippedRef = useRef<boolean>(false)
  const hadProjectilesRef = useRef<boolean>(false)

  // On-demand enemy position reconnaissance state machine
  const scoutStateRef = useRef<{
    stage: 'idle' | 'pan_to_enemy' | 'hold_enemy' | 'pan_to_player'
    timer: number
  }>({
    stage: 'idle',
    timer: 0,
  })
  const [isScouting, setIsScouting] = useState<boolean>(false)

  const handleStartScout = useCallback(() => {
    if (phase !== 'aiming' || scoutStateRef.current.stage !== 'idle') return
    isIntroSkippedRef.current = true
    introStateRef.current.stage = 'done'
    scoutStateRef.current = {
      stage: 'pan_to_enemy',
      timer: 0,
    }
    setIsScouting(true)
  }, [phase])

  const handleCancelScout = useCallback(() => {
    if (scoutStateRef.current.stage === 'idle') return
    scoutStateRef.current = {
      stage: 'idle',
      timer: 0,
    }
    setIsScouting(false)
  }, [])

  if (matchId !== undefined && prevMatchIdRef.current !== matchId) {
    prevMatchIdRef.current = matchId
    isIntroSkippedRef.current = false
    lastImpactRef.current = null
    scoutStateRef.current = {
      stage: 'idle',
      timer: 0,
    }
    introStateRef.current = {
      stage: 'focus_p1',
      timer: 0,
    }
    cameraRef.current = {
      x: tanks.p1.x + 60,
      y: tanks.p1.y - 25,
      zoom: 1.05,
    }
  }

  // Turn tracking
  const prevTurnRef = useRef<PlayerId>(currentTurn)
  const turnStartTimeRef = useRef<number>(performance.now())

  if (prevTurnRef.current !== currentTurn) {
    prevTurnRef.current = currentTurn
    turnStartTimeRef.current = performance.now()
    lastImpactRef.current = null
    scoutStateRef.current = {
      stage: 'idle',
      timer: 0,
    }
  }

  useEffect(() => {
    let animId: number

    const render = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const now = performance.now()
      const dt = Math.min(0.1, (now - lastTimeRef.current) / 1000)
      lastTimeRef.current = now

      // Gentle cloud drift responding to wind direction and speed (paused if motion is reduced/e-ink)
      if (!disableMotion) {
        const cloudSpeed = 2.0 + wind * 2.0
        cloudsRef.current.forEach((cloud) => {
          cloud.x += cloudSpeed * dt
          if (cloud.x > CANVAS_WIDTH + 350) {
            cloud.x = -350
          } else if (cloud.x < -350) {
            cloud.x = CANVAS_WIDTH + 350
          }
        })
      }

      const turnElapsed = (now - turnStartTimeRef.current) / 1000

      // HiDPI scale calibration
      const dpr = window.devicePixelRatio || 1
      const displayWidth = canvas.clientWidth || 900
      const displayHeight = canvas.clientHeight || 500

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr
        canvas.height = displayHeight * dpr
      }

      ctx.save()
      ctx.scale(dpr, dpr)

      const activeTank = propActiveTank || tanks[currentTurn]
      const isP1 = activeTank.id === 'p1'

      // Track impact location and damaged target when detonation occurs
      if (explosions.length > 0) {
        const exp = explosions[0]
        const currentDamageTexts = floatingTextsRef.current || floatingTexts || []
        const damageTarget = currentDamageTexts.length > 0 ? currentDamageTexts[0] : exp
        lastImpactRef.current = {
          x: damageTarget.x,
          y: damageTarget.y,
          time: now,
        }
      }

      // ─── Calm, Fluid Cinematic Camera (Centered on Active Tank & Projectile Tracking) ───
      const isIntro = !isIntroSkippedRef.current && introStateRef.current.stage !== 'done'
      const intro = introStateRef.current
      const isLingeringOnImpact =
        lastImpactRef.current !== null &&
        (phase === 'firing' || phase === 'resolving') &&
        projectiles.length === 0

      let targetX = activeTank.x + (isP1 ? 60 : -60)
      let targetY = activeTank.y - 25
      let targetZoom = 1.0

      const p1FocusX = tanks.p1.x + 60
      const p1FocusY = tanks.p1.y - 25
      const p2FocusX = tanks.p2.x - 60
      const p2FocusY = tanks.p2.y - 25

      const opponentId: PlayerId = currentTurn === 'p1' ? 'p2' : 'p1'
      const opponentTank = tanks[opponentId]
      const opponentIsP1 = opponentId === 'p1'
      const opponentFocusX = opponentTank.x + (opponentIsP1 ? 60 : -60)
      const opponentFocusY = opponentTank.y - 25
      const currentFocusX = activeTank.x + (isP1 ? 60 : -60)
      const currentFocusY = activeTank.y - 25

      const isScoutActive = scoutStateRef.current.stage !== 'idle'
      const scout = scoutStateRef.current

      if (isIntro) {
        if (intro.stage === 'focus_p1') {
          targetX = p1FocusX
          targetY = p1FocusY
          targetZoom = 1.05
          intro.timer += dt
          // Hold firmly and calmly on Player 1 for 1.8 seconds
          if (intro.timer >= 1.8) {
            intro.stage = 'pan_to_p2'
            intro.timer = 0
          }
        } else if (intro.stage === 'pan_to_p2') {
          // Panning across mountain landscape to Player 2
          targetX = p2FocusX
          targetY = p2FocusY
          targetZoom = 0.95

          // Arrive at Player 2
          const distToP2 = Math.hypot(cameraRef.current.x - p2FocusX, cameraRef.current.y - p2FocusY)
          if (distToP2 < 45) {
            intro.stage = 'focus_p2'
            intro.timer = 0
          }
        } else if (intro.stage === 'focus_p2') {
          // Hold firmly and clearly on Player 2 / Computer
          targetX = p2FocusX
          targetY = p2FocusY
          targetZoom = 1.05
          intro.timer += dt
          // Stay on opponent for a full, steady 2.2 seconds!
          if (intro.timer >= 2.2) {
            intro.stage = 'pan_to_p1'
            intro.timer = 0
          }
        } else if (intro.stage === 'pan_to_p1') {
          // Pan back to Player 1
          targetX = p1FocusX
          targetY = p1FocusY
          targetZoom = 1.0

          const distToP1 = Math.hypot(cameraRef.current.x - p1FocusX, cameraRef.current.y - p1FocusY)
          if (distToP1 < 45) {
            intro.stage = 'done'
            intro.timer = 0
          }
        }
      } else if (isScoutActive) {
        if (scout.stage === 'pan_to_enemy') {
          // Slowly glides across the mountain terrain to opponent tank
          targetX = opponentFocusX
          targetY = opponentFocusY
          targetZoom = 1.05

          const distToEnemy = Math.hypot(cameraRef.current.x - opponentFocusX, cameraRef.current.y - opponentFocusY)
          if (distToEnemy < 45) {
            scout.stage = 'hold_enemy'
            scout.timer = 0
          }
        } else if (scout.stage === 'hold_enemy') {
          // Calmly frame and inspect enemy position for 1.8 seconds
          targetX = opponentFocusX
          targetY = opponentFocusY
          targetZoom = 1.05
          scout.timer += dt
          if (scout.timer >= 1.8) {
            scout.stage = 'pan_to_player'
            scout.timer = 0
          }
        } else if (scout.stage === 'pan_to_player') {
          // Smoothly glide back to the player's active tank
          targetX = currentFocusX
          targetY = currentFocusY
          targetZoom = 1.0

          const distToPlayer = Math.hypot(cameraRef.current.x - currentFocusX, cameraRef.current.y - currentFocusY)
          if (distToPlayer < 45) {
            scout.stage = 'idle'
            scout.timer = 0
            setIsScouting(false)
          }
        }
      } else {
        if (projectiles.length > 0) {
          // Camera follows the flying projectile across the mountain battlefield
          const leadProj = projectiles[0]

          // On initial launch, seamlessly frame projectile starting position if camera is distant
          if (!hadProjectilesRef.current) {
            hadProjectilesRef.current = true
            const distToProj = Math.hypot(cameraRef.current.x - leadProj.x, cameraRef.current.y - leadProj.y)
            if (distToProj > 350) {
              cameraRef.current.x = leadProj.x
              cameraRef.current.y = leadProj.y
              cameraRef.current.zoom = 0.88
            }
          }

          // Lead forward slightly in velocity vector direction for natural forward visibility
          const leadOffsetX = Math.max(-100, Math.min(100, leadProj.vx * 0.15))
          targetX = Math.max(40, Math.min(CANVAS_WIDTH + 80, leadProj.x + leadOffsetX))
          targetY = Math.min(500, Math.max(60, leadProj.y))
          targetZoom = 0.88
        } else {
          hadProjectilesRef.current = false

          if (explosions.length > 0) {
            // Center smoothly on impact site and crater blast
            const exp = explosions[0]
            targetX = Math.max(40, Math.min(CANVAS_WIDTH + 80, exp.x))
            targetY = Math.min(500, Math.max(80, exp.y - 15))
            targetZoom = 0.92
          } else if (isLingeringOnImpact && lastImpactRef.current) {
            // Worms-style camera hold: linger steadily on the explosion / damaged tank site
            targetX = Math.max(40, Math.min(CANVAS_WIDTH + 80, lastImpactRef.current.x))
            targetY = Math.min(500, Math.max(80, lastImpactRef.current.y - 15))
            targetZoom = 0.95
          } else if (phase === 'resolving' || phase === 'firing') {
            // Projectile missed or flew out of bounds: transition directly to NEXT player's tank!
            // Never bounce back to the shooting tank who just took their turn
            const nextTurnId: PlayerId = currentTurn === 'p1' ? 'p2' : 'p1'
            const nextTank = tanks[nextTurnId]
            targetX = nextTank.x + (nextTurnId === 'p1' ? 60 : -60)
            targetY = nextTank.y - 25
            targetZoom = 1.0
          } else {
            // Centered directly on the active tank preparing its shot (aiming phase)
            targetX = activeTank.x + (isP1 ? 60 : -60)
            targetY = activeTank.y - 25
            targetZoom = 1.0
          }
        }
      }

      // Camera smoothing with maximum velocity capping (calm & cinematic, zero jerking)
      const isScoutPan = isScoutActive && (scout.stage === 'pan_to_enemy' || scout.stage === 'pan_to_player')
      const isTrackingShell = !isIntro && !isScoutActive && projectiles.length > 0
      const isTrackingImpact = !isIntro && !isScoutActive && (explosions.length > 0 || isLingeringOnImpact) && projectiles.length === 0
      const isIntroPan = isIntro && (intro.stage === 'pan_to_p2' || intro.stage === 'pan_to_p1')
      const camLerp = isTrackingShell
        ? 0.20
        : isTrackingImpact
          ? 0.06
          : (isIntroPan || isScoutPan)
            ? 0.038 // Calm, smooth, panoramic glide
            : 0.04
      const zoomLerp = isTrackingShell ? 0.06 : 0.025

      const rawDx = (targetX - cameraRef.current.x) * camLerp
      const rawDy = (targetY - cameraRef.current.y) * camLerp

      // Velocity limits: max 1800 px/s when tracking shell, 600 px/s during scout pan, 700 px/s during intro pan, 650 px/s when panning to player
      const maxStepX = (isTrackingShell ? 1800 : isScoutPan ? 600 : isIntroPan ? 700 : 650) * dt
      const maxStepY = (isTrackingShell ? 1400 : 380) * dt

      const clampedDx = Math.sign(rawDx) * Math.min(Math.abs(rawDx), maxStepX)
      const clampedDy = Math.sign(rawDy) * Math.min(Math.abs(rawDy), maxStepY)

      if (disableMotion) {
        cameraRef.current.x = targetX
        cameraRef.current.y = targetY
        cameraRef.current.zoom = targetZoom
      } else {
        cameraRef.current.x += clampedDx
        cameraRef.current.y += clampedDy
        cameraRef.current.zoom += (targetZoom - cameraRef.current.zoom) * zoomLerp
      }

      const camX = cameraRef.current.x
      const camY = cameraRef.current.y
      const zoom = cameraRef.current.zoom

      // Base scale fits coordinate world to canvas display box
      const baseScale = Math.min(displayWidth / 900, displayHeight / 520)
      const effectiveScale = baseScale * zoom

      // Screen Shake Trauma (suppressed when reduced motion or e-ink is active)
      let shakeOffsetX = 0
      let shakeOffsetY = 0
      if (!disableMotion && screenShake > 0.1) {
        shakeOffsetX = (Math.random() - 0.5) * screenShake * 1.5
        shakeOffsetY = (Math.random() - 0.5) * screenShake * 1.5
      }

      // ─── Sky: Dark Velvety Twilight Slate Gradient (Images 1 & 2) ───
      const isDark = theme !== 'light' && theme !== 'e-ink-light'
      const skyGrad = ctx.createLinearGradient(0, 0, 0, displayHeight)
      if (isDark) {
        skyGrad.addColorStop(0, '#21252d')
        skyGrad.addColorStop(0.45, '#292e38')
        skyGrad.addColorStop(1, '#333845')
      } else {
        skyGrad.addColorStop(0, '#f1f5f9')
        skyGrad.addColorStop(1, '#e2e8f0')
      }
      ctx.fillStyle = isEink ? (isDark ? '#000000' : '#ffffff') : skyGrad
      ctx.fillRect(0, 0, displayWidth, displayHeight)

      // Transform world coordinates with Camera Viewport
      ctx.save()
      ctx.translate(displayWidth / 2 + shakeOffsetX, displayHeight / 2 + shakeOffsetY)
      ctx.scale(effectiveScale, effectiveScale)
      ctx.translate(-camX, -camY)

      // Visible sky window in world space
      const halfViewW = displayWidth / 2 / effectiveScale
      const halfViewH = displayHeight / 2 / effectiveScale
      const viewLeft = camX - halfViewW
      const viewRight = camX + halfViewW
      const viewTop = camY - halfViewH
      const viewBottom = camY + halfViewH
      const viewWidth = viewRight - viewLeft
      const viewHeight = viewBottom - viewTop

      // ─── 0. Sun, Atmosphere & 3D Claymorphic Clouds (matching reference image) ─────
      // Sun position with realistic distant celestial parallax
      // When camera pans 1400px from P1 to P2, sun glides gracefully across the sky instead of being stuck to viewport
      const sunX = 900 + (camX - 900) * 0.7 + 120
      const sunY = 110 + (camY - 320) * 0.25
      const sunR = 24

      if (!isEink) {
        ctx.save()

        // 1. Deep atmospheric warm glow filling upper sky around the sun
        const skyAmbientGlow = ctx.createRadialGradient(sunX, sunY, sunR, sunX, sunY, 320)
        skyAmbientGlow.addColorStop(0, 'rgba(255, 235, 175, 0.36)')
        skyAmbientGlow.addColorStop(0.28, 'rgba(254, 215, 120, 0.15)')
        skyAmbientGlow.addColorStop(0.7, 'rgba(217, 119, 6, 0.03)')
        skyAmbientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = skyAmbientGlow
        ctx.beginPath()
        ctx.arc(sunX, sunY, 320, 0, Math.PI * 2)
        ctx.fill()

        // 2. Diffuse Sun Corona Bloom
        const sunBloom = ctx.createRadialGradient(sunX, sunY, sunR * 0.5, sunX, sunY, 92)
        sunBloom.addColorStop(0, 'rgba(255, 248, 220, 0.95)')
        sunBloom.addColorStop(0.35, 'rgba(254, 235, 160, 0.55)')
        sunBloom.addColorStop(0.7, 'rgba(251, 191, 36, 0.16)')
        sunBloom.addColorStop(1, 'rgba(217, 119, 6, 0)')
        ctx.fillStyle = sunBloom
        ctx.beginPath()
        ctx.arc(sunX, sunY, 92, 0, Math.PI * 2)
        ctx.fill()

        // 3. Warm Soft Glowing Sun Disk with feathered edge
        const sunCore = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR)
        sunCore.addColorStop(0, '#ffffff')
        sunCore.addColorStop(0.55, '#fffbeb')
        sunCore.addColorStop(0.85, '#fef08a')
        sunCore.addColorStop(1, '#fed7aa')
        ctx.fillStyle = sunCore
        ctx.beginPath()
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()

        // 4. Volumetric 3D Clay Clouds drifting with wind across the mountain sky
        cloudsRef.current.forEach((cloud) => {
          // Subtle sky parallax: clouds glide with majestic depth relative to camera
          const renderCloudX = cloud.x + (camX - 900) * 0.2
          const renderCloudY = cloud.y + (camY - 320) * 0.15

          // Frustum culling: only draw if cloud is within or near visible camera window
          if (renderCloudX < viewLeft - 120 || renderCloudX > viewRight + 120) return

          ctx.save()
          ctx.translate(renderCloudX, renderCloudY)
          ctx.scale(cloud.scale, cloud.scale)

          // Soft ambient drop shadow under cloud onto sky (gentle, airy)
          ctx.shadowColor = isDark ? 'rgba(0, 0, 0, 0.16)' : 'rgba(0, 0, 0, 0.08)'
          ctx.shadowBlur = 10
          ctx.shadowOffsetY = 4

          // Sculpted 3D Clay Cloud Geometry (puffy lobes with soft flat base)
          ctx.beginPath()
          ctx.roundRect(-42, -2, 84, 16, 8)
          ctx.arc(-22, -4, 13.5, 0, Math.PI * 2)
          ctx.arc(-7, -13, 16.5, 0, Math.PI * 2)
          ctx.arc(9, -17, 18.5, 0, Math.PI * 2)
          ctx.arc(25, -7, 14.5, 0, Math.PI * 2)

          // Smooth wide horizontal sun influence: changes slowly across 800px of sky (no fast flips or jumps)
          const horizontalDiff = sunX - renderCloudX
          const sunBias = Math.max(-1, Math.min(1, horizontalDiff / 800))

          // Gradient vector: naturally illuminated from above with gentle lateral bias from the sun
          const lightX = sunBias * 12
          const lightY = -24
          const shadowX = -sunBias * 8
          const shadowY = 16

          const cloudGrad = ctx.createLinearGradient(lightX, lightY, shadowX, shadowY)

          // Gentle warm silver-gold tint when passing near the sun
          const sunProximity = Math.max(0, 1 - Math.abs(horizontalDiff) / 450)

          if (isDark) {
            const r = Math.round(155 + sunProximity * 45)
            const g = Math.round(168 + sunProximity * 38)
            const b = Math.round(186 + sunProximity * 18)
            cloudGrad.addColorStop(0, `rgb(${r}, ${g}, ${b})`)
            cloudGrad.addColorStop(0.4, '#768294')
            cloudGrad.addColorStop(0.78, '#5b6473')
            cloudGrad.addColorStop(1, '#495260')
          } else {
            cloudGrad.addColorStop(0, '#ffffff')
            cloudGrad.addColorStop(0.5, '#f1f5f9')
            cloudGrad.addColorStop(1, '#e2e8f0')
          }

          ctx.fillStyle = cloudGrad
          ctx.fill()

          // Subtle, calm sky-facing crest highlight (never jumps, stays gracefully on top)
          ctx.shadowColor = 'transparent'
          const crestAngle = -Math.PI * 0.5 + sunBias * 0.32
          const arcSpan = Math.PI * 0.32

          const lobes = [
            { cx: -22, cy: -4, r: 13.5, weight: 0.35 - sunBias * 0.22 },
            { cx: -7, cy: -13, r: 16.5, weight: 0.55 - sunBias * 0.15 },
            { cx: 9, cy: -17, r: 18.5, weight: 0.55 + sunBias * 0.15 },
            { cx: 25, cy: -7, r: 14.5, weight: 0.35 + sunBias * 0.22 },
          ]

          ctx.lineWidth = 1.1
          for (const lobe of lobes) {
            const alpha = Math.max(0.08, Math.min(0.48, lobe.weight * (0.35 + sunProximity * 0.22)))
            ctx.strokeStyle = isDark
              ? `rgba(255, 238, 195, ${alpha.toFixed(3)})`
              : `rgba(255, 255, 255, ${(alpha * 1.5).toFixed(3)})`
            ctx.beginPath()
            ctx.arc(lobe.cx, lobe.cy, lobe.r, crestAngle - arcSpan, crestAngle + arcSpan)
            ctx.stroke()
          }

          ctx.restore()
        })
      }

      // ─── 1. Rolling Mountain Terrain with Continuous Horizon Extensions ───────────────
      const splineStep = 6
      const minExtX = Math.min(-2000, viewLeft - 1000)
      const maxExtX = Math.max(terrain.width + 2000, viewRight + 1000)
      const bottomY = Math.max(CANVAS_HEIGHT + 3500, viewBottom + 2500)

      // Stable elevation extending terrain beyond battlefield borders (flat & stable horizon, never diverges into sky)
      const getExtElevation = (x: number): number => {
        if (x <= 0) {
          return terrain.heights[0] ?? 340
        }
        if (x >= terrain.width - 1) {
          return terrain.heights[terrain.width - 1] ?? 340
        }
        return terrain.heights[Math.floor(x)] ?? 340
      }

      ctx.beginPath()
      ctx.moveTo(minExtX, bottomY)
      ctx.lineTo(minExtX, getExtElevation(minExtX))

      for (let x = minExtX; x < maxExtX - splineStep; x += splineStep) {
        const nextX = x + splineStep
        const midX = (x + nextX) / 2
        const midY = (getExtElevation(x) + getExtElevation(nextX)) / 2
        ctx.quadraticCurveTo(x, getExtElevation(x), midX, midY)
      }
      ctx.lineTo(maxExtX, getExtElevation(maxExtX))
      ctx.lineTo(maxExtX, bottomY)
      ctx.closePath()

      // 1. Dark Velvety Matte Clay Shading for Rolling Hills (matching reference image)
      const terrainGrad = ctx.createLinearGradient(0, viewTop + viewHeight * 0.35, 0, viewBottom + 50)
      if (isDark) {
        terrainGrad.addColorStop(0, '#424854')
        terrainGrad.addColorStop(0.2, '#353a45')
        terrainGrad.addColorStop(0.55, '#262a32')
        terrainGrad.addColorStop(1, '#1b1d24')
      } else {
        terrainGrad.addColorStop(0, '#cbd5e1')
        terrainGrad.addColorStop(1, '#94a3b8')
      }
      ctx.fillStyle = isEink ? (isDark ? '#000000' : '#ffffff') : terrainGrad
      ctx.fill()

      // 2. Warm Golden Sun Light Wash on the terrain slope (matching reference image)
      if (!isEink) {
        ctx.save()
        ctx.clip() // Clip wash within the terrain path
        const sunWash = ctx.createRadialGradient(sunX, sunY, 40, sunX, sunY, 520)
        sunWash.addColorStop(0, 'rgba(254, 240, 138, 0.38)')
        sunWash.addColorStop(0.25, 'rgba(251, 191, 36, 0.16)')
        sunWash.addColorStop(0.65, 'rgba(217, 119, 6, 0.03)')
        sunWash.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = sunWash
        ctx.fillRect(minExtX, viewTop, maxExtX - minExtX, bottomY - viewTop)
        ctx.restore()
      }

      // 3. Crisp luminous silver-white ridge crest rim along continuous horizon
      ctx.beginPath()
      ctx.moveTo(minExtX, getExtElevation(minExtX))
      for (let x = minExtX; x < maxExtX - splineStep; x += splineStep) {
        const nextX = x + splineStep
        const midX = (x + nextX) / 2
        const midY = (getExtElevation(x) + getExtElevation(nextX)) / 2
        ctx.quadraticCurveTo(x, getExtElevation(x), midX, midY)
      }
      ctx.lineTo(maxExtX, getExtElevation(maxExtX))

      ctx.strokeStyle = isEink ? (isDark ? '#ffffff' : '#000000') : '#cbd5e1'
      ctx.lineWidth = 1.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()

      // 4. Luminous Golden Rim Glow directly below the Sun
      if (!isEink) {
        ctx.save()
        const sunRimGrad = ctx.createLinearGradient(sunX - 160, 0, sunX + 160, 0)
        sunRimGrad.addColorStop(0, 'rgba(253, 224, 71, 0)')
        sunRimGrad.addColorStop(0.35, 'rgba(254, 240, 138, 0.85)')
        sunRimGrad.addColorStop(0.65, 'rgba(251, 191, 36, 0.75)')
        sunRimGrad.addColorStop(1, 'rgba(253, 224, 71, 0)')
        ctx.strokeStyle = sunRimGrad
        ctx.lineWidth = 2.4
        ctx.lineCap = 'round'
        ctx.stroke()
        ctx.restore()
      }

      // ─── 2. 3D Matte Claymorphic Tanks (Sculpted exactly like reference image) ─────
      ;(['p1', 'p2'] as PlayerId[]).forEach((pid) => {
        const tank = tanks[pid]
        const isP1Tank = pid === 'p1'

        // Compute slope angle from smooth terrain points
        const slopeAngle = getTankSlopeAngle(tank, terrain)

        ctx.save()
        ctx.translate(tank.x, tank.y)
        ctx.rotate(slopeAngle)

        // 1. Soft Ambient Ground Contact Shadow (grounding tank to terrain slope)
        if (!isEink) {
          ctx.save()
          const shadowGrad = ctx.createRadialGradient(0, 3, 3, 0, 3, 34)
          shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.72)')
          shadowGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.42)')
          shadowGrad.addColorStop(0.75, 'rgba(0, 0, 0, 0.12)')
          shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
          ctx.fillStyle = shadowGrad
          ctx.beginPath()
          ctx.ellipse(0, 3, 34, 9, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }

        // 2. Track Base (Pill-shaped continuous tread assembly)
        const trackW = 46
        const trackH = 11
        const trackY = -trackH + 1

        const einkStroke = isDark ? '#ffffff' : '#000000'
        const einkLineWidth = 1.4

        ctx.beginPath()
        ctx.roundRect(-trackW / 2, trackY, trackW, trackH, 5.5)
        const trackGrad = ctx.createLinearGradient(0, trackY, 0, trackY + trackH)
        trackGrad.addColorStop(0, '#23272e')
        trackGrad.addColorStop(0.5, '#16191f')
        trackGrad.addColorStop(1, '#0e1014')
        ctx.fillStyle = isEink ? (isDark ? '#222222' : '#000000') : trackGrad
        ctx.fill()
        ctx.strokeStyle = isEink ? einkStroke : '#2e333d'
        ctx.lineWidth = isEink ? einkLineWidth : 0.8
        ctx.stroke()

        // 5 Recessed Road Wheels inside the track band
        const wheelCount = 5
        const wheelR = 3.2
        const wheelSpacing = (trackW - 14) / (wheelCount - 1)
        for (let i = 0; i < wheelCount; i++) {
          const wx = -(trackW - 14) / 2 + i * wheelSpacing
          const wy = trackY + trackH / 2

          ctx.beginPath()
          ctx.arc(wx, wy, wheelR, 0, Math.PI * 2)
          const wheelGrad = ctx.createRadialGradient(wx - 0.7, wy - 0.7, 0.3, wx, wy, wheelR)
          wheelGrad.addColorStop(0, '#363c47')
          wheelGrad.addColorStop(0.65, '#1e2229')
          wheelGrad.addColorStop(1, '#111317')
          ctx.fillStyle = isEink ? (isDark ? '#444444' : '#ffffff') : wheelGrad
          ctx.fill()
          if (isEink) {
            ctx.strokeStyle = einkStroke
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }

        // 3. Continuous Sculpted Mudguard / Fender wrapping over tracks
        ctx.beginPath()
        ctx.moveTo(-trackW / 2 - 1, trackY + trackH * 0.45)
        ctx.quadraticCurveTo(-trackW / 2, trackY - 2, -trackW / 2 + 3, trackY - 2.5)
        ctx.lineTo(trackW / 2 - 3, trackY - 2.5)
        ctx.quadraticCurveTo(trackW / 2, trackY - 2, trackW / 2 + 1, trackY + trackH * 0.45)
        ctx.lineTo(trackW / 2 - 1.5, trackY + 1)
        ctx.lineTo(-trackW / 2 + 1.5, trackY + 1)
        ctx.closePath()

        const fenderGrad = ctx.createLinearGradient(0, trackY - 2.5, 0, trackY + 2)
        fenderGrad.addColorStop(0, '#626b7c')
        fenderGrad.addColorStop(0.5, '#4a5260')
        fenderGrad.addColorStop(1, '#343a45')
        ctx.fillStyle = isEink ? (isDark ? '#333333' : '#e2e8f0') : fenderGrad
        ctx.fill()
        ctx.strokeStyle = isEink ? einkStroke : '#737d90'
        ctx.lineWidth = isEink ? einkLineWidth : 0.8
        ctx.stroke()

        // 4. Smooth Beveled Clay Hull
        const hullBaseY = trackY - 1.5
        const hullTopY = hullBaseY - 9

        ctx.beginPath()
        ctx.moveTo(-trackW / 2 + 3, hullBaseY)
        ctx.quadraticCurveTo(-trackW / 2 + 7, hullTopY + 1, -14, hullTopY)
        ctx.lineTo(13, hullTopY)
        ctx.quadraticCurveTo(trackW / 2 - 7, hullTopY + 1, trackW / 2 - 3, hullBaseY)
        ctx.closePath()

        const hullGrad = ctx.createLinearGradient(12, hullTopY, -12, hullBaseY)
        hullGrad.addColorStop(0, '#788294')
        hullGrad.addColorStop(0.35, '#5e6777')
        hullGrad.addColorStop(0.8, '#414856')
        hullGrad.addColorStop(1, '#2b303a')
        ctx.fillStyle = isEink
          ? isDark
            ? isP1Tank ? '#111111' : '#555555'
            : isP1Tank ? '#ffffff' : '#475569'
          : hullGrad
        ctx.fill()
        ctx.strokeStyle = isEink ? einkStroke : '#646e81'
        ctx.lineWidth = isEink ? 1.6 : 0.8
        ctx.stroke()

        // 5. Turret Dome & Cupola (Organic dome molded in clay)
        const turretCenterY = -TURRET_HUB_OFFSET
        const turretRx = 11.5
        const turretRy = 8.5

        ctx.beginPath()
        ctx.ellipse(0, turretCenterY, turretRx, turretRy, 0, Math.PI, 0)
        ctx.closePath()

        const turretGrad = ctx.createRadialGradient(4, turretCenterY - 4, 1, 0, turretCenterY, turretRx)
        turretGrad.addColorStop(0, '#8c95a8')
        turretGrad.addColorStop(0.4, '#687182')
        turretGrad.addColorStop(0.85, '#464d5b')
        turretGrad.addColorStop(1, '#2f343d')
        ctx.fillStyle = isEink
          ? isDark
            ? isP1Tank ? '#111111' : '#555555'
            : isP1Tank ? '#ffffff' : '#475569'
          : turretGrad
        ctx.fill()
        ctx.strokeStyle = isEink ? einkStroke : '#6f798b'
        ctx.lineWidth = isEink ? 1.6 : 0.8
        ctx.stroke()

        // Commander's Cupola / Hatch Cap
        ctx.beginPath()
        ctx.ellipse(-1.5, turretCenterY - turretRy + 0.8, 4.2, 1.6, 0, 0, Math.PI * 2)
        ctx.fillStyle = isEink ? (isDark ? '#ffffff' : '#000000') : '#727a8b'
        ctx.fill()
        ctx.strokeStyle = isEink ? einkStroke : 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = isEink ? 1 : 0.6
        ctx.stroke()

        // 6. Cylindrical Cannon Barrel with Mantlet (sleek minimalist cylinder matching reference image)
        const barrelLen = BARREL_LENGTH
        const barrelThickness = 3.6
        const barrelAngleRad = isP1Tank ? -((tank.angle * Math.PI) / 180) : -(((180 - tank.angle) * Math.PI) / 180)

        ctx.save()
        ctx.translate(0, turretCenterY)
        ctx.rotate(barrelAngleRad - slopeAngle)

        // Smooth rounded mantlet pivot base
        ctx.beginPath()
        ctx.arc(0, 0, 3.6, 0, Math.PI * 2)
        ctx.fillStyle = isEink ? (isDark ? '#444444' : '#000000') : '#677082'
        ctx.fill()
        if (isEink) {
          ctx.strokeStyle = einkStroke
          ctx.lineWidth = 1
          ctx.stroke()
        }

        // Barrel cylinder with cylindrical 3D gradient
        ctx.beginPath()
        ctx.moveTo(0, -barrelThickness / 2)
        ctx.lineTo(barrelLen, -barrelThickness / 2)
        ctx.lineTo(barrelLen, barrelThickness / 2)
        ctx.lineTo(0, barrelThickness / 2)
        ctx.closePath()

        const barrelGrad = ctx.createLinearGradient(0, -barrelThickness / 2, 0, barrelThickness / 2)
        barrelGrad.addColorStop(0, '#9aa3b6')
        barrelGrad.addColorStop(0.35, '#737c8e')
        barrelGrad.addColorStop(0.8, '#4d5564')
        barrelGrad.addColorStop(1, '#353a44')
        ctx.fillStyle = isEink
          ? isDark
            ? isP1Tank ? '#222222' : '#888888'
            : isP1Tank ? '#ffffff' : '#1e293b'
          : barrelGrad
        ctx.fill()
        ctx.strokeStyle = isEink ? einkStroke : '#8590a3'
        ctx.lineWidth = isEink ? 1.4 : 0.7
        ctx.stroke()

        ctx.restore() // restore barrel rotation

        // Solar rim highlight on top/right surfaces of tank from sun
        if (!isEink) {
          ctx.save()
          ctx.strokeStyle = 'rgba(254, 240, 150, 0.38)'
          ctx.lineWidth = 1.0
          ctx.beginPath()
          ctx.arc(0, turretCenterY, turretRx, isP1Tank ? -Math.PI * 0.45 : -Math.PI * 0.95, isP1Tank ? -0.05 : -Math.PI * 0.55)
          ctx.stroke()
          ctx.restore()
        }

        ctx.restore() // restore tank translation & slope rotation
      })

      // ─── 2.5 Tank Callouts & Identifiers (Opening Tour + Position Markers) ────
      const isPolish =
        windText?.includes('Wiatr') ||
        turnTitle?.toLowerCase().includes('gracz') ||
        turnTitle?.toLowerCase().includes('twoja')

      ;(['p1', 'p2'] as PlayerId[]).forEach((pid) => {
        const tank = tanks[pid]
        const isP1 = pid === 'p1'
        const isTargetedInIntro =
          (isP1 && (intro.stage === 'focus_p1' || intro.stage === 'pan_to_p1')) ||
          (!isP1 && (intro.stage === 'focus_p2' || intro.stage === 'pan_to_p2'))

        ctx.save()
        if (isIntro && isTargetedInIntro) {
          // Large, eye-catching cinematic callout banner during intro
          const bounce = Math.sin(now * 0.009) * 4
          const badgeY = tank.y - 48 + bounce

          const labelText = isP1
            ? isPolish
              ? '🛡️ GRACZ 1 (TY)'
              : '🛡️ PLAYER 1 (YOU)'
            : mode === '2p'
              ? isPolish
                ? '🎯 GRACZ 2'
                : '🎯 PLAYER 2'
              : isPolish
                ? '🎯 KOMPUTER'
                : '🎯 COMPUTER'

          ctx.font = 'bold 13px system-ui, -apple-system, sans-serif'
          const textMetrics = ctx.measureText(labelText)
          const badgeW = textMetrics.width + 24
          const badgeH = 26

          // Drop shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
          ctx.shadowBlur = 10
          ctx.shadowOffsetY = 4

          // Badge pill
          ctx.fillStyle = isEink ? (isDark ? '#000000' : '#ffffff') : 'rgba(15, 23, 42, 0.88)'
          ctx.strokeStyle = isEink ? '#ffffff' : isP1 ? '#38bdf8' : '#f43f5e'
          ctx.lineWidth = 1.6
          ctx.beginPath()
          ctx.roundRect(tank.x - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 13)
          ctx.fill()
          ctx.stroke()

          // Text
          ctx.shadowColor = 'transparent'
          ctx.fillStyle = isEink ? (isDark ? '#ffffff' : '#000000') : '#ffffff'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(labelText, tank.x, badgeY)

          // Downward pointer arrow
          ctx.fillStyle = isEink ? '#ffffff' : isP1 ? '#38bdf8' : '#f43f5e'
          ctx.beginPath()
          const arrowTipY = tank.y - 18
          const arrowBaseY = badgeY + badgeH / 2 + 1
          ctx.moveTo(tank.x - 6, arrowBaseY)
          ctx.lineTo(tank.x + 6, arrowBaseY)
          ctx.lineTo(tank.x, arrowTipY)
          ctx.closePath()
          ctx.fill()
        } else {
          const hasBeenHit = tank.hp < tank.maxHp
          const tagColor = isP1 ? '#38bdf8' : '#fb7185'

          if (hasBeenHit) {
            // ─── Health Bar above tank displayed from the moment of the first hit ───
            const barW = 44
            const barH = 5
            const barY = tank.y - 25
            const hpFrac = Math.max(0, Math.min(1, tank.hp / tank.maxHp))

            // Bar background container
            ctx.fillStyle = isEink ? '#000000' : 'rgba(15, 23, 42, 0.85)'
            ctx.strokeStyle = isEink ? '#ffffff' : 'rgba(255, 255, 255, 0.22)'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.roundRect(tank.x - barW / 2, barY - barH / 2, barW, barH, 2.5)
            ctx.fill()
            ctx.stroke()

            // Fill bar with dynamic color coding based on health remaining
            const fillW = Math.max(0, Math.round((barW - 2) * hpFrac))
            if (fillW > 0) {
              const fillColor = isEink
                ? '#ffffff'
                : hpFrac > 0.5
                  ? '#22c55e'
                  : hpFrac > 0.25
                    ? '#f59e0b'
                    : '#ef4444'

              ctx.fillStyle = fillColor
              ctx.beginPath()
              ctx.roundRect(tank.x - barW / 2 + 1, barY - barH / 2 + 1, fillW, barH - 2, 1.5)
              ctx.fill()
            }

            // Identity & HP Number Tag above the health bar
            const tagY = barY - 12
            const tagText = `${isP1 ? 'P1' : mode === '2p' ? 'P2' : 'COM'} · ${tank.hp}`
            ctx.font = '600 10px system-ui, -apple-system, sans-serif'
            const tagMetrics = ctx.measureText(tagText)
            const tagW = tagMetrics.width + 12
            const tagH = 15

            ctx.fillStyle = isEink ? '#000000' : 'rgba(15, 23, 42, 0.75)'
            ctx.strokeStyle = isEink ? '#ffffff' : tagColor
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.roundRect(tank.x - tagW / 2, tagY - tagH / 2, tagW, tagH, 7)
            ctx.fill()
            ctx.stroke()

            ctx.fillStyle = isEink ? '#ffffff' : '#f8fafc'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(tagText, tank.x, tagY)
          } else {
            // Before first hit: clean position tag only, no health bar
            const tagY = tank.y - 28
            const tagText = isP1 ? 'P1' : mode === '2p' ? 'P2' : 'COM'

            ctx.font = '600 10px system-ui, -apple-system, sans-serif'
            const tagMetrics = ctx.measureText(tagText)
            const tagW = tagMetrics.width + 12
            const tagH = 16

            ctx.fillStyle = isEink ? '#000000' : 'rgba(15, 23, 42, 0.65)'
            ctx.strokeStyle = isEink ? '#ffffff' : tagColor
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.roundRect(tank.x - tagW / 2, tagY - tagH / 2, tagW, tagH, 8)
            ctx.fill()
            ctx.stroke()

            ctx.fillStyle = isEink ? '#ffffff' : '#f8fafc'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(tagText, tank.x, tagY)
          }
        }
        ctx.restore()
      })

      // ─── 3. Aiming Trajectory Arc & Crosshair Reticle ──────────
      if (phase === 'aiming' && turnElapsed >= 0.8) {
        const muzzle = getMuzzlePosition(activeTank, terrain)
        const rad = (activeTank.angle * Math.PI) / 180
        const isP1 = activeTank.id === 'p1'

        // Clean, short trajectory preview (~80px length) with elegant spacing
        const previewSpeed = 240
        let vx = isP1 ? Math.cos(rad) * previewSpeed : -Math.cos(rad) * previewSpeed
        let vy = -Math.sin(rad) * previewSpeed
        let px = muzzle.x
        let py = muzzle.y

        const reticleColor = isEink
          ? isDark ? '#ffffff' : '#000000'
          : isDark ? 'rgba(255, 255, 255, 0.95)' : '#0f172a'

        ctx.save()
        if (!isEink) {
          ctx.shadowColor = isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.95)'
          ctx.shadowBlur = 3
        }

        // Anchor point at muzzle tip
        ctx.fillStyle = reticleColor
        ctx.beginPath()
        ctx.arc(px, py, 2.0, 0, Math.PI * 2)
        ctx.fill()

        // Wide, elegant dashes (6px dash, 8px gap) - never dense
        ctx.setLineDash([6, 8])
        ctx.strokeStyle = reticleColor
        ctx.lineWidth = isEink ? 1.8 : 1.6

        ctx.beginPath()
        ctx.moveTo(px, py)

        const guideDt = 0.038
        const guideSteps = 8
        for (let s = 0; s < guideSteps; s++) {
          const nextPx = px + vx * guideDt + 0.5 * (wind * 35) * guideDt * guideDt
          const nextPy = py + vy * guideDt + 0.5 * 180 * guideDt * guideDt
          vx += wind * 35 * guideDt
          vy += 180 * guideDt
          ctx.lineTo(nextPx, nextPy)
          px = nextPx
          py = nextPy
        }
        ctx.stroke()
        ctx.restore()

        // Minimalist Crosshair Reticle at end of preview trajectory
        const reticleX = px
        const reticleY = py

        ctx.save()
        if (!isEink) {
          ctx.shadowColor = isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.95)'
          ctx.shadowBlur = 3
        }
        ctx.strokeStyle = reticleColor
        ctx.lineWidth = isEink ? 1.8 : 1.5

        // Reticle Circle (clean 5px radius)
        ctx.beginPath()
        ctx.arc(reticleX, reticleY, 5, 0, Math.PI * 2)
        ctx.stroke()

        // Cross Ticks (extending outside circle without intersecting)
        ctx.beginPath()
        ctx.moveTo(reticleX - 9, reticleY)
        ctx.lineTo(reticleX - 3.5, reticleY)
        ctx.moveTo(reticleX + 3.5, reticleY)
        ctx.lineTo(reticleX + 9, reticleY)
        ctx.moveTo(reticleX, reticleY - 9)
        ctx.lineTo(reticleX, reticleY - 3.5)
        ctx.moveTo(reticleX, reticleY + 3.5)
        ctx.lineTo(reticleX, reticleY + 9)
        ctx.stroke()

        ctx.restore()
      }

      // ─── 4. Projectile (Glowing Kinetic Tracer & Ballistic Arc) ─────────────
      projectiles.forEach((proj) => {
        // Continuous smoke / tracer trail behind the shell
        if (proj.trail && proj.trail.length > 1) {
          ctx.save()
          for (let i = 1; i < proj.trail.length; i++) {
            const p0 = proj.trail[i - 1]
            const p1 = proj.trail[i]
            const progress = i / proj.trail.length
            ctx.beginPath()
            ctx.moveTo(p0.x, p0.y)
            ctx.lineTo(p1.x, p1.y)
            ctx.strokeStyle = `rgba(255, 240, 160, ${progress * 0.75})`
            ctx.lineWidth = 1.0 + progress * 2.2
            ctx.lineCap = 'round'
            ctx.stroke()
          }
          ctx.restore()
        }

        ctx.save()
        // Directional projectile glow along velocity vector
        const pBloom = ctx.createRadialGradient(proj.x, proj.y, 1, proj.x, proj.y, 10)
        pBloom.addColorStop(0, '#ffffff')
        pBloom.addColorStop(0.4, 'rgba(254, 240, 138, 0.95)')
        pBloom.addColorStop(0.8, 'rgba(245, 158, 11, 0.45)')
        pBloom.addColorStop(1, 'rgba(245, 158, 11, 0)')
        ctx.fillStyle = pBloom
        ctx.beginPath()
        ctx.arc(proj.x, proj.y, 10, 0, Math.PI * 2)
        ctx.fill()

        // Crisp glowing bullet core
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(proj.x, proj.y, 3.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // ─── 5. Golden Starburst Blast & Radiating Needles (Image 3) ─────────
      explosions.forEach((exp) => {
        ctx.save()
        const prog = exp.progress
        const alpha = Math.max(0, 1 - prog * 0.9)
        const currentR = exp.radius

        // 1. Ambient warm flash on ground and sky
        const flashGrad = ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, currentR * 2.2)
        flashGrad.addColorStop(0, `rgba(254, 240, 138, ${0.4 * alpha})`)
        flashGrad.addColorStop(0.5, `rgba(245, 158, 11, ${0.2 * alpha})`)
        flashGrad.addColorStop(1, 'rgba(217, 119, 6, 0)')
        ctx.fillStyle = flashGrad
        ctx.beginPath()
        ctx.arc(exp.x, exp.y, currentR * 2.2, 0, Math.PI * 2)
        ctx.fill()

        // 2. Multi-point Starburst Blast (14-point star)
        const points = 14
        const outerR = currentR * 1.15
        const innerR = currentR * 0.42

        ctx.beginPath()
        for (let i = 0; i < points * 2; i++) {
          const r = i % 2 === 0 ? outerR : innerR
          const rVar = i % 2 === 0 && i % 4 === 0 ? r * 1.25 : r
          const angle = (i * Math.PI) / points - Math.PI / 2
          const sx = exp.x + Math.cos(angle) * rVar
          const sy = exp.y + Math.sin(angle) * rVar
          if (i === 0) ctx.moveTo(sx, sy)
          else ctx.lineTo(sx, sy)
        }
        ctx.closePath()

        const starGrad = ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, outerR)
        starGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`)
        starGrad.addColorStop(0.35, `rgba(254, 240, 138, ${alpha})`)
        starGrad.addColorStop(0.75, `rgba(245, 158, 11, ${0.9 * alpha})`)
        starGrad.addColorStop(1, `rgba(217, 119, 6, ${0.6 * alpha})`)
        ctx.fillStyle = starGrad
        ctx.fill()
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`
        ctx.lineWidth = 1.5
        ctx.stroke()

        // 3. Inner White-Hot Core Star
        ctx.beginPath()
        for (let i = 0; i < points * 2; i++) {
          const r = i % 2 === 0 ? currentR * 0.55 : currentR * 0.22
          const angle = (i * Math.PI) / points - Math.PI / 2
          const sx = exp.x + Math.cos(angle) * r
          const sy = exp.y + Math.sin(angle) * r
          if (i === 0) ctx.moveTo(sx, sy)
          else ctx.lineTo(sx, sy)
        }
        ctx.closePath()
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`
        ctx.fill()

        // 4. Radiating Needle Spark Streaks (Image 3)
        const sparkCount = 16
        ctx.lineWidth = 1.8
        for (let s = 0; s < sparkCount; s++) {
          const sAngle = (s * Math.PI * 2) / sparkCount + 0.15 * Math.sin(s * 3)
          const sDistInner = currentR * (0.8 + 0.3 * (s % 3))
          const sDistOuter = sDistInner + currentR * (0.7 + 0.5 * ((s * 7) % 3))
          const x1 = exp.x + Math.cos(sAngle) * sDistInner
          const y1 = exp.y + Math.sin(sAngle) * sDistInner
          const x2 = exp.x + Math.cos(sAngle) * sDistOuter
          const y2 = exp.y + Math.sin(sAngle) * sDistOuter

          const sparkGrad = ctx.createLinearGradient(x1, y1, x2, y2)
          sparkGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`)
          sparkGrad.addColorStop(0.6, `rgba(253, 224, 71, ${alpha * 0.9})`)
          sparkGrad.addColorStop(1, `rgba(245, 158, 11, 0)`)
          ctx.strokeStyle = sparkGrad
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        }

        ctx.restore()
      })

      // ─── 6. Floating Damage Combat Text (Worms Style: Bold red, dark outline, floating up) ─
      const textsToDraw =
        floatingTextsRef.current && floatingTextsRef.current.length > 0
          ? floatingTextsRef.current
          : floatingTexts || []

      textsToDraw.forEach((ft) => {
        ctx.save()
        const alpha = Math.max(0, Math.min(1, ft.alpha))
        ctx.globalAlpha = alpha

        // Worms-style bold impact typography
        ctx.font = '900 24px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Impact, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // Deep drop shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetY = 2

        // Thick black outline for maximum contrast against any terrain/sky
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 4.5
        ctx.lineJoin = 'round'
        ctx.miterLimit = 2
        ctx.strokeText(ft.text, ft.x, ft.y)

        // Reset shadow for crisp interior fill
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0

        // Vibrant red fill
        ctx.fillStyle = ft.color || '#ef4444'
        ctx.fillText(ft.text, ft.x, ft.y)

        // Specular highlight on upper part of numerals
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
        ctx.fillText(ft.text, ft.x, ft.y - 1)

        ctx.restore()
      })

      ctx.restore() // End Camera Transform

      // Screen-space Recon / Scout Banner with Skip/Return Prompt
      if (isIntro || isScoutActive) {
        ctx.save()
        const isPl = locale === 'pl' || windText?.includes('Wiatr')
        const bannerText = isScoutActive
          ? (t?.scoutBanner || (isPl ? 'Rozpoznanie pozycji przeciwnika · Kliknij, aby wrócić' : 'Enemy reconnaissance · Click to return'))
          : (isPl ? 'Rozpoznanie pozycji · Kliknij, aby pominąć' : 'Position recon · Click to skip')
        ctx.font = '500 12px system-ui, -apple-system, sans-serif'
        const bMetrics = ctx.measureText(bannerText)
        const bW = bMetrics.width + 24
        const bH = 26
        const bX = displayWidth / 2
        const bY = 72

        ctx.fillStyle = 'rgba(15, 23, 42, 0.82)'
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(bX - bW / 2, bY - bH / 2, bW, bH, 13)
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(bannerText, bX, bY)
        ctx.restore()
      }

      ctx.restore() // End HiDPI scaling

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animId)
  }, [tanks, terrain, projectiles, explosions, floatingTexts, currentTurn, phase, wind, screenShake, isEink, theme, mode, windText])

  const p1HpPercent = Math.max(0, Math.min(100, (tanks.p1.hp / tanks.p1.maxHp) * 100))
  const p2HpPercent = Math.max(0, Math.min(100, (tanks.p2.hp / tanks.p2.maxHp) * 100))

  const activeTank = propActiveTank || tanks[currentTurn]

  return (
    <div className="artillery-canvas-container">
      <div
        className={`artillery-canvas-wrapper ${isDark ? 'artillery-canvas-wrapper--dark' : 'artillery-canvas-wrapper--light'}`}
        data-eink={isEink ? 'true' : undefined}
        data-theme={theme}
      >
        {/* On-Game Tactical HUD inside the centered game wrapper */}
        <div className="artillery-tactical-hud" aria-live="polite">
          {/* Left: Player 1 (YOU) */}
          <div
            className={`artillery-hud-player artillery-hud-player--left ${currentTurn === 'p1' ? 'artillery-hud-player--active' : ''}`}
          >
            <div className="artillery-hud-player-header">
              <span className="artillery-hud-player-tag">YOU</span>
              <span className="artillery-hud-hp-num">{tanks.p1.hp} HP</span>
            </div>
            <div className="artillery-hud-hp-bar">
              <div className="artillery-hud-hp-fill" style={{ width: `${p1HpPercent}%` }} />
            </div>
          </div>

          {/* Center: Sleek Wind Pill with Volume/Signal Bars & Arrow */}
          <div className="artillery-hud-center">
            {(() => {
              const windLevel = Math.max(0, Math.min(3, Math.abs(wind)))
              const windLabel = t?.windLabel || (locale === 'pl' ? 'Wiatr' : 'Wind')
              const isCalm = windLevel === 0

              return (
                <div
                  className={`artillery-hud-wind-pill artillery-hud-wind-pill--level-${windLevel}`}
                  id="artillery-wind-badge"
                  title={`${windLabel}: ${isCalm ? (locale === 'pl' ? 'Spokojny' : 'Calm') : `${windLevel}/3 (${wind < 0 ? '←' : '→'})`}`}
                  aria-label={`${windLabel}: ${isCalm ? (locale === 'pl' ? 'Spokojny' : 'Calm') : `${windLevel}/3`}`}
                >
                  <svg
                    className="artillery-hud-wind-icon"
                    width="18"
                    height="15"
                    viewBox="0 0 24 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 6h11a3 3 0 1 0-3-3" />
                    <path d="M2 11h16a3 3 0 1 1-3 3" />
                    <path d="M5 16h8" />
                  </svg>

                  {/* Accessible label for screen readers and tests */}
                  <span className="artillery-hud-wind-sr">
                    {windLabel}
                  </span>

                  {/* Direction Arrow */}
                  <span className="artillery-hud-wind-arrow" aria-hidden="true">
                    {wind < 0 ? '←' : wind > 0 ? '→' : '•'}
                  </span>

                  {/* 3-level Volume / Signal Bars (Kreski) */}
                  <div className="artillery-hud-wind-bars" aria-hidden="true">
                    <span className={`artillery-wind-bar artillery-wind-bar--1 ${windLevel >= 1 ? 'artillery-wind-bar--active' : ''}`} />
                    <span className={`artillery-wind-bar artillery-wind-bar--2 ${windLevel >= 2 ? 'artillery-wind-bar--active' : ''}`} />
                    <span className={`artillery-wind-bar artillery-wind-bar--3 ${windLevel >= 3 ? 'artillery-wind-bar--active' : ''}`} />
                  </div>
                </div>
              )
            })()}
            <div
              className={`artillery-hud-turn-badge ${
                turnTitle?.toLowerCase().includes('myśli') || turnTitle?.toLowerCase().includes('thinking')
                  ? 'artillery-hud-turn-badge--visible'
                  : 'artillery-hud-turn-badge--sr-only'
              }`}
              id="artillery-turn-indicator"
            >
              {turnTitle}
            </div>
          </div>

          {/* Right: Player 2 / AI */}
          <div
            className={`artillery-hud-player artillery-hud-player--right ${currentTurn === 'p2' ? 'artillery-hud-player--active' : ''}`}
          >
            <div className="artillery-hud-player-header">
              <span className="artillery-hud-player-tag">{mode === '2p' ? 'P2' : p2Label || 'Computer'}</span>
              <span className="artillery-hud-hp-num">{tanks.p2.hp} HP</span>
            </div>
            <div className="artillery-hud-hp-bar">
              <div className="artillery-hud-hp-fill" style={{ width: `${p2HpPercent}%` }} />
            </div>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="artillery-canvas-element"
          onClick={() => {
            isIntroSkippedRef.current = true
            if (scoutStateRef.current.stage !== 'idle') {
              handleCancelScout()
            }
          }}
        />

        {/* Floating tactical dock with [-] 45° [+] angle, circular FIRE button, and Scout button */}
        {onAngleChange && onFireWithPower && (
          <ArtilleryTacticalDock
            t={t}
            phase={phase}
            currentTurn={currentTurn}
            mode={mode}
            activeTank={activeTank}
            isScouting={isScouting}
            onScout={handleStartScout}
            theme={theme}
            isEink={isEink}
            onAngleChange={(angle) => {
              isIntroSkippedRef.current = true
              if (scoutStateRef.current.stage !== 'idle') {
                handleCancelScout()
              }
              onAngleChange(angle)
            }}
            onFireWithPower={(power) => {
              isIntroSkippedRef.current = true
              if (scoutStateRef.current.stage !== 'idle') {
                handleCancelScout()
              }
              onFireWithPower(power)
            }}
          />
        )}
      </div>
    </div>
  )
})
