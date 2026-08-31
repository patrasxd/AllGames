import { memo } from 'react'
import type { SolitaireState, CardLocation, Suit } from '../types'
import { CardView, SuitIcon } from './CardView'

interface SolitaireBoardProps {
  state: SolitaireState
  selectedLocation: CardLocation | null
  hint: { from: CardLocation; to: CardLocation } | null
  isEink: boolean
  onStockClick: () => void
  onCardClick: (loc: CardLocation) => void
  onDoubleClick: (loc: CardLocation) => void
  onEmptyTableauClick: (colIndex: number) => void
  onEmptyFoundationClick: (foundationIndex: number) => void
}

const FOUNDATION_SUITS: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds']

export const SolitaireBoard = memo(function SolitaireBoard({
  state,
  selectedLocation,
  hint,
  isEink,
  onStockClick,
  onCardClick,
  onDoubleClick,
  onEmptyTableauClick,
  onEmptyFoundationClick,
}: SolitaireBoardProps) {
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
                isEink={isEink}
                onClick={() =>
                  onCardClick({ type: 'waste', cardIndex: state.waste.length - 1 })
                }
                onDoubleClick={() =>
                  onDoubleClick({ type: 'waste', cardIndex: state.waste.length - 1 })
                }
              />
            ) : null}
          </div>
        </div>

        {/* 4 Foundation Piles */}
        <div className="sol-foundations-group">
          {state.foundations.map((pile, fIdx) => {
            const hasCards = pile.length > 0
            const isTarget = isHintTo('foundation', fIdx)

            return (
              <div
                key={`foundation-${fIdx}`}
                className={`sol-slot sol-slot--foundation ${
                  isTarget ? 'sol-slot--hint-target' : ''
                }`}
                onClick={() => {
                  if (hasCards) {
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
                    isEink={isEink}
                    onClick={() =>
                      onCardClick({
                        type: 'foundation',
                        pileIndex: fIdx,
                        cardIndex: pile.length - 1,
                      })
                    }
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

          return (
            <div
              key={`tableau-${colIdx}`}
              className={`sol-tableau-col ${isEmpty ? 'sol-tableau-col--empty' : ''} ${
                isTarget ? 'sol-tableau-col--hint-target' : ''
              }`}
              onClick={() => {
                if (isEmpty) {
                  onEmptyTableauClick(colIdx)
                }
              }}
              role="region"
              aria-label={`Tableau column ${colIdx + 1}`}
            >
              {column.map((card, cardIdx) => {
                const isTop = cardIdx === column.length - 1

                return (
                  <div
                    key={card.id}
                    className="sol-tableau-card-wrapper"
                    style={{
                      top: `${cardIdx * 18}px`,
                      zIndex: cardIdx + 1,
                    }}
                  >
                    <CardView
                      card={card}
                      isSelected={isSelected('tableau', colIdx, cardIdx)}
                      isHintSource={isHintFrom('tableau', colIdx, cardIdx)}
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
