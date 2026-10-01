import { forwardRef, useMemo, useState, type PointerEvent } from 'react'
import type { CategoryId, ElementId, Locale } from '../types'
import type { AlchemyTranslations } from '../i18n'
import { CATEGORIES } from '../categories'
import { categoryProgress, elementEmoji, elementName, listElements } from '../logic'

interface InventoryProps {
  discovered: ElementId[]
  locale: Locale
  t: AlchemyTranslations
  trashActive: boolean
  /** The element currently being dragged out of the list, if any. */
  draggingId?: ElementId | null
  /** Tap on an element: puts it on the table. */
  onAdd: (id: ElementId) => void
  /** Press on an element: the start of a possible drag onto the table. */
  onPointerDownElement: (id: ElementId, e: PointerEvent) => void
}

type Tab = 'elements' | 'collection'

export const Inventory = forwardRef<HTMLElement, InventoryProps>(function Inventory(
  { discovered, locale, t, trashActive, draggingId = null, onAdd, onPointerDownElement },
  ref,
) {
  const [tab, setTab] = useState<Tab>('elements')
  const [category, setCategory] = useState<CategoryId | 'all'>('all')
  const [query, setQuery] = useState('')

  const progress = useMemo(() => categoryProgress(discovered), [discovered])
  const list = useMemo(
    () => listElements({ discovered, locale, category, query, discoveredOnly: tab === 'elements' }),
    [discovered, locale, category, query, tab],
  )

  return (
    <section
      ref={ref}
      className={`al-inventory ${trashActive ? 'al-inventory--trash' : ''}`}
      aria-label={t.inventoryLabel}
    >
      {trashActive && <div className="al-inventory-trash">{t.trashHint}</div>}

      <div className="al-inventory-toolbar">
        <div className="al-tabs" role="tablist">
          {(['elements', 'collection'] as const).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`al-tab ${tab === id ? 'al-tab--active' : ''}`}
              onClick={() => setTab(id)}
            >
              {id === 'elements' ? t.tabElements : t.tabCollection}
            </button>
          ))}
        </div>
        <input
          type="search"
          className="al-search"
          value={query}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchPlaceholder}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="al-categories" role="group" aria-label={t.categoriesLabel}>
        <button
          type="button"
          className={`al-category ${category === 'all' ? 'al-category--active' : ''}`}
          aria-pressed={category === 'all'}
          onClick={() => setCategory('all')}
        >
          {t.allCategories}
        </button>
        {CATEGORIES.map((c) => {
          const p = progress.find((x) => x.id === c.id)
          // In the elements tab a category with nothing found yet would only ever show an empty list.
          if (tab === 'elements' && !p?.found) return null
          return (
            <button
              key={c.id}
              type="button"
              className={`al-category ${category === c.id ? 'al-category--active' : ''}`}
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
            >
              <span aria-hidden="true">{c.emoji}</span> {c.name[locale]}
              <span className="al-category-count">
                {p?.found}/{p?.total}
              </span>
            </button>
          )
        })}
      </div>

      <div className="al-inventory-scroll">
        {list.length === 0 ? (
          <p className="al-inventory-empty">{t.nothingFound}</p>
        ) : (
          <div className="al-inventory-grid">
            {list.map(({ id, locked }) =>
              locked ? (
                <div key={id} className="al-chip al-chip--locked" role="img" aria-label={t.locked}>
                  <span className="al-chip-emoji" aria-hidden="true">
                    ❔
                  </span>
                  <span className="al-chip-name">???</span>
                </div>
              ) : (
                <button
                  key={id}
                  type="button"
                  className={`al-chip ${draggingId === id ? 'al-chip--dragging' : ''}`}
                  onClick={() => onAdd(id)}
                  onPointerDown={(e) => onPointerDownElement(id, e)}
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                >
                  <span className="al-chip-emoji" aria-hidden="true">
                    {elementEmoji(id)}
                  </span>
                  <span className="al-chip-name">{elementName(id, locale)}</span>
                </button>
              ),
            )}
          </div>
        )}
      </div>
    </section>
  )
})
