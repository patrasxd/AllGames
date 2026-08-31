import type { BoardState, Piece, PlayerColor, Position, Move } from './types'

export const BOARD_SIZE = 8

export function createInitialBoard(): BoardState {
  const board: BoardState = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null))

  let pieceId = 1
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if ((r + c) % 2 === 1) {
        if (r < 3) {
          board[r][c] = { id: `b_${pieceId++}`, color: 'black', isKing: false }
        } else if (r > 4) {
          board[r][c] = { id: `w_${pieceId++}`, color: 'white', isKing: false }
        }
      }
    }
  }
  return board
}

export function cloneBoard(board: BoardState): BoardState {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)))
}

export function isInside(r: number, c: number): boolean {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE
}

/**
 * Returns all possible jumps (captures) for a piece at (r, c).
 */
export function getJumpsForPiece(board: BoardState, pos: Position): Move[] {
  const piece = board[pos.row][pos.col]
  if (!piece) return []

  const jumps: Move[] = []
  const { row, col } = pos

  // Direction vectors
  const forwardRows = piece.color === 'white' ? [-1] : [1]
  const rowDirs = piece.isKing ? [-1, 1] : forwardRows
  const colDirs = [-1, 1]

  for (const dr of rowDirs) {
    for (const dc of colDirs) {
      const overR = row + dr
      const overC = col + dc
      const landR = row + 2 * dr
      const landC = col + 2 * dc

      if (isInside(landR, landC)) {
        const overPiece = board[overR][overC]
        const landPiece = board[landR][landC]

        if (overPiece && overPiece.color !== piece.color && !landPiece) {
          jumps.push({
            from: { row, col },
            to: { row: landR, col: landC },
            captured: { row: overR, col: overC },
          })
        }
      }
    }
  }

  return jumps
}

/**
 * Returns simple (non-capture) diagonal step moves for a piece at (r, c).
 */
export function getSimpleMovesForPiece(board: BoardState, pos: Position): Move[] {
  const piece = board[pos.row][pos.col]
  if (!piece) return []

  const moves: Move[] = []
  const { row, col } = pos

  const forwardRows = piece.color === 'white' ? [-1] : [1]
  const rowDirs = piece.isKing ? [-1, 1] : forwardRows
  const colDirs = [-1, 1]

  for (const dr of rowDirs) {
    for (const dc of colDirs) {
      const toR = row + dr
      const toC = col + dc

      if (isInside(toR, toC) && !board[toR][toC]) {
        moves.push({
          from: { row, col },
          to: { row: toR, col: toC },
        })
      }
    }
  }

  return moves
}

/**
 * Returns all legal moves for a player. If captures are available,
 * captures are mandatory (standard checkers rule).
 */
export function getAllLegalMoves(board: BoardState, player: PlayerColor): Move[] {
  const allJumps: Move[] = []
  const allSimple: Move[] = []

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c]
      if (piece && piece.color === player) {
        const jumps = getJumpsForPiece(board, { row: r, col: c })
        allJumps.push(...jumps)
        if (allJumps.length === 0) {
          const simple = getSimpleMovesForPiece(board, { row: r, col: c })
          allSimple.push(...simple)
        }
      }
    }
  }

  return allJumps.length > 0 ? allJumps : allSimple
}

/**
 * Applies a move to the board and returns whether a king promotion occurred.
 */
export function applyMove(board: BoardState, move: Move): { promoted: boolean } {
  const { from, to, captured } = move
  const piece = board[from.row][from.col]
  if (!piece) return { promoted: false }

  board[from.row][from.col] = null
  board[to.row][to.col] = piece

  if (captured) {
    board[captured.row][captured.col] = null
  }

  // King promotion
  let promoted = false
  if (!piece.isKing) {
    if (piece.color === 'white' && to.row === 0) {
      piece.isKing = true
      promoted = true
    } else if (piece.color === 'black' && to.row === BOARD_SIZE - 1) {
      piece.isKing = true
      promoted = true
    }
  }

  return { promoted }
}

/**
 * Counts remaining pieces for each color.
 */
export function countPieces(board: BoardState): { white: number; black: number } {
  let white = 0
  let black = 0
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c]
      if (p) {
        if (p.color === 'white') white++
        else black++
      }
    }
  }
  return { white, black }
}

// ─── AI Minimax Evaluation ─────────────────────────────────

function evaluateBoard(board: BoardState): number {
  let score = 0
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c]
      if (!p) continue

      const baseVal = p.isKing ? 280 : 100
      // Positional advantage: center control & advancement
      const centerBonus = (c >= 2 && c <= 5 && r >= 2 && r <= 5) ? 15 : 0
      const advancement = p.color === 'black' ? r * 5 : (7 - r) * 5
      const pieceScore = baseVal + centerBonus + (p.isKing ? 0 : advancement)

      if (p.color === 'black') score += pieceScore
      else score -= pieceScore
    }
  }
  return score
}

export function getBestAIMove(board: BoardState, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Move | null {
  const legalMoves = getAllLegalMoves(board, 'black')
  if (legalMoves.length === 0) return null
  if (legalMoves.length === 1) return legalMoves[0]

  // Easy mode: 50% random legal move, else depth 1
  if (difficulty === 'easy') {
    if (Math.random() < 0.5) {
      return legalMoves[Math.floor(Math.random() * legalMoves.length)]
    }
  }

  const depth = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 4

  let bestScore = -Infinity
  let bestMove = legalMoves[0]

  for (const move of legalMoves) {
    const nextBoard = cloneBoard(board)
    applyMove(nextBoard, move)

    // Check consecutive jumps if captured
    let currentMoveScore: number
    if (move.captured) {
      const chainJumps = getJumpsForPiece(nextBoard, move.to)
      if (chainJumps.length > 0) {
        const nextChainBoard = cloneBoard(nextBoard)
        applyMove(nextChainBoard, chainJumps[0])
        currentMoveScore = minimax(nextChainBoard, depth - 1, -Infinity, Infinity, false)
      } else {
        currentMoveScore = minimax(nextBoard, depth - 1, -Infinity, Infinity, false)
      }
    } else {
      currentMoveScore = minimax(nextBoard, depth - 1, -Infinity, Infinity, false)
    }

    if (currentMoveScore > bestScore) {
      bestScore = currentMoveScore
      bestMove = move
    }
  }

  return bestMove
}

function minimax(
  board: BoardState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0) return evaluateBoard(board)

  const player: PlayerColor = isMaximizing ? 'black' : 'white'
  const legalMoves = getAllLegalMoves(board, player)

  if (legalMoves.length === 0) {
    return isMaximizing ? -10000 : 10000 // Loss for current player
  }

  if (isMaximizing) {
    let maxEval = -Infinity
    for (const move of legalMoves) {
      const nextBoard = cloneBoard(board)
      applyMove(nextBoard, move)
      const evaluation = minimax(nextBoard, depth - 1, alpha, beta, false)
      maxEval = Math.max(maxEval, evaluation)
      alpha = Math.max(alpha, evaluation)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of legalMoves) {
      const nextBoard = cloneBoard(board)
      applyMove(nextBoard, move)
      const evaluation = minimax(nextBoard, depth - 1, alpha, beta, true)
      minEval = Math.min(minEval, evaluation)
      beta = Math.min(beta, evaluation)
      if (beta <= alpha) break
    }
    return minEval
  }
}
