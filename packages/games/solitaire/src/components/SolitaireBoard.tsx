import { memo, useState, useRef, useCallback } from 'react'
import type { SolitaireState, CardLocation } from '../types'
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
 * Compresses steps adaptively as piles grow so cards never get pushed off-screen.
 */
function getTableauCardOffset(column: { faceUp: boolean }[], cardIndex: number): number {
  const total = column.length
  // Face-down cards only need to peek enough to show depth (7px - 14px)
  const faceDownStep = total > 14 ? 7 : total > 10 ? 9 : total > 7 ? 12 : 14
  // Face-up cards need to display their rank + mini suit (16px - 26px)
  const faceUpStep = total > 14 ? 16 : total > 11 ? 19 : total > 8 ? 22 : 26

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

  // Touch tracking for mobile swipe-to-move
  const touchStateRef = useRef<{
    startX: number
    startY: number
    from: CardLocation
    moved: boolean
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

  // ── Drag & Drop Event Handlers ──
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

  // ── Touch Drag Handlers (Mobile) ──
  const handleTouchStart = useCallback((e: React.TouchEvent, from: CardLocation) => {
    const t = e.touches[0]
    touchStateRef.current = {
      startX: t.clientX,
      startY: t.clientY,
      from,
      moved: false,
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStateRef.current) return
    const t = e.touches[0]
    const dist = Math.hypot(t.clientX - touchStateRef.current.startX, t.clientY - touchStateRef.current.startY)
    if (dist > 12) {
      touchStateRef.current.moved = true
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const state = touchStateRef.current
    touchStateRef.current = null
    if (!state || !state.moved) return

    const t = e.changedTouches[0]
    const el = document.elementFromPoint(t.clientX, t.clientY)
    const targetEl = el?.closest('[data-sol-drop-type]')
    if (!targetEl) return

    const type = targetEl.getAttribute('data-sol-drop-type') as 'tableau' | 'foundation' | null
    const pileIndexAttr = targetEl.getAttribute('data-sol-drop-index')
    const pileIndex = pileIndexAttr !== null ? Number(pileIndexAttr) : undefined

    if (type && pileIndex !== undefined) {
      onMove?.(state.from, { type, pileIndex })
    }
  }, [onMove])

  return (
    <div className="sol-board">
      {/* ─── Upper Row: Stock, Waste, Gap, 4 Foundations ─────── */}
      <div className="sol-top-row">
        {/* Stock & Waste */}
        <div className="sol-stock-waste-group">
          {/* Stock Pile */}
          <div
            className={`sol-slot sol-slot--stock ${
              state.stock.length === 0 ? 'sol-slot--stock-empty' : ''
            }`}
            onClick={onStockClick}
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
                  handleTouchStart(e, { type: 'waste', cardIndex: state.waste.length - 1 })
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
                onClick={() => {
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
                      handleTouchStart(e, {
                        type: 'foundation',
                        pileIndex: fIdx,
                        cardIndex: pile.length - 1,
                      })
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

          return (
            <div
              key={`tableau-${colIdx}`}
              className={`sol-tableau-col ${isEmpty ? 'sol-tableau-col--empty' : ''} ${
                isTarget ? 'sol-tableau-col--hint-target' : ''
              } ${isDragOver ? 'sol-tableau-col--drag-over' : ''}`}
              data-sol-drop-type="tableau"
              data-sol-drop-index={colIdx}
              onDragOver={e => handleDragOver(e, { type: 'tableau', pileIndex: colIdx })}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, { type: 'tableau', pileIndex: colIdx })}
              onClick={e => {
                // If user clicks on column area or column is empty, target this column
                if (selectedLocation) {
                  onMove?.(selectedLocation, { type: 'tableau', pileIndex: colIdx })
                } else if (isEmpty) {
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
                        handleTouchStart(e, {
                          type: 'tableau',
                          pileIndex: colIdx,
                          cardIndex: cardIdx,
                        })
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
