import { useEffect, useRef, memo } from 'react'
import type { Bird, Pipe, Particle, GameStatus, GameTheme } from '../types'
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, FLOOR_HEIGHT } from '../logic/engine'

interface WingRushCanvasProps {
  bird: Bird
  pipes: Pipe[]
  particles: Particle[]
  score: number
  gameStatus: GameStatus
  isEink?: boolean
  theme?: GameTheme
  onFlap: () => void
}

export const WingRushCanvas = memo(function WingRushCanvas({
  bird,
  pipes,
  particles,
  score,
  gameStatus,
  isEink = false,
  theme = 'dark',
  onFlap,
}: WingRushCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const lastPointerRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set HiDPI scale
    const dpr = window.devicePixelRatio || 1
    const width = canvas.clientWidth || VIRTUAL_WIDTH
    const height = canvas.clientHeight || VIRTUAL_HEIGHT

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr
      canvas.height = height * dpr
    }

    ctx.save()
    ctx.scale((width * dpr) / VIRTUAL_WIDTH, (height * dpr) / VIRTUAL_HEIGHT)

    const computed = window.getComputedStyle(canvas)
    const isEinkMode =
      isEink ||
      theme === 'e-ink-dark' ||
      theme === 'e-ink-light' ||
      computed.getPropertyValue('--all-duration-fast').trim() === '0ms'
    const isDark =
      theme === 'dark' ||
      theme === 'e-ink-dark' ||
      (document.documentElement.getAttribute('data-theme') || '').includes('dark')

    // Semantic tokens read directly from the CSS token table
    const bgFill = computed.getPropertyValue('--all-bg').trim() || (isDark ? '#090d14' : '#f5f4ef')
    const pipeFill = computed.getPropertyValue('--all-surface-2').trim() || (isDark ? '#151c28' : '#e2e8f0')
    const pipeStroke = computed.getPropertyValue('--all-border-2').trim() || (isDark ? '#334155' : '#94a3b8')
    const pipeTrim = computed.getPropertyValue('--all-border').trim() || (isDark ? '#475569' : '#cbd5e1')
    const floorFill = computed.getPropertyValue('--all-surface').trim() || (isDark ? '#0f172a' : '#eae8e1')
    const floorStroke = computed.getPropertyValue('--all-border-2').trim() || (isDark ? '#1e293b' : '#dcd8cf')
    const birdBody = computed.getPropertyValue('--all-text').trim() || (isDark ? '#f8fafc' : '#1e293b')
    const birdWing = computed.getPropertyValue('--all-text-dim').trim() || (isDark ? '#cbd5e1' : '#475569')
    const birdBeak = isEinkMode ? birdBody : '#f59e0b'
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)'

    // 1. Clear canvas transparently so page background flows through seamlessly
    ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT)

    // 2. Subtle architectural background grid
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 1
    for (let x = 0; x < VIRTUAL_WIDTH; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, VIRTUAL_HEIGHT - FLOOR_HEIGHT)
      ctx.stroke()
    }
    for (let y = 0; y < VIRTUAL_HEIGHT - FLOOR_HEIGHT; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(VIRTUAL_WIDTH, y)
      ctx.stroke()
    }

    // 4. Draw Particles (flap vapor)
    if (!isEink) {
      for (const p of particles) {
        ctx.fillStyle = `rgba(148, 163, 184, ${p.alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // 5. Draw Pipes / Architectural Pillars
    for (const pipe of pipes) {
      // Top Pillar
      ctx.fillStyle = pipeFill
      ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight)
      ctx.strokeStyle = pipeStroke
      ctx.lineWidth = 2
      ctx.strokeRect(pipe.x, -2, pipe.width, pipe.topHeight + 2)

      // Top Pillar Cap
      const capH = 16
      const capMargin = 3
      ctx.fillStyle = pipeTrim
      ctx.fillRect(pipe.x - capMargin, pipe.topHeight - capH, pipe.width + capMargin * 2, capH)
      ctx.strokeStyle = pipeStroke
      ctx.lineWidth = 1.5
      ctx.strokeRect(pipe.x - capMargin, pipe.topHeight - capH, pipe.width + capMargin * 2, capH)

      // Bottom Pillar
      const bottomH = VIRTUAL_HEIGHT - FLOOR_HEIGHT - pipe.bottomY
      ctx.fillStyle = pipeFill
      ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, bottomH)
      ctx.strokeStyle = pipeStroke
      ctx.lineWidth = 2
      ctx.strokeRect(pipe.x, pipe.bottomY, pipe.width, bottomH + 2)

      // Bottom Pillar Cap
      ctx.fillStyle = pipeTrim
      ctx.fillRect(pipe.x - capMargin, pipe.bottomY, pipe.width + capMargin * 2, capH)
      ctx.strokeStyle = pipeStroke
      ctx.lineWidth = 1.5
      ctx.strokeRect(pipe.x - capMargin, pipe.bottomY, pipe.width + capMargin * 2, capH)
    }

    // 6. Draw Floor
    ctx.fillStyle = floorFill
    ctx.fillRect(0, VIRTUAL_HEIGHT - FLOOR_HEIGHT, VIRTUAL_WIDTH, FLOOR_HEIGHT)
    ctx.strokeStyle = floorStroke
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, VIRTUAL_HEIGHT - FLOOR_HEIGHT)
    ctx.lineTo(VIRTUAL_WIDTH, VIRTUAL_HEIGHT - FLOOR_HEIGHT)
    ctx.stroke()

    // Floor subtle depth dashes
    ctx.strokeStyle = isEink ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let x = 10; x < VIRTUAL_WIDTH; x += 30) {
      ctx.moveTo(x, VIRTUAL_HEIGHT - FLOOR_HEIGHT + 8)
      ctx.lineTo(x + 12, VIRTUAL_HEIGHT - FLOOR_HEIGHT + 24)
    }
    ctx.stroke()

    // 7. Draw Minimalist Bird
    ctx.save()
    ctx.translate(bird.x, bird.y)
    ctx.rotate(bird.angle)

    // Body (smooth faceted droplet / capsule)
    ctx.fillStyle = birdBody
    ctx.beginPath()
    ctx.ellipse(0, 0, bird.radius * 1.15, bird.radius * 0.9, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = isEink ? '#000000' : 'rgba(0,0,0,0.2)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Beak
    ctx.fillStyle = birdBeak
    ctx.beginPath()
    ctx.moveTo(bird.radius * 0.8, -bird.radius * 0.25)
    ctx.lineTo(bird.radius * 1.55, 0)
    ctx.lineTo(bird.radius * 0.8, bird.radius * 0.3)
    ctx.closePath()
    ctx.fill()

    // Eye
    ctx.fillStyle = isEink ? '#ffffff' : '#0f172a'
    ctx.beginPath()
    ctx.arc(bird.radius * 0.45, -bird.radius * 0.35, 2.5, 0, Math.PI * 2)
    ctx.fill()

    // Wing with sine wave flap
    const wingFlap = Math.sin(bird.wingPhase) * 6
    ctx.fillStyle = birdWing
    ctx.beginPath()
    ctx.ellipse(
      -bird.radius * 0.3,
      0,
      bird.radius * 0.65,
      bird.radius * 0.45 + wingFlap * 0.3,
      -Math.PI / 8,
      0,
      Math.PI * 2,
    )
    ctx.fill()
    ctx.strokeStyle = isEink ? '#000000' : 'rgba(0,0,0,0.1)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.restore()

    // 8. Live Current Score at Top Center (Clean balanced 24px)
    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const scoreStr = score.toString()
    ctx.font = '800 24px Inter, system-ui, -apple-system, sans-serif'

    if (isEinkMode) {
      ctx.fillStyle = birdBody
      ctx.fillText(scoreStr, VIRTUAL_WIDTH / 2, 20)
    } else {
      ctx.strokeStyle = bgFill
      ctx.lineWidth = 4
      ctx.lineJoin = 'round'
      ctx.strokeText(scoreStr, VIRTUAL_WIDTH / 2, 20)
      ctx.fillStyle = birdBody
      ctx.fillText(scoreStr, VIRTUAL_WIDTH / 2, 20)
    }
    ctx.restore()

    ctx.restore()
  }, [bird, pipes, particles, score, gameStatus, isEink, theme])

  return (
    <div
      className="wr-canvas-container"
      onPointerDown={(e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return

        const now = Date.now()
        if (now - lastPointerRef.current < 120) return

        lastPointerRef.current = now
        e.preventDefault()
        onFlap()
      }}
      role="button"
      tabIndex={0}
      aria-label="Wing Rush Game Canvas"
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'Enter') {
          e.preventDefault()
          onFlap()
        }
      }}
    >
      <div className="wr-canvas-wrapper">
        <canvas ref={canvasRef} className="wr-canvas" />
      </div>
    </div>
  )
})
