import { memo, useState, useRef, useCallback } from 'react'
import type { SolitaireState, CardLocation, CardData } from '../types'
import { FOUNDATION_SUITS } from '../cards'
import { CardView, SuitIcon } from './CardView'

interface SolitaireBoardProps {
  state: SolitaireState
  selectedLocation: CardLocation | null
  hint: { from: CardLocation; to: CardLocation } | null
  isEink: boolean
  onStockClick: () => void
  onCardClick: (loc: CardLocation) => void
  onDoubleClick: (loc: CardLocation) => void
  onMove?: (from: CardLocation, to: CardLocation) => boolean | void
  onEmptyTableauClick: (colIndex: number) => void
  onEmptyFoundationClick: (foundationIndex: number) => void
}

/**
 * Computes dynamic vertical stacking offset for each card in a tableau column.
 * Compresses steps adaptively as piles grow so cards stay compact and visible.
 */
function getTableauCardOffset(column: { faceUp: boolean }[], cardIndex: number): number {
  const total = column.length
  // Face-down cards only need to peek enough to show depth (6px - 13px)
  const faceDownStep = total > 14 ? 6 : total > 11 ? 7 : total > 8 ? 9 : total > 5 ? 11 : 13
  // Face-up cards need to display their rank + mini suit (15px - 24px)
  const faceUpStep = total > 14 ? 15 : total > 11 ? 17 : total > 8 ? 19 : total > 5 ? 21 : 24

  let offset = 0
  for (let i = 0; i < cardIndex; i++) {
    offset += column[i].faceUp ? faceUpStep : faceDownStep
  }
  return offset
}

export const SolitaireBoard = memo(function SolitaireBoard({
  state,
  selectedLocation,
  hint,
  isEink,
  onStockClick,
  onCardClick,
  onDoubleClick,
  onMove,
  onEmptyTableauClick,
  onEmptyFoundationClick,
}: SolitaireBoardProps) {
  const [dragLoc, setDragLoc] = useState<CardLocation | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<{ type: string; pileIndex?: number } | null>(null)

  // Floating drag avatar for mobile touch dragging
  const [touchAvatar, setTouchAvatar] = useState<{
    x: number
    y: number
    cards: CardData[]
  } | null>(null)

  const touchStateRef = useRef<{
    startX: number
    startY: number
    offsetX: number
    offsetY: number
    from: CardLocation
    cards: CardData[]
    isDragging: boolean
  } | null>(null)

  const isSelected = (type: string, pileIndex?: number, cardIndex?: number) =>
    selectedLocation?.type === type &&
    selectedLocation?.pileIndex === pileIndex &&
    selectedLocation?.cardIndex === cardIndex

  const isHintFrom = (type: string, pileIndex?: number, cardIndex?: number) =>
    hint?.from.type === type &&
    hint?.from.pileIndex === pileIndex &&
    hint?.from.cardIndex === cardIndex

  const isHintTo = (type: string, pileIndex?: number) =>
    hint?.to.type === type && hint?.to.pileIndex === pileIndex

  const isCardBeingDragged = (type: string, pileIndex?: number, cardIndex?: number) => {
    if (!dragLoc || dragLoc.type !== type || dragLoc.pileIndex !== pileIndex) return false
    // In tableau, dragging a card drags all cards on top of it as well
    if (type === 'tableau' && dragLoc.cardIndex !== undefined && cardIndex !== undefined) {
      return cardIndex >= dragLoc.cardIndex
    }
    return dragLoc.cardIndex === cardIndex
  }

  // ── Drag & Drop Event Handlers (Desktop Mouse) ──
  const handleDragStart = useCallback((e: React.DragEvent, loc: CardLocation) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(loc))
    e.dataTransfer.effectAllowed = 'move'
    setDragLoc(loc)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDragLoc(null)
    setDragOverTarget(null)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, target: { type: string; pileIndex?: number }) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverTarget(target)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    setDragOverTarget(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, target: CardLocation) => {
    e.preventDefault()
    setDragOverTarget(null)
    setDragLoc(null)

    let fromLoc = dragLoc
    try {
      const data = e.dataTransfer.getData('text/plain')
      if (data) fromLoc = JSON.parse(data)
    } catch {
      // fallback to dragLoc
    }

    if (fromLoc) {
      onMove?.(fromLoc, target)
    }
  }, [dragLoc, onMove])

  // ── Touch Drag Handlers (Mobile Touch Screen) ──
  const handleTouchStart = useCallback(
    (e: React.TouchEvent, from: CardLocation, cards: CardData[]) => {
      const t = e.touches[0]
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      touchStateRef.current = {
        startX: t.clientX,
        startY: t.clientY,
        offsetX: t.clientX - rect.left,
        offsetY: t.clientY - rect.top,
        from,
        cards,
        isDragging: false,
      }
    },
    []
  )

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStateRef.current) return
    const t = e.touches[0]
    const state = touchStateRef.current
    const dist = Math.hypot(t.clientX - state.startX, t.clientY - state.startY)

    if (dist > 8) {
      state.isDragging = true
      setTouchAvatar({
        x: t.clientX - state.offsetX,
        y: t.clientY - state.offsetY,
        cards: state.cards,
      })

      // Hit-test drop target under finger
      const el = document.elementFromPoint(t.clientX, t.clientY)
      const targetEl = el?.closest('[data-sol-drop-type]')
      if (targetEl) {
        const type = targetEl.getAttribute('data-sol-drop-type')!
        const pileIndexAttr = targetEl.getAttribute('data-sol-drop-index')
        const pileIndex = pileIndexAttr !== null ? Number(pileIndexAttr) : undefined
        setDragOverTarget({ type, pileIndex })
      } else {
        setDragOverTarget(null)
      }
    }
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const state = touchStateRef.current
      touchStateRef.current = null
      setTouchAvatar(null)
      setDragOverTarget(null)

      if (!state) return

      if (state.isDragging) {
        const t = e.changedTouches[0]
        const el = document.elementFromPoint(t.clientX, t.clientY)
        const targetEl = el?.closest('[data-sol-drop-type]')
        if (targetEl) {
          const type = targetEl.getAttribute('data-sol-drop-type') as 'tableau' | 'foundation'
          const pileIndexAttr = targetEl.getAttribute('data-sol-drop-index')
          const pileIndex = pileIndexAttr !== null ? Number(pileIndexAttr) : undefined
          if (type && pileIndex !== undefined) {
            onMove?.(state.from, { type, pileIndex })
          }
        }
      }
    },
    [onMove]
  )

  return (
    <div className="sol-board">
      {/* Floating Mobile Drag Avatar */}
      {touchAvatar && (
        <div
          className="sol-drag-avatar"
          style={{
            transform: `translate3d(${touchAvatar.x}px, ${touchAvatar.y}px, 0)`,
          }}
        >
          {touchAvatar.cards.map((c, i) => (
            <div
              key={c.id}
              style={{
                position: i === 0 ? 'relative' : 'absolute',
                top: `${i * 20}px`,
                left: 0,
                width: '100%',
              }}
            >
              <CardView card={c} isEink={isEink} />
            </div>
          ))}
        </div>
      )}

      {/* ─── Upper Row: Stock, Waste, Gap, 4 Foundations ─────── */}
      <div className="sol-top-row">
        {/* Stock & Waste */}
        <div className="sol-stock-waste-group">
          {/* Stock Pile */}
          <div
            className={`sol-slot sol-slot--stock ${
              state.stock.length === 0 ? 'sol-slot--stock-empty' : ''
            }`}
            onClick={e => {
              e.stopPropagation()
              onStockClick()
            }}
            role="button"
            tabIndex={0}
            aria-label={`Stock pile (${state.stock.length} cards remaining)`}
          >
            {state.stock.length > 0 ? (
              <div className="sol-card sol-card--back">
                <div className="sol-card-back-pattern" />
              </div>
            ) : (
              <span className="sol-slot-recycle-icon">↺</span>
            )}
          </div>

          {/* Waste Pile */}
          <div
            className="sol-slot sol-slot--waste"
            aria-label="Waste pile"
          >
            {state.waste.length > 0 ? (
              <CardView
                card={state.waste[state.waste.length - 1]}
                isSelected={isSelected('waste')}
                isHintSource={isHintFrom('waste')}
                isDragging={isCardBeingDragged('waste')}
                draggable={true}
                isEink={isEink}
                onClick={() =>
                  onCardClick({ type: 'waste', cardIndex: state.waste.length - 1 })
                }
                onDoubleClick={() =>
                  onDoubleClick({ type: 'waste', cardIndex: state.waste.length - 1 })
                }
                onDragStart={e =>
                  handleDragStart(e, { type: 'waste', cardIndex: state.waste.length - 1 })
                }
                onDragEnd={handleDragEnd}
                onTouchStart={e =>
                  handleTouchStart(e, { type: 'waste', cardIndex: state.waste.length - 1 }, [
                    state.waste[state.waste.length - 1],
                  ])
                }
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
            ) : null}
          </div>
        </div>

        {/* 4 Foundation Piles (Fixed suit slots: 0=♠, 1=♥, 2=♣, 3=♦) */}
        <div className="sol-foundations-group">
          {state.foundations.map((pile, fIdx) => {
            const hasCards = pile.length > 0
            const isTarget = isHintTo('foundation', fIdx)
            const isDragOver = dragOverTarget?.type === 'foundation' && dragOverTarget?.pileIndex === fIdx

            return (
              <div
                key={`foundation-${fIdx}`}
                className={`sol-slot sol-slot--foundation ${
                  isTarget ? 'sol-slot--hint-target' : ''
                } ${isDragOver ? 'sol-slot--drag-over' : ''}`}
                data-sol-drop-type="foundation"
                data-sol-drop-index={fIdx}
                onDragOver={e => handleDragOver(e, { type: 'foundation', pileIndex: fIdx })}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, { type: 'foundation', pileIndex: fIdx })}
                onClick={e => {
                  e.stopPropagation()
                  if (selectedLocation) {
                    onMove?.(selectedLocation, { type: 'foundation', pileIndex: fIdx })
                  } else if (hasCards) {
                    onCardClick({
                      type: 'foundation',
                      pileIndex: fIdx,
                      cardIndex: pile.length - 1,
                    })
                  } else {
                    onEmptyFoundationClick(fIdx)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Foundation ${FOUNDATION_SUITS[fIdx]}`}
              >
                {hasCards ? (
                  <CardView
                    card={pile[pile.length - 1]}
                    isSelected={isSelected('foundation', fIdx, pile.length - 1)}
                    isDragging={isCardBeingDragged('foundation', fIdx, pile.length - 1)}
                    draggable={true}
                    isEink={isEink}
                    onClick={() =>
                      onCardClick({
                        type: 'foundation',
                        pileIndex: fIdx,
                        cardIndex: pile.length - 1,
                      })
                    }
                    onDragStart={e =>
                      handleDragStart(e, {
                        type: 'foundation',
                        pileIndex: fIdx,
                        cardIndex: pile.length - 1,
                      })
                    }
                    onDragEnd={handleDragEnd}
                    onTouchStart={e =>
                      handleTouchStart(
                        e,
                        {
                          type: 'foundation',
                          pileIndex: fIdx,
                          cardIndex: pile.length - 1,
                        },
                        [pile[pile.length - 1]]
                      )
                    }
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  />
                ) : (
                  <div className="sol-slot-watermark">
                    <SuitIcon suit={FOUNDATION_SUITS[fIdx]} className="sol-slot-watermark-icon" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Lower Row: 7 Tableau Columns ────────────────────── */}
      <div className="sol-tableau-row">
        {state.tableau.map((column, colIdx) => {
          const isEmpty = column.length === 0
          const isTarget = isHintTo('tableau', colIdx)
          const isDragOver = dragOverTarget?.type === 'tableau' && dragOverTarget?.pileIndex === colIdx
          const lastOffset = column.length > 0 ? getTableauCardOffset(column, column.length - 1) : 0
          const minColHeight = column.length > 0
            ? `calc(${lastOffset}px + clamp(62px, 14vw, 95px))`
            : undefined

          return (
            <div
              key={`tableau-${colIdx}`}
              className={`sol-tableau-col ${isEmpty ? 'sol-tableau-col--empty' : ''} ${
                isTarget ? 'sol-tableau-col--hint-target' : ''
              } ${isDragOver ? 'sol-tableau-col--drag-over' : ''}`}
              style={minColHeight ? { minHeight: minColHeight } : undefined}
              data-sol-drop-type="tableau"
              data-sol-drop-index={colIdx}
              onDragOver={e => handleDragOver(e, { type: 'tableau', pileIndex: colIdx })}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, { type: 'tableau', pileIndex: colIdx })}
              onClick={e => {
                // Only respond to column click if column is truly empty
                if (isEmpty) {
                  e.stopPropagation()
                  onEmptyTableauClick(colIdx)
                }
              }}
              role="region"
              aria-label={`Tableau column ${colIdx + 1}`}
            >
              {column.map((card, cardIdx) => {
                const isTop = cardIdx === column.length - 1
                const topOffset = getTableauCardOffset(column, cardIdx)

                return (
                  <div
                    key={card.id}
                    className="sol-tableau-card-wrapper"
                    style={{
                      top: `${topOffset}px`,
                      zIndex: cardIdx + 1,
                    }}
                  >
                    <CardView
                      card={card}
                      isSelected={isSelected('tableau', colIdx, cardIdx)}
                      isHintSource={isHintFrom('tableau', colIdx, cardIdx)}
                      isDragging={isCardBeingDragged('tableau', colIdx, cardIdx)}
                      draggable={card.faceUp}
                      isEink={isEink}
                      onClick={() =>
                        onCardClick({
                          type: 'tableau',
                          pileIndex: colIdx,
                          cardIndex: cardIdx,
                        })
                      }
                      onDoubleClick={() => {
                        if (isTop) {
                          onDoubleClick({
                            type: 'tableau',
                            pileIndex: colIdx,
                            cardIndex: cardIdx,
                          })
                        }
                      }}
                      onDragStart={e => {
                        e.stopPropagation()
                        handleDragStart(e, {
                          type: 'tableau',
                          pileIndex: colIdx,
                          cardIndex: cardIdx,
                        })
                      }}
                      onDragEnd={handleDragEnd}
                      onTouchStart={e => {
                        e.stopPropagation()
                        handleTouchStart(
                          e,
                          {
                            type: 'tableau',
                            pileIndex: colIdx,
                            cardIndex: cardIdx,
                          },
                          column.slice(cardIdx)
                        )
                      }}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    />
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
})
