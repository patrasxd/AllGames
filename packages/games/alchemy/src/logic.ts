import { BASE_IDS, ELEMENTS, ELEMENT_MAP } from './elements'
import { CATEGORIES } from './categories'
import type { CategoryId, ElementId, Locale } from './types'

export const TOTAL_ELEMENTS = ELEMENTS.length

/** Order-independent key for a pair of ingredients. */
export function recipeKey(a: ElementId, b: ElementId): string {
  return a <= b ? `${a}+${b}` : `${b}+${a}`
}

const RECIPES: ReadonlyMap<string, ElementId> = new Map(
  ELEMENTS.flatMap((e) => (e.recipes ?? []).map(([a, b]): [string, ElementId] => [recipeKey(a, b), e.id])),
)

/** The element made by combining `a` and `b`, or null when they do not react. */
export function combine(a: ElementId, b: ElementId): ElementId | null {
  return RECIPES.get(recipeKey(a, b)) ?? null
}

export function elementName(id: ElementId, locale: Locale): string {
  return ELEMENT_MAP.get(id)?.name[locale] ?? id
}

export function elementEmoji(id: ElementId): string {
  return ELEMENT_MAP.get(id)?.emoji ?? '?'
}

/**
 * One undiscovered element that can be made right now from elements the player already has.
 * Returns only the ingredients (never the result), or null if there is nothing left to find.
 */
export function getHint(discovered: readonly ElementId[]): { a: ElementId; b: ElementId } | null {
  const have = new Set(discovered)
  for (const e of ELEMENTS) {
    if (have.has(e.id) || !e.recipes) continue
    const ready = e.recipes.find(([a, b]) => have.has(a) && have.has(b))
    if (ready) return { a: ready[0], b: ready[1] }
  }
  return null
}

/** Restores saved progress, dropping unknown ids and always keeping the four basics. */
export function sanitizeDiscovered(raw: unknown): ElementId[] {
  const out: ElementId[] = [...BASE_IDS]
  if (!Array.isArray(raw)) return out
  for (const id of raw) {
    if (typeof id === 'string' && ELEMENT_MAP.has(id) && !out.includes(id)) out.push(id)
  }
  return out
}

/** Total and discovered element counts for every category, in display order. */
export function categoryProgress(discovered: readonly ElementId[]): { id: CategoryId; found: number; total: number }[] {
  const have = new Set(discovered)
  return CATEGORIES.map(({ id }) => {
    const inCategory = ELEMENTS.filter((e) => e.category === id)
    return { id, total: inCategory.length, found: inCategory.filter((e) => have.has(e.id)).length }
  })
}

function normalize(text: string): string {
  return text
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
}

/**
 * The elements to list in the element panel.
 * - `discoveredOnly`: only what the player has found, in discovery order (used for playing).
 * - otherwise the whole catalogue in category order (the collection view).
 * The search only ever matches names of discovered elements, so it cannot be used to peek at locked ones.
 */
export function listElements(options: {
  discovered: readonly ElementId[]
  locale: Locale
  category: CategoryId | 'all'
  query: string
  discoveredOnly: boolean
}): { id: ElementId; locked: boolean }[] {
  const { discovered, locale, category, query, discoveredOnly } = options
  const have = new Set(discovered)
  const q = normalize(query.trim())

  const source = discoveredOnly
    ? discovered.map((id) => ELEMENT_MAP.get(id)).filter((e): e is NonNullable<typeof e> => Boolean(e))
    : CATEGORIES.flatMap((c) => ELEMENTS.filter((e) => e.category === c.id))

  return source
    .filter((e) => category === 'all' || e.category === category)
    .filter((e) => !q || (have.has(e.id) && normalize(e.name[locale]).includes(q)))
    .map((e) => ({ id: e.id, locked: !have.has(e.id) }))
}
