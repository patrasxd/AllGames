import { memo } from 'react'
import type { MinesweeperBoardState } from '../types'
import { Cell } from './Cell'

interface MinesweeperBoardProps {
  board: MinesweeperBoardState
  isEink: boolean
  onCellClick: (row: number, col: number) => void
  onCellContextMenu: (e: React.MouseEvent, row: number, col: number) => void
  onCellMouseDown: () => void
  onCellMouseUp: () => void
}

export const MinesweeperBoard = memo(function MinesweeperBoard({
  board,
  isEink,
  onCellClick,
  onCellContextMenu,
  onCellMouseDown,
  onCellMouseUp,
}: MinesweeperBoardProps) {
  const rows = board.length
  const cols = board[0].length

  return (
    <div
      className="ms-board-wrapper"
      data-rows={rows}
      data-cols={cols}
    >
      <div
        className="ms-board-grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {board.map((rowArr, r) =>
          rowArr.map((cell, c) => (
            <Cell
              key={`${r}-${c}`}
              cell={cell}
              isEink={isEink}
              onClick={() => onCellClick(r, c)}
              onContextMenu={e => onCellContextMenu(e, r, c)}
              onMouseDown={onCellMouseDown}
              onMouseUp={onCellMouseUp}
            />
          ))
        )}
      </div>
    </div>
  )
})
