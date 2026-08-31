import type { BoardState, Position, Move, PlayerColor, Locale } from '../types'
import { CheckersPiece } from './CheckersPiece'
import { BOARD_SIZE } from '../logic'
import { checkersTranslations } from '../i18n'

interface CheckersBoardProps {
  board: BoardState
  selectedPos: Position | null
  validMoves: Move[]
  turn: PlayerColor
  isEink?: boolean
  locale?: Locale
  onSquareClick: (row: number, col: number) => void
}

export function CheckersBoard({
  board,
  selectedPos,
  validMoves,
  turn,
  isEink = false,
  locale = 'en',
  onSquareClick,
}: CheckersBoardProps) {
  const t = checkersTranslations[locale] || checkersTranslations.en
  const validDestinations = new Set(validMoves.map(m => `${m.to.row},${m.to.col}`))

  return (
    <div className="checkers-board-wrapper">
      <div className="checkers-board" role="grid" aria-label={t.boardAria}>
        {Array.from({ length: BOARD_SIZE }).map((_, row) =>
          Array.from({ length: BOARD_SIZE }).map((_, col) => {
            const isDark = (row + col) % 2 === 1
            const piece = board[row][col]
            const isSelected = selectedPos?.row === row && selectedPos?.col === col
            const isValidDestination = validDestinations.has(`${row},${col}`)
            const isClickable = (piece && piece.color === turn) || isValidDestination

            return (
              <button
                key={`${row}-${col}`}
                type="button"
                className={`checkers-square ${isDark ? 'checkers-square--dark' : 'checkers-square--light'} ${
                  isSelected ? 'checkers-square--selected' : ''
                } ${isValidDestination ? 'checkers-square--target' : ''}`}
                onClick={() => onSquareClick(row, col)}
                aria-label={t.squareAria(
                  row,
                  col,
                  piece ? `${piece.color} ${piece.isKing ? 'king' : 'piece'}` : ''
                )}
                id={`checkers-sq-${row}-${col}`}
              >
                {/* Target move indicator dot */}
                {isValidDestination && <span className="checkers-target-dot" aria-hidden="true" />}

                {piece && (
                  <CheckersPiece
                    piece={piece}
                    isSelected={isSelected}
                    isEink={isEink}
                  />
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
