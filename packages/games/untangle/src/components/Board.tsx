import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { onKeyActivate } from '@allgames/ui'
import type { LayoutSpec, Point, Rope, RopeEnd } from '../types'
import type { UntangleTranslations } from '../i18n'
import { BOARD_SIZE, pegRadius, ringRadii, slotSpacing } from '../logic/layouts'
import { distance, distanceToSegment } from '../logic/geometry'
import { emptySlots } from '../logic/engine'
import { ropeColor, ropeDash } from './palette'

interface BoardProps {
  layout: LayoutSpec
  slots: Point[]
  ropes: Rope[]
  /** Rope-to-peg clearance (board units): a held rope end stops before a rope would come closer to a peg. */
  clearance: number
  /** Whether the rope end may be put in that hole (it must be empty and no rope may run through a peg). */
  canMove: (ropeId: number, end: RopeEnd, slot: number) => boolean
  /** Whether the rope end can be picked up (it is not buried under another rope). */
  canGrab: (ropeId: number, end: RopeEnd) => boolean
  onMove: (ropeId: number, end: RopeEnd, slot: number) => boolean
  t: UntangleTranslations
  disabled?: boolean
  /** The level is solved: the board celebrates. */
  won?: boolean
  isEink?: boolean
}

interface DragState {
  ropeId: number
  end: RopeEnd
  pointerId: number
  /** Where the pointer went down. */
  start: Point
  /** Where the rope end is held (follows the pointer, but never goes through another rope's peg). */
  point: Point
  moved: boolean
}

interface Selection {
  ropeId: number
  end: RopeEnd
}

/** How far (board units) a press has to travel before it counts as a drag instead of a tap. */
const DRAG_THRESHOLD = 1.5

/** The shared `onKeyActivate` (Enter / Space) is typed for HTML elements; the board's focusable parts are SVG groups. */
const svgKeyActivate = (handler: () => void) =>
  onKeyActivate(handler) as unknown as React.KeyboardEventHandler<SVGGElement>

/** How long a rope end glides into its new hole. */
const SETTLE_MS = 190

const easeOutBack = (t: number) => {
  const c1 = 1.4
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

/** Motion is skipped on e-ink screens, with reduced-motion on, and wherever matchMedia is missing (tests). */
function canAnimate(isEink: boolean): boolean {
  if (isEink || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  if (typeof requestAnimationFrame !== 'function') return false
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const clamp = (v: number) => Math.max(0, Math.min(BOARD_SIZE, v))

export const Board = memo(function Board({
  layout,
  slots,
  ropes,
  clearance,
  canMove,
  canGrab,
  onMove,
  t,
  disabled = false,
  won = false,
  isEink = false,
}: BoardProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const suppressClickRef = useRef(false)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [selected, setSelected] = useState<Selection | null>(null)
  const [denied, setDenied] = useState<string | null>(null)
  const deniedTimerRef = useRef<number | null>(null)
  const [, setFrame] = useState(0)
  const slotOfEndRef = useRef<Map<string, number>>(new Map())
  const dropRef = useRef<{ key: string; point: Point } | null>(null)
  const glideRef = useRef<Record<string, { from: Point; start: number }>>({})
  const rafRef = useRef<number | null>(null)

  const pegR = pegRadius(layout)
  const spacing = slotSpacing(layout)
  const hitR = spacing / 2
  const snapR = spacing * 0.6
  const empty = useMemo(() => emptySlots(ropes, slots.length), [ropes, slots.length])

  // Latest geometry for the window-level pointer handlers, which outlive a render.
  const geometryRef = useRef({ slots, ropes, pegR, clearance })
  geometryRef.current = { slots, ropes, pegR, clearance }

  // A new position (move, undo, new level) always starts without a selection.
  useEffect(() => {
    setSelected(null)
  }, [ropes])

  useEffect(
    () => () => {
      cleanupRef.current?.()
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      if (deniedTimerRef.current !== null) window.clearTimeout(deniedTimerRef.current)
    },
    [],
  )

  // When a rope end lands in a new hole (drop, undo, restart) let it glide there from where it was.
  useLayoutEffect(() => {
    const next = new Map<string, number>()
    const started: Record<string, { from: Point; start: number }> = {}
    const animate = canAnimate(isEink)
    for (const rope of ropes) {
      for (const end of ['a', 'b'] as RopeEnd[]) {
        const key = `${rope.id}-${end}`
        const previous = slotOfEndRef.current.get(key)
        next.set(key, rope[end])
        if (animate && previous !== undefined && previous !== rope[end]) {
          const from = dropRef.current?.key === key ? dropRef.current.point : slots[previous]
          started[key] = { from, start: performance.now() }
        }
      }
    }
    slotOfEndRef.current = next
    dropRef.current = null
    if (Object.keys(started).length === 0) return

    glideRef.current = { ...glideRef.current, ...started }
    if (rafRef.current !== null) return
    const tick = () => {
      const now = performance.now()
      const live: typeof glideRef.current = {}
      for (const [key, g] of Object.entries(glideRef.current)) if (now - g.start < SETTLE_MS) live[key] = g
      glideRef.current = live
      setFrame((f) => f + 1)
      rafRef.current = Object.keys(live).length > 0 ? requestAnimationFrame(tick) : null
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [ropes, slots, isEink])

  const toBoardPoint = useCallback((clientX: number, clientY: number): Point => {
    const rect = svgRef.current?.getBoundingClientRect()
    const w = rect && rect.width > 0 ? rect.width : BOARD_SIZE
    const h = rect && rect.height > 0 ? rect.height : BOARD_SIZE
    return { x: ((clientX - (rect?.left ?? 0)) / w) * BOARD_SIZE, y: ((clientY - (rect?.top ?? 0)) / h) * BOARD_SIZE }
  }, [])

  /** The closest hole the held rope end could legally be dropped in, if one is near enough. */
  const nearestEmpty = useCallback(
    (p: Point, ropeId: number, end: RopeEnd): number | null => {
      let best: number | null = null
      let bestDist = snapR
      for (const s of empty) {
        const d = distance(p, slots[s])
        if (d <= bestDist && canMove(ropeId, end, s)) {
          best = s
          bestDist = d
        }
      }
      return best
    },
    [empty, slots, snapR, canMove],
  )

  /**
   * Moves the held rope end from `previous` towards the pointer, but stops just before the rope would run
   * through another rope's peg (or the held peg would bump into one). Ropes are not an obstacle: crossing
   * them is allowed while playing.
   */
  const constrainHeld = useCallback((previous: Point, raw: Point, ropeId: number, end: RopeEnd): Point => {
    const g = geometryRef.current
    const rope = g.ropes.find((r) => r.id === ropeId)
    if (!rope) return previous
    const fixed = g.slots[end === 'a' ? rope.b : rope.a]
    const obstacles = g.ropes.filter((r) => r.id !== ropeId).flatMap((r) => [g.slots[r.a], g.slots[r.b]])
    const target = { x: clamp(raw.x), y: clamp(raw.y) }
    const free = (q: Point) =>
      obstacles.every((o) => distance(o, q) >= g.pegR * 2 && distanceToSegment(o, fixed, q) >= g.clearance)

    const steps = Math.max(1, Math.ceil(distance(previous, target)))
    let held = previous
    for (let i = 1; i <= steps; i++) {
      const q = {
        x: previous.x + ((target.x - previous.x) * i) / steps,
        y: previous.y + ((target.y - previous.y) * i) / steps,
      }
      if (!free(q)) break
      held = q
    }
    return held
  }, [])

  /** A buried end that is touched shakes briefly, so it is clear why it will not move. */
  const flashDenied = useCallback((ropeId: number, end: RopeEnd) => {
    setDenied(`${ropeId}-${end}`)
    if (deniedTimerRef.current !== null) window.clearTimeout(deniedTimerRef.current)
    deniedTimerRef.current = window.setTimeout(() => {
      deniedTimerRef.current = null
      setDenied(null)
    }, 450)
  }, [])

  const handlePegPointerDown = useCallback(
    (e: React.PointerEvent<SVGGElement>, ropeId: number, end: RopeEnd) => {
      if (disabled || (e.pointerType === 'mouse' && e.button !== 0)) return
      if (!canGrab(ropeId, end)) {
        flashDenied(ropeId, end)
        return
      }
      cleanupRef.current?.()

      const start = toBoardPoint(e.clientX, e.clientY)
      const own = geometryRef.current.ropes.find((r) => r.id === ropeId)
      const origin = own ? geometryRef.current.slots[own[end]] : start
      const state: DragState = { ropeId, end, pointerId: e.pointerId, start, point: origin, moved: false }
      dragRef.current = state
      setDrag(state)

      const onMoveEvent = (ev: PointerEvent) => {
        const d = dragRef.current
        if (!d || ev.pointerId !== d.pointerId) return
        const pointer = toBoardPoint(ev.clientX, ev.clientY)
        const moved = d.moved || distance(pointer, d.start) > DRAG_THRESHOLD
        const point = moved ? constrainHeld(d.point, pointer, d.ropeId, d.end) : d.point
        const next: DragState = { ...d, point, moved }
        dragRef.current = next
        setDrag(next)
      }
      const stop = () => {
        window.removeEventListener('pointermove', onMoveEvent)
        window.removeEventListener('pointerup', onUpEvent)
        window.removeEventListener('pointercancel', onCancelEvent)
        cleanupRef.current = null
      }
      const onUpEvent = (ev: PointerEvent) => {
        const d = dragRef.current
        if (!d || ev.pointerId !== d.pointerId) return
        stop()
        dragRef.current = null
        setDrag(null)
        if (!d.moved) return // a tap: the click handler selects the peg
        // The browser may still send a click to the peg after a drag; ignore it.
        suppressClickRef.current = true
        window.setTimeout(() => {
          suppressClickRef.current = false
        }, 0)
        const target = nearestEmpty(d.point, d.ropeId, d.end)
        if (target !== null) {
          dropRef.current = { key: `${d.ropeId}-${d.end}`, point: d.point }
          onMove(d.ropeId, d.end, target)
          setSelected(null)
        }
      }
      const onCancelEvent = (ev: PointerEvent) => {
        if (dragRef.current && ev.pointerId !== dragRef.current.pointerId) return
        stop()
        dragRef.current = null
        setDrag(null)
      }

      window.addEventListener('pointermove', onMoveEvent)
      window.addEventListener('pointerup', onUpEvent)
      window.addEventListener('pointercancel', onCancelEvent)
      cleanupRef.current = stop
    },
    [disabled, canGrab, flashDenied, toBoardPoint, constrainHeld, nearestEmpty, onMove],
  )

  const toggleSelect = useCallback(
    (ropeId: number, end: RopeEnd) => {
      if (disabled) return
      if (!canGrab(ropeId, end)) {
        flashDenied(ropeId, end)
        return
      }
      setSelected((prev) => (prev && prev.ropeId === ropeId && prev.end === end ? null : { ropeId, end }))
    },
    [disabled, canGrab, flashDenied],
  )

  const handleHole = useCallback(
    (slot: number) => {
      if (disabled || !selected) return
      // A refused move keeps the peg selected so another hole can be tried.
      onMove(selected.ropeId, selected.end, slot)
    },
    [disabled, selected, onMove],
  )

  const dragTarget = drag && drag.moved ? nearestEmpty(drag.point, drag.ropeId, drag.end) : null
  const draggedPoint = (ropeId: number, end: RopeEnd): Point | null =>
    drag && drag.moved && drag.ropeId === ropeId && drag.end === end ? drag.point : null
  const endPoint = (rope: Rope, end: RopeEnd): Point => {
    const dragged = draggedPoint(rope.id, end)
    if (dragged) return dragged
    const target = slots[rope[end]]
    const glide = glideRef.current[`${rope.id}-${end}`]
    if (!glide) return target
    const t = Math.min(1, Math.max(0, (performance.now() - glide.start) / SETTLE_MS))
    const k = easeOutBack(t)
    return { x: glide.from.x + (target.x - glide.from.x) * k, y: glide.from.y + (target.y - glide.from.y) * k }
  }

  const rails = ringRadii(layout)
  const ringWidth = pegR * 2 + 6

  return (
    <div className="ut-board-container">
      <div
        className={`ut-board ${won ? 'ut-board--won' : ''} ${drag?.moved ? 'ut-board--dragging' : ''}`}
        data-layout={layout.kind}
        style={drag?.moved ? ({ ['--ut-drag' as string]: ropeColor(drag.ropeId) } as CSSProperties) : undefined}
      >
        <svg
          ref={svgRef}
          className={`ut-svg ${disabled ? 'ut-svg--locked' : ''}`}
          viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
          role="group"
          aria-label={t.boardLabel}
        >
          {rails.map((radius) => (
            <g className="ut-ring" aria-hidden="true" key={`rail-${radius}`}>
              <circle
                cx={BOARD_SIZE / 2}
                cy={BOARD_SIZE / 2}
                r={radius}
                strokeWidth={ringWidth}
                className="ut-ring-body"
              />
              <circle cx={BOARD_SIZE / 2} cy={BOARD_SIZE / 2} r={radius + ringWidth / 2} className="ut-ring-edge" />
              <circle cx={BOARD_SIZE / 2} cy={BOARD_SIZE / 2} r={radius - ringWidth / 2} className="ut-ring-edge" />
            </g>
          ))}

          {/* Holes: occupied ones are just decoration, empty ones are drop targets */}
          {slots.map((p, i) => {
            const isEmpty = empty.includes(i)
            if (!isEmpty) {
              return <circle key={`hole-${i}`} className="ut-hole ut-hole--used" cx={p.x} cy={p.y} r={pegR + 0.8} />
            }
            const isTarget = dragTarget === i
            // While a rope end is held or selected, holes it could not go to are dimmed.
            const holder = drag?.moved ? drag : selected
            const isBlocked = !!holder && !canMove(holder.ropeId, holder.end, i)
            return (
              <g
                key={`hole-${i}`}
                className={`ut-slot ${selected ? 'ut-slot--armed' : ''} ${isTarget ? 'ut-slot--target' : ''} ${
                  isBlocked ? 'ut-slot--blocked' : ''
                }`}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label={t.holeLabel(i + 1)}
                aria-disabled={disabled || !selected}
                data-slot={i}
                onClick={() => handleHole(i)}
                onKeyDown={svgKeyActivate(() => handleHole(i))}
              >
                <circle className="ut-hole-hit" cx={p.x} cy={p.y} r={hitR} />
                <circle className="ut-hole" cx={p.x} cy={p.y} r={pegR + 0.8} />
                <circle className="ut-hole-mark" cx={p.x} cy={p.y} r={pegR * 0.35} />
              </g>
            )
          })}

          {/* Ropes */}
          {[...ropes]
            .sort(
              (x, y) => Number(x.id === drag?.ropeId && !!drag.moved) - Number(y.id === drag?.ropeId && !!drag.moved),
            )
            .map((rope) => {
              const a = endPoint(rope, 'a')
              const b = endPoint(rope, 'b')
              const style = { ['--ut-rope' as string]: ropeColor(rope.id) } as CSSProperties
              const line = { x1: a.x, y1: a.y, x2: b.x, y2: b.y }
              return (
                <g key={`rope-${rope.id}`} className="ut-rope" style={style} data-rope={rope.id} aria-hidden="true">
                  <line className="ut-rope-shadow" {...line} />
                  <line className="ut-rope-edge" {...line} />
                  <line className="ut-rope-body" {...line} />
                  <line className="ut-rope-twist" {...line} strokeDasharray={isEink ? ropeDash(rope.id) : '1.4 2.4'} />
                  <line className="ut-rope-shine" {...line} />
                </g>
              )
            })}

          {/* Pegs on every rope end (these are what the player grabs) */}
          {ropes.flatMap((rope, ropeIndex) =>
            (['a', 'b'] as RopeEnd[]).map((end, endIndex) => {
              const p = endPoint(rope, end)
              const isSelected = selected?.ropeId === rope.id && selected.end === end
              const isDragging = drag?.moved && drag.ropeId === rope.id && drag.end === end
              const isLocked = !disabled && !canGrab(rope.id, end)
              const isDenied = denied === `${rope.id}-${end}`
              const style = {
                ['--ut-rope' as string]: ropeColor(rope.id),
                ['--i' as string]: ropeIndex * 2 + endIndex,
              } as CSSProperties
              return (
                <g
                  key={`peg-${rope.id}-${end}`}
                  className={`ut-peg ${isSelected ? 'ut-peg--selected' : ''} ${isDragging ? 'ut-peg--dragging' : ''} ${
                    isLocked ? 'ut-peg--locked' : ''
                  } ${isDenied ? 'ut-peg--denied' : ''}`}
                  style={style}
                  transform={`translate(${p.x} ${p.y})`}
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  aria-label={t.pegLabel(rope.id + 1, isSelected, isLocked)}
                  aria-disabled={isLocked}
                  aria-pressed={isSelected}
                  data-rope={rope.id}
                  data-end={end}
                  data-slot={rope[end]}
                  onPointerDown={(e) => handlePegPointerDown(e, rope.id, end)}
                  onClick={() => {
                    if (suppressClickRef.current) return
                    toggleSelect(rope.id, end)
                  }}
                  onKeyDown={svgKeyActivate(() => toggleSelect(rope.id, end))}
                >
                  <circle className="ut-peg-hit" r={hitR} />
                  <g className="ut-peg-inner">
                    {isSelected && <circle className="ut-peg-ring" r={pegR + 1.8} />}
                    <circle className="ut-peg-body" r={pegR} />
                    <circle className="ut-peg-cap" r={pegR * 0.62} />
                    <ellipse
                      className="ut-peg-gloss"
                      cx={-pegR * 0.3}
                      cy={-pegR * 0.38}
                      rx={pegR * 0.42}
                      ry={pegR * 0.24}
                      transform="rotate(-35)"
                    />
                    {isEink && (
                      <text className="ut-peg-number" y={pegR * 0.38} fontSize={pegR * 1.15} textAnchor="middle">
                        {rope.id + 1}
                      </text>
                    )}
                  </g>
                </g>
              )
            }),
          )}
        </svg>
      </div>
    </div>
  )
})
