import type {
  MinesweeperDifficulty,
  DifficultyConfig,
  MinesweeperBoardState,
  CellState,
  GameStatus,
} from './types'

export const DIFFICULTY_CONFIGS: Record<MinesweeperDifficulty, DifficultyConfig> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
}

export function createEmptyBoard(rows: number, cols: number): MinesweeperBoardState {
  const board: MinesweeperBoardState = []
  for (let r = 0; r < rows; r++) {
    const row: CellState[] = []
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        hasMine: false,
        isRevealed: false,
        isFlagged: false,
        isQuestion: false,
        neighborMines: 0,
      })
    }
    board.push(row)
  }
  return board
}

export function cloneBoard(board: MinesweeperBoardState): MinesweeperBoardState {
  return board.map(row => row.map(cell => ({ ...cell })))
}

function getNeighbors(rows: number, cols: number, row: number, col: number): [number, number][] {
  const neighbors: [number, number][] = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = row + dr
      const nc = col + dc
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        neighbors.push([nr, nc])
      }
    }
  }
  return neighbors
}

export function populateMines(
  board: MinesweeperBoardState,
  firstClickRow: number,
  firstClickCol: number,
  totalMines: number
): MinesweeperBoardState {
  const nextBoard = cloneBoard(board)
  const rows = nextBoard.length
  const cols = nextBoard[0].length

  // Safe zone: first clicked cell and its 8 neighbors
  const safeCoords = new Set<string>()
  safeCoords.add(`${firstClickRow},${firstClickCol}`)
  for (const [nr, nc] of getNeighbors(rows, cols, firstClickRow, firstClickCol)) {
    safeCoords.add(`${nr},${nc}`)
  }

  // Potential mine locations
  const availableCoords: [number, number][] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!safeCoords.has(`${r},${c}`)) {
        availableCoords.push([r, c])
      }
    }
  }

  // Shuffle available coordinates
  for (let i = availableCoords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[availableCoords[i], availableCoords[j]] = [availableCoords[j], availableCoords[i]]
  }

  const minesToPlace = Math.min(totalMines, availableCoords.length)
  for (let i = 0; i < minesToPlace; i++) {
    const [mr, mc] = availableCoords[i]
    nextBoard[mr][mc].hasMine = true
  }

  // Calculate neighbor counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (nextBoard[r][c].hasMine) continue
      let count = 0
      for (const [nr, nc] of getNeighbors(rows, cols, r, c)) {
        if (nextBoard[nr][nc].hasMine) count++
      }
      nextBoard[r][c].neighborMines = count
    }
  }

  return nextBoard
}

export function revealCell(
  board: MinesweeperBoardState,
  row: number,
  col: number
): { nextBoard: MinesweeperBoardState; status: GameStatus } {
  const nextBoard = cloneBoard(board)
  const cell = nextBoard[row][col]

  if (cell.isRevealed || cell.isFlagged) {
    return { nextBoard, status: 'playing' }
  }

  // Stepped on a mine
  if (cell.hasMine) {
    cell.isRevealed = true
    cell.isExploded = true

    // Reveal all mines
    for (let r = 0; r < nextBoard.length; r++) {
      for (let c = 0; c < nextBoard[0].length; c++) {
        if (nextBoard[r][c].hasMine) {
          nextBoard[r][c].isRevealed = true
        }
      }
    }
    return { nextBoard, status: 'lost' }
  }

  // Reveal clicked cell
  cell.isRevealed = true

  // If 0 neighbor mines, cascade flood-fill reveal
  if (cell.neighborMines === 0) {
    const queue: [number, number][] = [[row, col]]
    const rows = nextBoard.length
    const cols = nextBoard[0].length

    while (queue.length > 0) {
      const [cr, cc] = queue.shift()!
      for (const [nr, nc] of getNeighbors(rows, cols, cr, cc)) {
        const neighbor = nextBoard[nr][nc]
        if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.hasMine) {
          neighbor.isRevealed = true
          if (neighbor.neighborMines === 0) {
            queue.push([nr, nc])
          }
        }
      }
    }
  }

  // Check if won
  if (checkWin(nextBoard)) {
    // Flag all remaining mines
    for (let r = 0; r < nextBoard.length; r++) {
      for (let c = 0; c < nextBoard[0].length; c++) {
        if (nextBoard[r][c].hasMine) {
          nextBoard[r][c].isFlagged = true
        }
      }
    }
    return { nextBoard, status: 'won' }
  }

  return { nextBoard, status: 'playing' }
}

export function toggleFlag(
  board: MinesweeperBoardState,
  row: number,
  col: number
): MinesweeperBoardState {
  const nextBoard = cloneBoard(board)
  const cell = nextBoard[row][col]
  if (cell.isRevealed) return nextBoard

  cell.isFlagged = !cell.isFlagged
  return nextBoard
}

export function chordReveal(
  board: MinesweeperBoardState,
  row: number,
  col: number
): { nextBoard: MinesweeperBoardState; status: GameStatus } {
  const rows = board.length
  const cols = board[0].length
  const cell = board[row][col]

  if (!cell.isRevealed || cell.neighborMines === 0) {
    return { nextBoard: board, status: 'playing' }
  }

  const neighbors = getNeighbors(rows, cols, row, col)
  const flaggedCount = neighbors.reduce((acc, [nr, nc]) => {
    return acc + (board[nr][nc].isFlagged ? 1 : 0)
  }, 0)

  if (flaggedCount !== cell.neighborMines) {
    return { nextBoard: board, status: 'playing' }
  }

  let currentBoard = cloneBoard(board)
  let status: GameStatus = 'playing'

  for (const [nr, nc] of neighbors) {
    if (!currentBoard[nr][nc].isRevealed && !currentBoard[nr][nc].isFlagged) {
      const res = revealCell(currentBoard, nr, nc)
      currentBoard = res.nextBoard
      if (res.status === 'lost') {
        return { nextBoard: currentBoard, status: 'lost' }
      }
      if (res.status === 'won') {
        status = 'won'
      }
    }
  }

  return { nextBoard: currentBoard, status }
}

export function countFlags(board: MinesweeperBoardState): number {
  let count = 0
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      if (board[r][c].isFlagged) count++
    }
  }
  return count
}

export function checkWin(board: MinesweeperBoardState): boolean {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      const cell = board[r][c]
      if (!cell.hasMine && !cell.isRevealed) {
        return false
      }
    }
  }
  return true
}
