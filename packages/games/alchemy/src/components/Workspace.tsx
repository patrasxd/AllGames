import { useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from 'react'
import type { Feedback, Locale, WorkItem } from '../types'
import { elementEmoji, elementName } from '../logic'
import { ITEM_SIZE, clamp, findCombineTarget } from '../geometry'

/** Movement below this (px) counts as a tap, not a drag. */
const TAP_SLOP = 5

interface WorkspaceProps {
  items: WorkItem[]
  locale: Locale
  workspaceRef: RefObject<HTMLDivElement>
  /** Element list; releasing an item over it throws the item away. */
  trashRef: RefObject<HTMLElement>
  selectedUid: number | null
  feedback: Feedback | null
  /** An element being dragged in from the list is over the table. */
  dropActive?: boolean
  /** The card an element dragged in from the list would be mixed with. */
  highlightUid?: number | null
  emptyText: string
  label: string
  onMove: (uid: number, x: number, y: number) => void
  onDrop: (uid: number, targetUid: number | null, overTrash: boolean) => void
  onTap: (uid: number) => void
  onRemove: (uid: number) => void
  onTrashHover: (active: boolean) => void
}

export function Workspace({
  items,
  locale,
  workspaceRef,
  trashRef,
  selectedUid,
  feedback,
  dropActive = false,
  highlightUid = null,
  emptyText,
  label,
  onMove,
  onDrop,
  onTap,
  onRemove,
  onTrashHover,
}: WorkspaceProps) {
  const drag = useRef<{
    uid: number
    offX: number
    offY: number
    startX: number
    startY: number
    x: number
    y: number
    moved: boolean
  } | null>(null)
  const [draggingUid, setDraggingUid] = useState<number | null>(null)
  const [hoverUid, setHoverUid] = useState<number | null>(null)

  const findTarget = (uid: number, x: number, y: number): WorkItem | null => findCombineTarget(items, x, y, uid)

  const isOverTrash = (clientX: number, clientY: number): boolean => {
    const rect = trashRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return false
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
  }

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>, item: WorkItem) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const ws = workspaceRef.current
    if (!ws) return
    const rect = ws.getBoundingClientRect()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    drag.current = {
      uid: item.uid,
      offX: e.clientX - rect.left - item.x,
      offY: e.clientY - rect.top - item.y,
      startX: e.clientX,
      startY: e.clientY,
      x: item.x,
      y: item.y,
      moved: false,
    }
    setDraggingUid(item.uid)
  }

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    const ws = workspaceRef.current
    if (!d || !ws) return
    if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < TAP_SLOP) return
    d.moved = true
    const rect = ws.getBoundingClientRect()
    d.x = clamp(e.clientX - rect.left - d.offX, 0, Math.max(0, rect.width - ITEM_SIZE))
    d.y = clamp(e.clientY - rect.top - d.offY, 0, Math.max(0, rect.height - ITEM_SIZE))
    onMove(d.uid, d.x, d.y)
    setHoverUid(findTarget(d.uid, d.x, d.y)?.uid ?? null)
    onTrashHover(isOverTrash(e.clientX, e.clientY))
  }

  const finishDrag = (e: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const d = drag.current
    if (!d) return
    drag.current = null
    setDraggingUid(null)
    setHoverUid(null)
    onTrashHover(false)
    if (cancelled) return
    if (!d.moved) {
      onTap(d.uid)
      return
    }
    onDrop(d.uid, findTarget(d.uid, d.x, d.y)?.uid ?? null, isOverTrash(e.clientX, e.clientY))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, item: WorkItem) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onTap(item.uid)
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      onRemove(item.uid)
    }
  }

  return (
    <div
      ref={workspaceRef}
      className={`al-workspace ${dropActive ? 'al-workspace--drop' : ''}`}
      role="group"
      aria-label={label}
    >
      {items.length === 0 && <p className="al-workspace-empty">{emptyText}</p>}
      {items.map((item) => {
        const name = elementName(item.id, locale)
        const isNew = feedback?.uids.includes(item.uid) ?? false
        const classes = [
          'al-item',
          draggingUid === item.uid ? 'al-item--dragging' : '',
          hoverUid === item.uid || highlightUid === item.uid ? 'al-item--hover' : '',
          selectedUid === item.uid ? 'al-item--selected' : '',
          isNew ? 'al-item--new' : '',
        ]
          .filter(Boolean)
          .join(' ')
        return (
          <div
            key={item.uid}
            className={classes}
            style={{ transform: `translate(${item.x}px, ${item.y}px)`, width: ITEM_SIZE, height: ITEM_SIZE }}
            role="button"
            tabIndex={0}
            aria-label={name}
            aria-pressed={selectedUid === item.uid}
            onPointerDown={(e) => handlePointerDown(e, item)}
            onPointerMove={handlePointerMove}
            onPointerUp={(e) => finishDrag(e, false)}
            onPointerCancel={(e) => finishDrag(e, true)}
            onDoubleClick={() => onRemove(item.uid)}
            onKeyDown={(e) => handleKeyDown(e, item)}
          >
            <div className="al-item-card">
              <span className="al-item-emoji" aria-hidden="true">
                {elementEmoji(item.id)}
              </span>
              <span className="al-item-name">{name}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
