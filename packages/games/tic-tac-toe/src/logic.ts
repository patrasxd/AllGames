export type Player = 'X' | 'O'
export type Cell = Player | null
export type Board = Cell[]
export type GameMode = '2p' | 'ai'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'

export const WINNING_LINES: [number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],            // diagonals
]

export function checkWinner(board: Board): { winner: Player; line: [number, number, number] } | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line }
    }
  }
  return null
}

export function isDraw(board: Board): boolean {
  return board.every(cell => cell !== null) && checkWinner(board) === null
}

// ─── Minimax AI ─────────────────────────────────────────────
function score(board: Board, depth: number): number {
  const result = checkWinner(board)
  if (result?.winner === 'O') return 10 - depth
  if (result?.winner === 'X') return depth - 10
  return 0
}

function minimax(board: Board, depth: number, isMaximizing: boolean, alpha: number, beta: number): number {
  const s = score(board, depth)
  if (s !== 0) return s
  if (board.every(c => c !== null)) return 0

  if (isMaximizing) {
    let best = -Infinity
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O'
        best = Math.max(best, minimax(board, depth + 1, false, alpha, beta))
        board[i] = null
        alpha = Math.max(alpha, best)
        if (beta <= alpha) break
      }
    }
    return best
  } else {
    let best = Infinity
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X'
        best = Math.min(best, minimax(board, depth + 1, true, alpha, beta))
        board[i] = null
        beta = Math.min(beta, best)
        if (beta <= alpha) break
      }
    }
    return best
  }
}

export function getBestMove(board: Board, difficulty: DifficultyLevel = 'hard'): number {
  const availableMoves: number[] = []
  for (let i = 0; i < 9; i++) {
    if (!board[i]) availableMoves.push(i)
  }
  if (availableMoves.length === 0) return -1

  // If easy mode: 75% random, 25% optimal
  if (difficulty === 'easy' && Math.random() < 0.75) {
    return availableMoves[Math.floor(Math.random() * availableMoves.length)]
  }

  // If medium mode: 40% random, 60% optimal
  if (difficulty === 'medium' && Math.random() < 0.4) {
    // Check if can block instant loss first
    for (const m of availableMoves) {
      board[m] = 'X'
      if (checkWinner(board)?.winner === 'X') {
        board[m] = null
        return m
      }
      board[m] = null
    }
    return availableMoves[Math.floor(Math.random() * availableMoves.length)]
  }

  let bestScore = -Infinity
  let bestMove = availableMoves[0]

  if (board.every(c => c === null)) return 4

  for (const i of availableMoves) {
    board[i] = 'O'
    const s = minimax(board, 0, false, -Infinity, Infinity)
    board[i] = null
    if (s > bestScore) {
      bestScore = s
      bestMove = i
    }
  }
  return bestMove
}
