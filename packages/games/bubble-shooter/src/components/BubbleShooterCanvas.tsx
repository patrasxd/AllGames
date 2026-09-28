import { useEffect, useRef, memo } from 'react'
import type { MutableRefObject } from 'react'
import type { BubbleColor, BubbleView, GameTheme, ShotEvent } from '../types'
import {
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
  SHOOTER_Y,
  RADIUS,
  ROWS,
  COLS,
  ROW_HEIGHT,
  DANGER_ROW,
  aimAngleFromPoint,
  cellExists,
  cellX,
  cellY,
} from '../logic/engine'

interface BubbleShooterCanvasProps {
  viewRef: MutableRefObject<BubbleView>
  isEink?: boolean
  theme?: GameTheme
  onAim: (x: number, y: number) => void
  onShoot: (angle: number) => void
}

// Colour-blind-safe palette (Okabe-Ito based). The ids are historical names; what matters is that the hues differ in
// lightness as well as hue, and every bubble also carries its own symbol (see drawGlyph).
const BUBBLE_HEX: Record<BubbleColor, [string, string]> = {
  red: ['#EE7A2E', '#C25400'], // vermilion
  blue: ['#1F79B8', '#003F73'], // deep blue
  green: ['#12A57C', '#00704F'], // bluish green
  yellow: ['#F7EE7A', '#E3D62A'], // yellow
  purple: ['#F8D5E7', '#EBA7CB'], // light pink
  orange: ['#8FCDF2', '#3B9BD6'], // sky blue
}

const EINK_GLYPHS: BubbleColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']

// ─── Animation timings (ms) ───────────────────────────────
const LAND_MOVE_MS = 80
const LAND_PULSE_MS = 150
const POP_MS = 300
const ROW_SHIFT_MS = 280
const RELOAD_MS = 200
const TEXT_MS = 900
const PARTICLE_MS = 420
const FALL_GRAVITY = 1500 // px / s²

const easeOutCubic = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3)
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

interface Pop {
  x: number
  y: number
  color: BubbleColor
  start: number
  slide: boolean
}
interface Fall {
  x: number
  y: number
  vx: number
  vy: number
  color: BubbleColor
  start: number
  slide: boolean
}
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: BubbleColor
  start: number
  slide: boolean
}
interface FloatText {
  x: number
  y: number
  text: string
  start: number
}

interface Effects {
  lastSeq: number
  pops: Pop[]
  falls: Fall[]
  particles: Particle[]
  texts: FloatText[]
  rowShiftStart: number | null
  land: { row: number; col: number; fromX: number; fromY: number; start: number } | null
  reloadStart: number
  trail: { x: number; y: number }[]
  displayAngle: number
  lastNow: number
}

function createEffects(): Effects {
  return {
    lastSeq: -1,
    pops: [],
    falls: [],
    particles: [],
    texts: [],
    rowShiftStart: null,
    land: null,
    reloadStart: 0,
    trail: [],
    displayAngle: 0,
    lastNow: 0,
  }
}

function handleEvent(fx: Effects, ev: ShotEvent, now: number) {
  fx.trail = []
  if (ev.kind === 'reset') {
    fx.pops = []
    fx.falls = []
    fx.particles = []
    fx.texts = []
    fx.rowShiftStart = null
    fx.land = null
    fx.reloadStart = now
    return
  }

  const slide = ev.rowInserted
  const landed = ev.landed
  const cx = landed ? cellX(landed.row, landed.col, ev.parity) : VIRTUAL_WIDTH / 2
  const cy = landed ? cellY(landed.row) : 0

  // Row insertion shifts every cell by one row, so a snap animation would target the wrong slot.
  fx.land =
    landed && !ev.rowInserted
      ? { row: landed.row, col: landed.col, fromX: landed.fromX, fromY: landed.fromY, start: now }
      : null

  for (const c of ev.matched) {
    const x = cellX(c.row, c.col, ev.parity)
    const y = cellY(c.row)
    const dist = Math.hypot(x - cx, y - cy) / (2 * RADIUS)
    const start = now + LAND_MOVE_MS + dist * 45
    fx.pops.push({ x, y, color: c.color, start, slide })
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2
      const speed = 70 + Math.random() * 90
      fx.particles.push({
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 30,
        size: 2.5 + Math.random() * 2.5,
        color: c.color,
        start,
        slide,
      })
    }
  }

  for (const f of ev.floating) {
    fx.falls.push({
      x: cellX(f.row, f.col, ev.parity),
      y: cellY(f.row),
      vx: (Math.random() - 0.5) * 110,
      vy: -120 - Math.random() * 80,
      color: f.color,
      start: now + LAND_MOVE_MS + 140 + Math.random() * 200,
      slide,
    })
  }

  if (ev.gained > 0 && landed) {
    fx.texts.push({ x: cx, y: cy - 6, text: `+${ev.gained}`, start: now + LAND_MOVE_MS + 40 })
  }

  if (ev.rowInserted) fx.rowShiftStart = now
  fx.reloadStart = now + 30
}

interface Palette {
  isEink: boolean
  isDark: boolean
  surface: string
  surface2: string
  border: string
  text: string
  textDim: string
}

/** Each colour has its own symbol so bubbles stay distinguishable without relying on colour. */
function drawGlyph(
  ctx: CanvasRenderingContext2D,
  color: BubbleColor,
  x: number,
  y: number,
  r: number,
  ink: string,
  outline?: string,
) {
  const idx = EINK_GLYPHS.indexOf(color)
  const trace = () => {
    ctx.beginPath()
    switch (idx) {
      case 0: // dot
        ctx.arc(x, y, r * 0.24, 0, Math.PI * 2)
        break
      case 1: // ring
        ctx.arc(x, y, r * 0.42, 0, Math.PI * 2)
        break
      case 2: // plus
        ctx.moveTo(x - r * 0.46, y)
        ctx.lineTo(x + r * 0.46, y)
        ctx.moveTo(x, y - r * 0.46)
        ctx.lineTo(x, y + r * 0.46)
        break
      case 3: // cross
        ctx.moveTo(x - r * 0.4, y - r * 0.4)
        ctx.lineTo(x + r * 0.4, y + r * 0.4)
        ctx.moveTo(x + r * 0.4, y - r * 0.4)
        ctx.lineTo(x - r * 0.4, y + r * 0.4)
        break
      case 4: // triangle
        ctx.moveTo(x, y - r * 0.46)
        ctx.lineTo(x + r * 0.46, y + r * 0.34)
        ctx.lineTo(x - r * 0.46, y + r * 0.34)
        ctx.closePath()
        break
      default: // two bars
        ctx.moveTo(x - r * 0.44, y - r * 0.2)
        ctx.lineTo(x + r * 0.44, y - r * 0.2)
        ctx.moveTo(x - r * 0.44, y + r * 0.2)
        ctx.lineTo(x + r * 0.44, y + r * 0.2)
    }
  }
  const paint = (style: string, width: number) => {
    trace()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = style
    ctx.fillStyle = style
    ctx.lineWidth = width
    ctx.stroke()
    if (idx === 0) ctx.fill()
  }
  const unit = r / RADIUS
  if (outline) paint(outline, 4.8 * unit)
  paint(ink, 2.4 * unit)
}

function drawBubble(
  ctx: CanvasRenderingContext2D,
  color: BubbleColor,
  x: number,
  y: number,
  r: number,
  pal: Palette,
  scale = 1,
  alpha = 1,
) {
  if (scale <= 0 || alpha <= 0) return
  const rr = r * scale
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.beginPath()
  ctx.arc(x, y, rr * 0.92, 0, Math.PI * 2)

  if (pal.isEink) {
    ctx.fillStyle = pal.surface
    ctx.fill()
    ctx.strokeStyle = pal.text
    ctx.lineWidth = 1.5
    ctx.stroke()
    drawGlyph(ctx, color, x, y, rr, pal.text)
    ctx.restore()
    return
  }

  const [light, dark] = BUBBLE_HEX[color]
  const gradient = ctx.createRadialGradient(x - rr * 0.3, y - rr * 0.3, rr * 0.1, x, y, rr)
  gradient.addColorStop(0, light)
  gradient.addColorStop(1, dark)
  ctx.fillStyle = gradient
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.18)'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(x - rr * 0.32, y - rr * 0.34, rr * 0.28, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fill()

  // Skip the symbol on tiny motion-trail ghosts, where it would just be noise.
  if (rr >= RADIUS * 0.55) drawGlyph(ctx, color, x, y, rr, '#ffffff', 'rgba(0,0,0,0.6)')
  ctx.restore()
}

function readPalette(canvas: HTMLCanvasElement, isEinkProp: boolean, theme: GameTheme): Palette {
  const computed = window.getComputedStyle(canvas)
  const isEink =
    isEinkProp ||
    theme === 'e-ink-dark' ||
    theme === 'e-ink-light' ||
    computed.getPropertyValue('--all-duration-fast').trim() === '0ms'
  const isDark =
    theme === 'dark' ||
    theme === 'e-ink-dark' ||
    (document.documentElement.getAttribute('data-theme') || '').includes('dark')
  return {
    isEink,
    isDark,
    surface: computed.getPropertyValue('--all-surface').trim() || (isDark ? '#0f172a' : '#f4f2ea'),
    surface2: computed.getPropertyValue('--all-surface-2').trim() || (isDark ? '#151c28' : '#e2e8f0'),
    border: computed.getPropertyValue('--all-border-2').trim() || (isDark ? '#334155' : '#94a3b8'),
    text: computed.getPropertyValue('--all-text').trim() || (isDark ? '#f8fafc' : '#1e293b'),
    textDim: computed.getPropertyValue('--all-text-dim').trim() || (isDark ? '#cbd5e1' : '#475569'),
  }
}

function aimPath(angle: number): { x: number; y: number }[] {
  let dx = Math.sin(angle)
  const dy = -Math.cos(angle)
  let x = VIRTUAL_WIDTH / 2
  let y = SHOOTER_Y
  const points = [{ x, y }]
  for (let bounce = 0; bounce < 2; bounce++) {
    const tCeiling = dy < 0 ? (y - RADIUS) / -dy : Infinity
    const tWallLeft = dx < 0 ? (RADIUS - x) / dx : Infinity
    const tWallRight = dx > 0 ? (VIRTUAL_WIDTH - RADIUS - x) / dx : Infinity
    const t = Math.min(tCeiling, tWallLeft, tWallRight)
    if (!isFinite(t) || t <= 0) break
    x += dx * t
    y += dy * t
    points.push({ x, y })
    if (t === tCeiling) break
    dx = -dx
  }
  return points
}

function render(ctx: CanvasRenderingContext2D, v: BubbleView, fx: Effects, pal: Palette, now: number) {
  // Smooth the aim so the guide and barrel glide instead of snapping between pointer events.
  const dtMs = fx.lastNow ? Math.min(now - fx.lastNow, 50) : 16
  fx.lastNow = now
  fx.displayAngle += (v.aimAngle - fx.displayAngle) * (1 - Math.exp(-dtMs / 45))

  ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT)

  // Background grid
  ctx.strokeStyle = pal.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.035)'
  ctx.lineWidth = 1
  for (let x = 0; x < VIRTUAL_WIDTH; x += 40) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, VIRTUAL_HEIGHT)
    ctx.stroke()
  }
  for (let y = 0; y < VIRTUAL_HEIGHT; y += 40) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(VIRTUAL_WIDTH, y)
    ctx.stroke()
  }

  // Danger line
  const dangerY = cellY(DANGER_ROW) - RADIUS
  ctx.setLineDash([6, 5])
  ctx.strokeStyle = pal.isEink ? pal.text : 'rgba(220, 38, 38, 0.55)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(0, dangerY)
  ctx.lineTo(VIRTUAL_WIDTH, dangerY)
  ctx.stroke()
  ctx.setLineDash([])

  // Row insertion slide: the whole grid glides down by one row.
  let shiftProgress = 1
  if (fx.rowShiftStart !== null) {
    shiftProgress = easeOutCubic((now - fx.rowShiftStart) / ROW_SHIFT_MS)
    if (shiftProgress >= 1) fx.rowShiftStart = null
  }
  const gridOffsetY = -ROW_HEIGHT * (1 - shiftProgress)
  // Effects spawned during a row insertion were laid out in pre-shift coordinates.
  const slideOffsetY = (slide: boolean) => (slide ? ROW_HEIGHT * shiftProgress : 0)

  // Settled bubbles (with the landing snap + squash pulse on the newly attached one)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!cellExists(row, col, v.rowParity)) continue
      const color = v.grid[row][col]
      if (!color) continue
      let x = cellX(row, col, v.rowParity)
      let y = cellY(row) + gridOffsetY
      let scale = 1
      const land = fx.land
      if (land && land.row === row && land.col === col) {
        const elapsed = now - land.start
        const moveT = easeOutCubic(elapsed / LAND_MOVE_MS)
        x = land.fromX + (x - land.fromX) * moveT
        y = land.fromY + (y - land.fromY) * moveT
        const pulseT = clamp01((elapsed - LAND_MOVE_MS) / LAND_PULSE_MS)
        scale = 1 + 0.14 * Math.sin(pulseT * Math.PI)
        if (elapsed > LAND_MOVE_MS + LAND_PULSE_MS) fx.land = null
      }
      drawBubble(ctx, color, x, y, RADIUS, pal, scale)
    }
  }

  // Pops: hold at full size until their staggered start, then swell and vanish.
  fx.pops = fx.pops.filter((p) => now - p.start < POP_MS)
  for (const p of fx.pops) {
    const y = p.y + slideOffsetY(p.slide)
    const t = (now - p.start) / POP_MS
    if (t < 0) {
      drawBubble(ctx, p.color, p.x, y, RADIUS, pal)
    } else {
      const swell = t < 0.25 ? 1 + (t / 0.25) * 0.2 : 1.2 * (1 - (t - 0.25) / 0.75)
      const alpha = t < 0.25 ? 1 : 1 - (t - 0.25) / 0.75
      drawBubble(ctx, p.color, p.x, y, RADIUS, pal, swell, alpha)
    }
  }

  // Bubbles cut loose from the ceiling fall away under gravity.
  fx.falls = fx.falls.filter(
    (f) =>
      f.y + slideOffsetY(f.slide) < VIRTUAL_HEIGHT + RADIUS * 2 &&
      (f.start > now || fallY(f, now) < VIRTUAL_HEIGHT + RADIUS * 2),
  )
  for (const f of fx.falls) {
    const t = (now - f.start) / 1000
    if (t < 0) {
      drawBubble(ctx, f.color, f.x, f.y + slideOffsetY(f.slide), RADIUS, pal)
    } else {
      const y = fallY(f, now) + slideOffsetY(f.slide)
      drawBubble(
        ctx,
        f.color,
        f.x + f.vx * t,
        y,
        RADIUS,
        pal,
        1 - clamp01(t * 0.35) * 0.3,
        1 - clamp01((t - 0.35) / 0.4) * 0.6,
      )
    }
  }

  // Pop particles
  fx.particles = fx.particles.filter((p) => now - p.start < PARTICLE_MS)
  for (const p of fx.particles) {
    const t = (now - p.start) / 1000
    if (t < 0) continue
    const life = t / (PARTICLE_MS / 1000)
    const x = p.x + p.vx * t
    const y = p.y + p.vy * t + 0.5 * 500 * t * t + slideOffsetY(p.slide)
    ctx.beginPath()
    ctx.arc(x, y, p.size * (1 - life * 0.7), 0, Math.PI * 2)
    ctx.globalAlpha = 1 - life
    ctx.fillStyle = pal.isEink ? pal.text : BUBBLE_HEX[p.color][0]
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // Flying bubble with a short fading trail
  if (v.shot) {
    fx.trail.push({ x: v.shot.x, y: v.shot.y })
    if (fx.trail.length > 6) fx.trail.shift()
    if (!pal.isEink) {
      fx.trail.forEach((pt, i) => {
        const k = (i + 1) / (fx.trail.length + 1)
        drawBubble(ctx, v.shot!.color, pt.x, pt.y, RADIUS * (0.45 + 0.4 * k), pal, 1, 0.16 * k)
      })
    }
    drawBubble(ctx, v.shot.color, v.shot.x, v.shot.y, RADIUS, pal)
  } else if (fx.trail.length) {
    fx.trail = []
  }

  // Aim guide with marching dashes
  if (v.status === 'aiming' && !v.shot) {
    const points = aimPath(fx.displayAngle)
    ctx.setLineDash([4, 7])
    ctx.lineDashOffset = -now / 45
    ctx.strokeStyle = pal.isEink ? pal.textDim : 'rgba(148, 163, 184, 0.6)'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (const p of points.slice(1)) ctx.lineTo(p.x, p.y)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.lineDashOffset = 0
  }

  // Shooter: base + barrel that follows the aim
  const shooterX = VIRTUAL_WIDTH / 2
  ctx.beginPath()
  ctx.arc(shooterX, SHOOTER_Y + RADIUS + 6, RADIUS * 1.15, Math.PI, 0)
  ctx.fillStyle = pal.surface2
  ctx.fill()
  ctx.strokeStyle = pal.border
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.save()
  ctx.translate(shooterX, SHOOTER_Y)
  ctx.rotate(fx.displayAngle)
  ctx.lineCap = 'round'
  ctx.strokeStyle = pal.border
  ctx.lineWidth = 12
  ctx.beginPath()
  ctx.moveTo(0, 6)
  ctx.lineTo(0, -RADIUS - 6)
  ctx.stroke()
  ctx.strokeStyle = pal.surface2
  ctx.lineWidth = 9
  ctx.beginPath()
  ctx.moveTo(0, 6)
  ctx.lineTo(0, -RADIUS - 6)
  ctx.stroke()
  ctx.restore()

  // Next-bubble preview and the reload slide of the queued bubble into the shooter
  const previewR = RADIUS * 0.62
  const previewX = shooterX + RADIUS * 2.3
  const previewY = SHOOTER_Y + 4
  const reloadT = easeOutCubic((now - fx.reloadStart) / RELOAD_MS)

  ctx.beginPath()
  ctx.arc(previewX, previewY, previewR + 3, 0, Math.PI * 2)
  ctx.fillStyle = pal.surface2
  ctx.fill()
  drawBubble(ctx, v.nextColor, previewX, previewY, previewR, pal, reloadT)

  if (!v.shot) {
    const cx = previewX + (shooterX - previewX) * reloadT
    const cy = previewY + (SHOOTER_Y - previewY) * reloadT
    const r = previewR + (RADIUS - previewR) * reloadT
    drawBubble(ctx, v.currentColor, cx, cy, r, pal)
  }

  // Pips: shots left until the next row drops (pulse red on the last one)
  const pipY = SHOOTER_Y + 24
  for (let i = 0; i < v.shotsPerNewRow; i++) {
    const filled = i < v.shotsUntilNewRow
    const warn = v.shotsUntilNewRow === 1 && filled
    ctx.beginPath()
    ctx.arc(14 + i * 11, pipY, warn ? 3.4 + Math.sin(now / 120) * 0.8 : 3, 0, Math.PI * 2)
    if (filled) {
      ctx.fillStyle = pal.isEink ? pal.text : warn ? '#ef4444' : pal.textDim
      ctx.fill()
    } else {
      ctx.strokeStyle = pal.border
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }

  // Floating score text
  fx.texts = fx.texts.filter((t) => now - t.start < TEXT_MS)
  for (const t of fx.texts) {
    const k = (now - t.start) / TEXT_MS
    if (k < 0) continue
    ctx.globalAlpha = 1 - k * k
    ctx.font = '700 17px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.lineWidth = 3
    ctx.strokeStyle = pal.isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.85)'
    const ty = t.y - 34 * easeOutCubic(k)
    ctx.strokeText(t.text, t.x, ty)
    ctx.fillStyle = pal.isEink ? pal.text : '#fbbf24'
    ctx.fillText(t.text, t.x, ty)
    ctx.globalAlpha = 1
  }
}

function fallY(f: Fall, now: number): number {
  const t = (now - f.start) / 1000
  return f.y + f.vy * t + 0.5 * FALL_GRAVITY * t * t
}

export const BubbleShooterCanvas = memo(function BubbleShooterCanvas({
  viewRef,
  isEink = false,
  theme = 'dark',
  onAim,
  onShoot,
}: BubbleShooterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const optionsRef = useRef({ isEink, theme })
  optionsRef.current = { isEink, theme }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const fx = createEffects()
    let palette: Palette | null = null
    let frame = 0
    let raf = 0

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1
      const width = canvas.clientWidth || VIRTUAL_WIDTH
      const height = canvas.clientHeight || VIRTUAL_HEIGHT
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr)
        canvas.height = Math.round(height * dpr)
      }
      if (!palette || frame++ % 30 === 0) {
        palette = readPalette(canvas, optionsRef.current.isEink, optionsRef.current.theme)
      }

      const v = viewRef.current
      if (v.event && v.event.seq !== fx.lastSeq) {
        fx.lastSeq = v.event.seq
        handleEvent(fx, v.event, now)
        if (v.event.kind === 'reset') fx.displayAngle = v.aimAngle
      }

      // Uniform scale, centred: keeps bubbles round on any screen shape.
      const scale = Math.min(canvas.width / VIRTUAL_WIDTH, canvas.height / VIRTUAL_HEIGHT)
      const offsetX = (canvas.width - VIRTUAL_WIDTH * scale) / 2
      const offsetY = (canvas.height - VIRTUAL_HEIGHT * scale) / 2
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY)
      ctx.beginPath()
      ctx.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT)
      ctx.clip()
      render(ctx, v, fx, palette, now)
      ctx.restore()
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [viewRef])

  const toVirtual = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = (canvasRef.current ?? e.currentTarget).getBoundingClientRect()
    const scale = Math.min(rect.width / VIRTUAL_WIDTH, rect.height / VIRTUAL_HEIGHT)
    const offsetX = (rect.width - VIRTUAL_WIDTH * scale) / 2
    const offsetY = (rect.height - VIRTUAL_HEIGHT * scale) / 2
    return {
      x: (e.clientX - rect.left - offsetX) / scale,
      y: (e.clientY - rect.top - offsetY) / scale,
    }
  }

  return (
    <div
      className="bs-canvas-container"
      role="button"
      tabIndex={0}
      aria-label="Bubble Shooter Game Canvas"
      onPointerMove={(e) => {
        const p = toVirtual(e)
        onAim(p.x, p.y)
      }}
      onPointerDown={(e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return
        e.preventDefault()
        const p = toVirtual(e)
        onAim(p.x, p.y)
        // Mouse click fires. Touch/pen only aim: firing is the Fire button's job, so a stray tap never shoots.
        if (e.pointerType === 'mouse') onShoot(aimAngleFromPoint(p.x, p.y))
        else e.currentTarget.setPointerCapture(e.pointerId)
      }}
    >
      <div className="bs-canvas-wrapper">
        <canvas ref={canvasRef} className="bs-canvas" />
      </div>
    </div>
  )
})
