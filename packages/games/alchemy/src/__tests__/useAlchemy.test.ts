import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAlchemy } from '../hooks/useAlchemy'

const SAVE_KEY = 'allgames:alchemy:progress'

function setup() {
  const hook = renderHook(() => useAlchemy())
  const add = (id: string, x: number, y: number) => act(() => hook.result.current.addElement(id, x, y))
  return { hook, add }
}

describe('useAlchemy', () => {
  beforeEach(() => localStorage.clear())

  it('starts with the four basics and an empty table', () => {
    const { hook } = setup()
    expect(hook.result.current.discovered).toEqual(['water', 'fire', 'earth', 'air'])
    expect(hook.result.current.items).toEqual([])
  })

  it('ignores elements that are not discovered yet', () => {
    const { hook, add } = setup()
    add('steam', 0, 0)
    expect(hook.result.current.items).toHaveLength(0)
  })

  it('combining two items replaces them with the result and records the discovery', () => {
    const { hook, add } = setup()
    add('water', 0, 0)
    add('fire', 40, 20)
    const [a, b] = hook.result.current.items
    act(() => hook.result.current.dropItem(a.uid, b.uid))

    expect(hook.result.current.items).toHaveLength(1)
    expect(hook.result.current.items[0].id).toBe('steam')
    expect(hook.result.current.items[0].x).toBe(20)
    expect(hook.result.current.discovered).toContain('steam')
    expect(hook.result.current.mixes).toBe(1)
    expect(hook.result.current.toast?.id).toBe('steam')
    expect(JSON.parse(localStorage.getItem(SAVE_KEY)!)).toContain('steam')
  })

  it('a combination that does not react changes nothing and shows no feedback', () => {
    const { hook, add } = setup()
    add('fire', 0, 0)
    add('fire', 30, 0)
    const [a, b] = hook.result.current.items
    act(() => hook.result.current.dropItem(a.uid, b.uid))

    expect(hook.result.current.items).toHaveLength(2)
    expect(hook.result.current.feedback).toBeNull()
    expect(hook.result.current.toast).toBeNull()
    expect(hook.result.current.mixes).toBe(0)
  })

  it('making an already known element is not a new discovery', () => {
    const { hook, add } = setup()
    for (let round = 0; round < 2; round++) {
      add('water', 0, 0)
      add('fire', 10, 10)
      const items = hook.result.current.items
      const [a, b] = items.slice(-2)
      act(() => hook.result.current.dropItem(a.uid, b.uid))
    }
    expect(hook.result.current.discovered.filter((id) => id === 'steam')).toHaveLength(1)
    // Only a brand new discovery gets the celebration; making a known element just replaces the two cards.
    const latest = hook.result.current.items[hook.result.current.items.length - 1]
    expect(hook.result.current.feedback?.uids ?? []).not.toContain(latest.uid)
  })

  it('tap-to-combine selects the first item and combines on the second tap', () => {
    const { hook, add } = setup()
    add('earth', 0, 0)
    add('earth', 10, 0)
    const [a, b] = hook.result.current.items
    act(() => hook.result.current.tapItem(a.uid))
    expect(hook.result.current.selectedUid).toBe(a.uid)
    act(() => hook.result.current.tapItem(b.uid))
    expect(hook.result.current.items.map((i) => i.id)).toEqual(['mountain'])
    expect(hook.result.current.selectedUid).toBeNull()
  })

  it('releasing an item over the element list removes it', () => {
    const { hook, add } = setup()
    add('water', 0, 0)
    const [a] = hook.result.current.items
    act(() => hook.result.current.dropItem(a.uid, null, true))
    expect(hook.result.current.items).toHaveLength(0)
  })

  it('restores saved progress and can reset it', () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(['water', 'fire', 'earth', 'air', 'steam', 'mud']))
    const { hook } = setup()
    expect(hook.result.current.discovered).toContain('mud')

    act(() => hook.result.current.resetProgress())
    expect(hook.result.current.discovered).toEqual(['water', 'fire', 'earth', 'air'])
  })

  it('shows a hint made of discovered elements', () => {
    const { hook } = setup()
    act(() => hook.result.current.showHint())
    expect(hook.result.current.hint).not.toBeNull()
  })

  describe('dropping an element dragged in from the list', () => {
    it('places it on the table when there is nothing to mix it with', () => {
      const { hook } = setup()
      act(() => hook.result.current.dropNewElement('water', 100, 50))
      expect(hook.result.current.items).toHaveLength(1)
      expect(hook.result.current.items[0]).toMatchObject({ id: 'water', x: 100, y: 50 })
    })

    it('mixes with the card it lands on, replacing that card with the result', () => {
      const { hook, add } = setup()
      add('fire', 100, 100)
      act(() => hook.result.current.dropNewElement('water', 110, 105))

      expect(hook.result.current.items).toHaveLength(1)
      expect(hook.result.current.items[0].id).toBe('steam')
      expect(hook.result.current.discovered).toContain('steam')
      expect(hook.result.current.mixes).toBe(1)
    })

    it('just places it next to the card, silently, when the two do not react', () => {
      const { hook, add } = setup()
      add('fire', 100, 100)
      act(() => hook.result.current.dropNewElement('fire', 110, 105))

      expect(hook.result.current.items.map((i) => i.id)).toEqual(['fire', 'fire'])
      expect(hook.result.current.feedback).toBeNull()
      expect(hook.result.current.mixes).toBe(0)
    })

    it('ignores cards that are too far away to mix with', () => {
      const { hook, add } = setup()
      add('fire', 0, 0)
      act(() => hook.result.current.dropNewElement('water', 300, 300))
      expect(hook.result.current.items.map((i) => i.id)).toEqual(['fire', 'water'])
    })

    it('ignores elements that are not discovered', () => {
      const { hook } = setup()
      act(() => hook.result.current.dropNewElement('steam', 0, 0))
      expect(hook.result.current.items).toHaveLength(0)
    })
  })

  it('only a new discovery marks the result card for the celebration animation', () => {
    const { hook, add } = setup()
    add('water', 0, 0)
    add('fire', 10, 0)
    const [a, b] = hook.result.current.items
    act(() => hook.result.current.dropItem(a.uid, b.uid))
    expect(hook.result.current.feedback?.uids).toEqual([hook.result.current.items[0].uid])
  })
})
