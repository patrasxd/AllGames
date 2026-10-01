import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ElementId, WorkItem } from '../types'
import { BASE_IDS } from '../elements'
import { findCombineTarget } from '../geometry'
import { TOTAL_ELEMENTS, combine, getHint, sanitizeDiscovered } from '../logic'

const SAVE_KEY = 'allgames:alchemy:progress'

const TOAST_MS = 2200
const HINT_MS = 7000

function loadProgress(): ElementId[] {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (raw) return sanitizeDiscovered(JSON.parse(raw))
  } catch {
    // ignore
  }
  return [...BASE_IDS]
}

function saveProgress(discovered: ElementId[]) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(discovered))
  } catch {
    // ignore
  }
}

export function useAlchemy() {
  const [discovered, setDiscovered] = useState<ElementId[]>(loadProgress)
  const [items, setItems] = useState<WorkItem[]>([])
  const [selectedUid, setSelectedUid] = useState<number | null>(null)
  const [toast, setToast] = useState<{ id: ElementId; key: number } | null>(null)
  const [hint, setHint] = useState<{ a: ElementId; b: ElementId } | null>(null)
  const [noHint, setNoHint] = useState(false)
  const [mixes, setMixes] = useState(0)

  const uidRef = useRef(1)
  const timers = useRef<Record<'toast' | 'hint', ReturnType<typeof setTimeout> | null>>({
    toast: null,
    hint: null,
  })

  const schedule = useCallback((slot: 'toast' | 'hint', fn: () => void, ms: number) => {
    const current = timers.current[slot]
    if (current) clearTimeout(current)
    timers.current[slot] = setTimeout(fn, ms)
  }, [])

  useEffect(() => {
    const t = timers.current
    return () => {
      Object.values(t).forEach((id) => id && clearTimeout(id))
    }
  }, [])

  useEffect(() => {
    saveProgress(discovered)
  }, [discovered])

  const discoveredSet = useMemo(() => new Set(discovered), [discovered])
  const isComplete = discovered.length >= TOTAL_ELEMENTS

  const clearHint = useCallback(() => {
    setHint(null)
    setNoHint(false)
  }, [])

  /**
   * Mixes two elements. When they react, the cards in `consume` are replaced by the result at (x, y) and
   * true is returned. When they do not react nothing at all happens (no feedback), and false is returned.
   */
  const react = useCallback(
    (aId: ElementId, bId: ElementId, x: number, y: number, consume: number[]): boolean => {
      const resultId = combine(aId, bId)
      if (!resultId) return false

      const newUid = uidRef.current++
      const isNew = !discoveredSet.has(resultId)
      setItems((prev) => [
        ...prev.filter((i) => !consume.includes(i.uid)),
        { uid: newUid, id: resultId, x, y, isNewDiscovery: isNew },
      ])
      setMixes((m) => m + 1)
      clearHint()
      if (isNew) {
        setDiscovered((prev) => (prev.includes(resultId) ? prev : [...prev, resultId]))
        setToast({ id: resultId, key: newUid })
        schedule('toast', () => setToast(null), TOAST_MS)
      }
      return true
    },
    [discoveredSet, clearHint, schedule],
  )

  /** Puts a copy of a discovered element on the table. */
  const addElement = useCallback(
    (id: ElementId, x: number, y: number) => {
      if (!discoveredSet.has(id)) return
      setItems((prev) => [...prev, { uid: uidRef.current++, id, x, y }])
      setSelectedUid(null)
    },
    [discoveredSet],
  )

  /**
   * An element dragged out of the list and released at (x, y) on the table: it is mixed with the card it
   * lands on, or simply placed there when there is none or the two do not react.
   */
  const dropNewElement = useCallback(
    (id: ElementId, x: number, y: number) => {
      if (!discoveredSet.has(id)) return
      setSelectedUid(null)
      const target = findCombineTarget(items, x, y)
      if (target && react(id, target.id, (x + target.x) / 2, (y + target.y) / 2, [target.uid])) return
      setItems((prev) => [...prev, { uid: uidRef.current++, id, x, y }])
    },
    [discoveredSet, items, react],
  )

  const moveItem = useCallback((uid: number, x: number, y: number) => {
    setItems((prev) => prev.map((i) => (i.uid === uid ? { ...i, x, y } : i)))
  }, [])

  const removeItem = useCallback((uid: number) => {
    setItems((prev) => prev.filter((i) => i.uid !== uid))
    setSelectedUid((s) => (s === uid ? null : s))
  }, [])

  /**
   * Called when a card on the table is released (or when two cards are chosen by tapping).
   * `targetUid` is the card it was dropped on, `overTrash` is true when it was released over the element list.
   */
  const dropItem = useCallback(
    (uid: number, targetUid: number | null, overTrash = false) => {
      const item = items.find((i) => i.uid === uid)
      if (!item) return
      if (overTrash) {
        removeItem(uid)
        return
      }
      if (targetUid === null) return
      const target = items.find((i) => i.uid === targetUid)
      if (!target) return

      setSelectedUid(null)
      react(item.id, target.id, (item.x + target.x) / 2, (item.y + target.y) / 2, [uid, targetUid])
    },
    [items, react, removeItem],
  )

  /** Tap-to-combine: the first tap selects a card, the second tap on another card combines the two. */
  const tapItem = useCallback(
    (uid: number) => {
      if (selectedUid === null) setSelectedUid(uid)
      else if (selectedUid === uid) setSelectedUid(null)
      else dropItem(selectedUid, uid)
    },
    [selectedUid, dropItem],
  )

  const clearWorkspace = useCallback(() => {
    setItems([])
    setSelectedUid(null)
  }, [])

  const showHint = useCallback(() => {
    const h = getHint(discovered)
    setHint(h)
    setNoHint(h === null)
    schedule('hint', clearHint, HINT_MS)
  }, [discovered, schedule, clearHint])

  const resetProgress = useCallback(() => {
    setDiscovered([...BASE_IDS])
    setItems([])
    setSelectedUid(null)
    setToast(null)
    clearHint()
    setMixes(0)
  }, [clearHint])

  return {
    discovered,
    items,
    selectedUid,
    toast,
    hint,
    noHint,
    mixes,
    isComplete,
    total: TOTAL_ELEMENTS,
    addElement,
    dropNewElement,
    moveItem,
    removeItem,
    dropItem,
    tapItem,
    clearWorkspace,
    showHint,
    resetProgress,
  }
}
