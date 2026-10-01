import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { findCombineTarget, toWorkspacePoint } from '../geometry'
import type { ElementId, WorkItem } from '../types'

/** Touch: how long to hold an element in the list before it starts to drag (so the list can still scroll). */
const HOLD_MS = 150
/** Mouse: how far (px) the pointer must move before a press turns into a drag. */
const MOUSE_SLOP = 4
/** Touch: moving farther than this before the hold is over means the person is scrolling the list. */
const TOUCH_SCROLL_SLOP = 10

export interface ListDrag {
  id: ElementId
  /** Pointer position in viewport coordinates, where the floating card is drawn. */
  x: number
  y: number
  /** The pointer is over the table, so releasing here puts the element on it. */
  overWorkspace: boolean
  /** The card on the table the element would be mixed with if released now. */
  targetUid: number | null
}

interface Options {
  workspaceRef: RefObject<HTMLElement>
  getItems: () => WorkItem[]
  /** Called with the top-left corner (relative to the workspace) where the element was released. */
  onDrop: (id: ElementId, x: number, y: number) => void
}

interface Pending {
  id: ElementId
  pointerId: number
  startX: number
  startY: number
  x: number
  y: number
  active: boolean
  timer: ReturnType<typeof setTimeout> | null
}

/**
 * Drag an element out of the list and onto the table.
 * A mouse press becomes a drag after a few pixels of movement; a touch becomes a drag after a short hold,
 * and moving the finger before that just scrolls the list as usual.
 */
export function useListDrag({ workspaceRef, getItems, onDrop }: Options) {
  const [drag, setDrag] = useState<ListDrag | null>(null)
  const pending = useRef<Pending | null>(null)
  const listeners = useRef<{
    move: (e: PointerEvent) => void
    up: (e: PointerEvent) => void
    cancel: (e: PointerEvent) => void
  } | null>(null)
  const justDragged = useRef(false)

  const onDropRef = useRef(onDrop)
  const getItemsRef = useRef(getItems)
  useEffect(() => {
    onDropRef.current = onDrop
    getItemsRef.current = getItems
  })

  const stop = useCallback(() => {
    const p = pending.current
    if (p?.timer) clearTimeout(p.timer)
    pending.current = null
    const l = listeners.current
    if (l) {
      window.removeEventListener('pointermove', l.move)
      window.removeEventListener('pointerup', l.up)
      window.removeEventListener('pointercancel', l.cancel)
      listeners.current = null
    }
    setDrag(null)
  }, [])

  // Once a drag is active the page must not scroll under the finger. This has to be a non-passive listener
  // registered up front, otherwise iOS ignores preventDefault.
  useEffect(() => {
    const block = (e: TouchEvent) => {
      if (pending.current?.active && e.cancelable) e.preventDefault()
    }
    window.addEventListener('touchmove', block, { passive: false })
    return () => window.removeEventListener('touchmove', block)
  }, [])

  useEffect(() => stop, [stop])

  const snapshot = useCallback(
    (id: ElementId, x: number, y: number): ListDrag => {
      const rect = workspaceRef.current?.getBoundingClientRect()
      if (!rect) return { id, x, y, overWorkspace: false, targetUid: null }
      const point = toWorkspacePoint(rect, x, y)
      const target = point.inside ? findCombineTarget(getItemsRef.current(), point.x, point.y) : null
      return { id, x, y, overWorkspace: point.inside, targetUid: target?.uid ?? null }
    },
    [workspaceRef],
  )

  const begin = useCallback(
    (id: ElementId, e: ReactPointerEvent) => {
      if (pending.current) stop()
      if (e.pointerType === 'mouse' && e.button !== 0) return
      const touch = e.pointerType !== 'mouse'
      const p: Pending = {
        id,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        x: e.clientX,
        y: e.clientY,
        active: false,
        timer: null,
      }
      pending.current = p

      const activate = () => {
        if (pending.current !== p || p.active) return
        p.active = true
        setDrag(snapshot(p.id, p.x, p.y))
      }
      if (touch) p.timer = setTimeout(activate, HOLD_MS)

      const move = (ev: PointerEvent) => {
        if (ev.pointerId !== p.pointerId) return
        p.x = ev.clientX
        p.y = ev.clientY
        if (!p.active) {
          const dist = Math.hypot(p.x - p.startX, p.y - p.startY)
          if (!touch && dist >= MOUSE_SLOP) activate()
          else if (touch && dist >= TOUCH_SCROLL_SLOP) stop()
          return
        }
        setDrag(snapshot(p.id, p.x, p.y))
      }
      const up = (ev: PointerEvent) => {
        if (ev.pointerId !== p.pointerId) return
        if (p.active) {
          // The click that follows a drag must not also add the element.
          justDragged.current = true
          setTimeout(() => {
            justDragged.current = false
          }, 60)
          const rect = workspaceRef.current?.getBoundingClientRect()
          if (rect) {
            const point = toWorkspacePoint(rect, ev.clientX, ev.clientY)
            if (point.inside) onDropRef.current(p.id, point.x, point.y)
          }
        }
        stop()
      }
      const cancel = (ev: PointerEvent) => {
        if (ev.pointerId === p.pointerId) stop()
      }

      listeners.current = { move, up, cancel }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
      window.addEventListener('pointercancel', cancel)
    },
    [stop, snapshot, workspaceRef],
  )

  const wasDragging = useCallback(() => justDragged.current, [])

  return { drag, begin, wasDragging }
}
