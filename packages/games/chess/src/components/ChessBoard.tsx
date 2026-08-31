import type { ChessBoardState, SquareCoord, ChessMove, PieceColor, Locale } from '../types'
import { ChessPiece } from './ChessPiece'
import { BOARD_SIZE, findKing } from '../logic'
import { chessTranslations } from '../i18n'

interface ChessBoardProps {
  board: ChessBoardState
  selectedCoord: SquareCoord | null
  validMoves: ChessMove[]
  turn: PieceColor
  inCheck: PieceColor | null
  isEink?: boolean
  locale?: Locale
  onSquareClick: (row: number, col: number) => void
}

export function ChessBoard({
  board,
  selectedCoord,
  validMoves,
  turn,
  inCheck,
  isEink = false,
  locale = 'en',
  onSquareClick,
}: ChessBoardProps) {
  const t = chessTranslations[locale] || chessTranslations.en
  const validDests = new Map(validMoves.map(m => [`${m.to.row},${m.to.col}`, m]))

  const checkedKingPos = inCheck ? findKing(board, inCheck) : null

  return (
    <div className="chess-board-wrapper">
      <div className="chess-board" role="grid" aria-label={t.boardAria}>
        {Array.from({ length: BOARD_SIZE }).map((_, row) =>
          Array.from({ length: BOARD_SIZE }).map((_, col) => {
            const isDark = (row + col) % 2 === 1
            const piece = board[row][col]
            const isSelected = selectedCoord?.row === row && selectedCoord?.col === col
            const moveKey = `${row},${col}`
            const move = validDests.get(moveKey)
            const isValidDestination = !!move
            const isCapture = move?.captured != null
            const isKingInCheckSquare = checkedKingPos?.row === row && checkedKingPos?.col === col

            return (
              <button
                key={`${row}-${col}`}
                type="button"
                className={`chess-square ${isDark ? 'chess-square--dark' : 'chess-square--light'} ${
                  isSelected ? 'chess-square--selected' : ''
                } ${isValidDestination ? 'chess-square--target' : ''} ${
                  isKingInCheckSquare ? 'chess-square--check' : ''
                }`}
                onClick={() => onSquareClick(row, col)}
                aria-label={`${String.fromCharCode(97 + col)}${8 - row}: ${
                  piece ? `${piece.color} ${piece.type}` : 'empty'
                }`}
                id={`chess-sq-${row}-${col}`}
              >
                {/* Rank & File coordinate notations on board edges */}
                {col === 0 && (
                  <span className="chess-coord chess-coord--rank" aria-hidden="true">
                    {8 - row}
                  </span>
                )}
                {row === 7 && (
                  <span className="chess-coord chess-coord--file" aria-hidden="true">
                    {String.fromCharCode(97 + col)}
                  </span>
                )}

                {/* Target move indicator dot or capture ring */}
                {isValidDestination && !piece && (
                  <span className="chess-target-dot" aria-hidden="true" />
                )}
                {isValidDestination && piece && (
                  <span className="chess-target-capture-ring" aria-hidden="true" />
                )}

                {piece && (
                  <ChessPiece
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
