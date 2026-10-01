import { describe, it, expect } from 'vitest'
import { BASE_IDS, ELEMENTS, ELEMENT_MAP } from '../elements'
import { CATEGORIES } from '../categories'
import {
  TOTAL_ELEMENTS,
  categoryProgress,
  combine,
  getHint,
  listElements,
  recipeKey,
  sanitizeDiscovered,
} from '../logic'

describe('alchemy data', () => {
  it('has four basics and unique element ids', () => {
    expect(BASE_IDS).toEqual(['water', 'fire', 'earth', 'air'])
    expect(new Set(ELEMENTS.map((e) => e.id)).size).toBe(ELEMENTS.length)
    expect(TOTAL_ELEMENTS).toBe(ELEMENTS.length)
  })

  it('every recipe uses existing ingredients and no pair of ingredients is used twice', () => {
    const seen = new Map<string, string>()
    for (const e of ELEMENTS) {
      for (const [a, b] of e.recipes ?? []) {
        expect(ELEMENT_MAP.has(a), `${e.id}: unknown ingredient ${a}`).toBe(true)
        expect(ELEMENT_MAP.has(b), `${e.id}: unknown ingredient ${b}`).toBe(true)
        expect([a, b], `${e.id} is made from itself`).not.toContain(e.id)
        const key = recipeKey(a, b)
        expect(seen.get(key), `${a} + ${b} makes both ${e.id} and ${seen.get(key)}`).toBeUndefined()
        seen.set(key, e.id)
      }
    }
  })

  it('every element can be discovered starting from the four basics', () => {
    const have = new Set<string>(BASE_IDS)
    let changed = true
    while (changed) {
      changed = false
      for (const e of ELEMENTS) {
        if (!have.has(e.id) && e.recipes?.some(([a, b]) => have.has(a) && have.has(b))) {
          have.add(e.id)
          changed = true
        }
      }
    }
    expect(ELEMENTS.filter((e) => !have.has(e.id)).map((e) => e.id)).toEqual([])
  })

  it('has a generous number of elements', () => {
    expect(TOTAL_ELEMENTS).toBeGreaterThanOrEqual(300)
  })

  it('puts every element in a known category and uses every category', () => {
    const ids = new Set(CATEGORIES.map((c) => c.id))
    for (const e of ELEMENTS) expect(ids.has(e.category), `${e.id}: unknown category ${e.category}`).toBe(true)
    for (const c of CATEGORIES)
      expect(
        ELEMENTS.some((e) => e.category === c.id),
        `empty category ${c.id}`,
      ).toBe(true)
  })

  it('has a name in both languages for every element', () => {
    for (const e of ELEMENTS) {
      expect(e.name.en.length).toBeGreaterThan(0)
      expect(e.name.pl.length).toBeGreaterThan(0)
    }
  })
})

describe('alternative recipes', () => {
  it('many elements can be made in more than one way', () => {
    const multi = ELEMENTS.filter((e) => (e.recipes?.length ?? 0) > 1)
    expect(multi.length).toBeGreaterThanOrEqual(100)
  })

  it('every recipe of an element really produces that element, in either order', () => {
    for (const e of ELEMENTS) {
      for (const [a, b] of e.recipes ?? []) {
        expect(combine(a, b), `${a} + ${b}`).toBe(e.id)
        expect(combine(b, a), `${b} + ${a}`).toBe(e.id)
      }
    }
  })

  it('keeps the old recipe working after a main recipe was made more natural', () => {
    expect(combine('dough', 'fire')).toBe('bread')
    expect(combine('wheat', 'fire')).toBe('bread')
    expect(combine('fish', 'tool')).toBe('shark')
    expect(combine('fish', 'storm')).toBe('shark')
  })

  it('gives each of several recipes for one element the same result', () => {
    expect(combine('earth', 'earth')).toBe('mountain')
    expect(combine('earth', 'stone')).toBe('mountain')
  })
})

describe('combine', () => {
  it('makes steam from water and fire in either order', () => {
    expect(combine('water', 'fire')).toBe('steam')
    expect(combine('fire', 'water')).toBe('steam')
  })

  it('supports combining an element with itself', () => {
    expect(combine('earth', 'earth')).toBe('mountain')
  })

  it('returns null when two elements do not react', () => {
    expect(combine('water', 'robot')).toBeNull()
    expect(combine('fire', 'fire')).toBeNull()
  })
})

describe('getHint', () => {
  it('points at ingredients the player already has', () => {
    const hint = getHint(BASE_IDS)
    expect(hint).not.toBeNull()
    expect(BASE_IDS).toContain(hint!.a)
    expect(BASE_IDS).toContain(hint!.b)
    expect(combine(hint!.a, hint!.b)).not.toBeNull()
  })

  it('hints exactly when something new can be made, counting every recipe', () => {
    // Deterministic pseudo-random sets of discovered elements.
    let seed = 12345
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }
    const ids = ELEMENTS.map((e) => e.id)

    for (let round = 0; round < 60; round++) {
      const share = 0.1 + rand() * 0.85
      const have = [...BASE_IDS, ...ids.filter((id) => !BASE_IDS.includes(id) && rand() < share)]
      const haveSet = new Set(have)

      let somethingNew = false
      for (const a of have) {
        for (const b of have) {
          const made = combine(a, b)
          if (made && !haveSet.has(made)) somethingNew = true
        }
      }

      const hint = getHint(have)
      if (!somethingNew) {
        expect(hint).toBeNull()
      } else {
        expect(hint).not.toBeNull()
        expect(haveSet.has(hint!.a) && haveSet.has(hint!.b)).toBe(true)
        expect(haveSet.has(combine(hint!.a, hint!.b)!)).toBe(false)
      }
    }
  })

  it('never hints at something already discovered', () => {
    const hint = getHint([...BASE_IDS, 'steam'])
    expect(combine(hint!.a, hint!.b)).not.toBe('steam')
  })

  it('returns null when everything is discovered', () => {
    expect(getHint(ELEMENTS.map((e) => e.id))).toBeNull()
  })
})

describe('sanitizeDiscovered', () => {
  it('always keeps the basics and drops unknown or duplicate ids', () => {
    expect(sanitizeDiscovered(['steam', 'nonsense', 'steam', 42])).toEqual([...BASE_IDS, 'steam'])
  })

  it('falls back to the basics for garbage input', () => {
    expect(sanitizeDiscovered(null)).toEqual(BASE_IDS)
    expect(sanitizeDiscovered('x')).toEqual(BASE_IDS)
  })
})

describe('categoryProgress', () => {
  it('counts found and total per category, adding up to the whole game', () => {
    const progress = categoryProgress([...BASE_IDS, 'steam'])
    expect(progress.reduce((sum, p) => sum + p.total, 0)).toBe(TOTAL_ELEMENTS)
    expect(progress.find((p) => p.id === 'basic')).toMatchObject({ found: 4, total: 4 })
    expect(progress.find((p) => p.id === 'weather')?.found).toBe(1)
    expect(progress.find((p) => p.id === 'animals')?.found).toBe(0)
  })
})

describe('listElements', () => {
  const have = [...BASE_IDS, 'steam', 'mud']

  it('lists only discovered elements in discovery order when playing', () => {
    const list = listElements({ discovered: have, locale: 'en', category: 'all', query: '', discoveredOnly: true })
    expect(list.map((x) => x.id)).toEqual(have)
    expect(list.every((x) => !x.locked)).toBe(true)
  })

  it('lists the whole catalogue with locked entries in the collection', () => {
    const list = listElements({ discovered: have, locale: 'en', category: 'all', query: '', discoveredOnly: false })
    expect(list).toHaveLength(TOTAL_ELEMENTS)
    expect(
      list
        .filter((x) => !x.locked)
        .map((x) => x.id)
        .sort(),
    ).toEqual([...have].sort())
  })

  it('filters by category', () => {
    const list = listElements({ discovered: have, locale: 'en', category: 'weather', query: '', discoveredOnly: false })
    expect(list.length).toBe(ELEMENTS.filter((e) => e.category === 'weather').length)
    expect(list.filter((x) => !x.locked).map((x) => x.id)).toEqual(['steam'])
  })

  it('searches discovered names only, ignoring case and Polish diacritics', () => {
    const pl = (query: string) =>
      listElements({ discovered: have, locale: 'pl', category: 'all', query, discoveredOnly: false }).map((x) => x.id)
    expect(pl('ogien')).toEqual(['fire'])
    expect(pl('BŁOTO')).toEqual(['mud'])
    // "Robot" exists in the game but is not discovered, so it must not show up.
    expect(pl('robot')).toEqual([])
  })
})
