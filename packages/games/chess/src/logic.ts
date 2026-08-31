import type { ChessBoardState, ChessPieceData, PieceColor, PieceType, SquareCoord, ChessMove } from './types'

export const BOARD_SIZE = 8

export function createInitialChessBoard(): ChessBoardState {
  const board: ChessBoardState = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null))

  const backRow: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']

  // Black pieces (rows 0 and 1)
  for (let c = 0; c < BOARD_SIZE; c++) {
    board[0][c] = { id: `b_${backRow[c]}_${c}`, type: backRow[c], color: 'black', hasMoved: false }
    board[1][c] = { id: `b_pawn_${c}`, type: 'pawn', color: 'black', hasMoved: false }
  }

  // White pieces (rows 6 and 7)
  for (let c = 0; c < BOARD_SIZE; c++) {
    board[6][c] = { id: `w_pawn_${c}`, type: 'pawn', color: 'white', hasMoved: false }
    board[7][c] = { id: `w_${backRow[c]}_${c}`, type: backRow[c], color: 'white', hasMoved: false }
  }

  return board
}

export function cloneChessBoard(board: ChessBoardState): ChessBoardState {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)))
}

export function isInsideBoard(r: number, c: number): boolean {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE
}

export function findKing(board: ChessBoardState, color: PieceColor): SquareCoord | null {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c]
      if (p && p.type === 'king' && p.color === color) {
        return { row: r, col: c }
      }
    }
  }
  return null
}

/**
 * Checks if a square (r, c) is under attack by the opposing color.
 */
export function isSquareAttacked(board: ChessBoardState, target: SquareCoord, byColor: PieceColor): boolean {
  const opponentColor = byColor

  // 1. Pawn attacks
  const pawnDir = opponentColor === 'white' ? 1 : -1 // Attacking FROM row towards target
  for (const dc of [-1, 1]) {
    const pr = target.row + pawnDir
    const pc = target.col + dc
    if (isInsideBoard(pr, pc)) {
      const p = board[pr][pc]
      if (p && p.color === opponentColor && p.type === 'pawn') return true
    }
  }

  // 2. Knight attacks
  const knightOffsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ]
  for (const [dr, dc] of knightOffsets) {
    const kr = target.row + dr
    const kc = target.col + dc
    if (isInsideBoard(kr, kc)) {
      const p = board[kr][kc]
      if (p && p.color === opponentColor && p.type === 'knight') return true
    }
  }

  // 3. Bishop / Queen diagonal rays
  const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  for (const [dr, dc] of diagDirs) {
    let step = 1
    while (true) {
      const r = target.row + dr * step
      const c = target.col + dc * step
      if (!isInsideBoard(r, c)) break
      const p = board[r][c]
      if (p) {
        if (p.color === opponentColor && (p.type === 'bishop' || p.type === 'queen')) return true
        break
      }
      step++
    }
  }

  // 4. Rook / Queen straight rays
  const straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  for (const [dr, dc] of straightDirs) {
    let step = 1
    while (true) {
      const r = target.row + dr * step
      const c = target.col + dc * step
      if (!isInsideBoard(r, c)) break
      const p = board[r][c]
      if (p) {
        if (p.color === opponentColor && (p.type === 'rook' || p.type === 'queen')) return true
        break
      }
      step++
    }
  }

  // 5. King attacks
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const kr = target.row + dr
      const kc = target.col + dc
      if (isInsideBoard(kr, kc)) {
        const p = board[kr][kc]
        if (p && p.color === opponentColor && p.type === 'king') return true
      }
    }
  }

  return false
}

export function isKingInCheck(board: ChessBoardState, color: PieceColor): boolean {
  const kingPos = findKing(board, color)
  if (!kingPos) return false
  const opponentColor: PieceColor = color === 'white' ? 'black' : 'white'
  return isSquareAttacked(board, kingPos, opponentColor)
}

/**
 * Returns pseudo-legal moves for a specific piece (ignoring check on own king).
 */
export function getPseudoLegalMoves(
  board: ChessBoardState,
  from: SquareCoord,
  enPassantTarget: SquareCoord | null
): ChessMove[] {
  const piece = board[from.row][from.col]
  if (!piece) return []

  const moves: ChessMove[] = []
  const { row, col } = from
  const opponent: PieceColor = piece.color === 'white' ? 'black' : 'white'

  switch (piece.type) {
    case 'pawn': {
      const dir = piece.color === 'white' ? -1 : 1
      const startRow = piece.color === 'white' ? 6 : 1
      const promoRow = piece.color === 'white' ? 0 : 7

      // 1 step forward
      const f1 = row + dir
      if (isInsideBoard(f1, col) && !board[f1][col]) {
        if (f1 === promoRow) {
          moves.push({ from, to: { row: f1, col }, piece, promotion: 'queen' })
        } else {
          moves.push({ from, to: { row: f1, col }, piece })
          // 2 steps forward
          const f2 = row + 2 * dir
          if (row === startRow && isInsideBoard(f2, col) && !board[f2][col]) {
            moves.push({ from, to: { row: f2, col }, piece })
          }
        }
      }

      // Captures
      for (const dc of [-1, 1]) {
        const tr = row + dir
        const tc = col + dc
        if (isInsideBoard(tr, tc)) {
          const targetPiece = board[tr][tc]
          if (targetPiece && targetPiece.color === opponent) {
            if (tr === promoRow) {
              moves.push({ from, to: { row: tr, col: tc }, piece, captured: targetPiece, promotion: 'queen' })
            } else {
              moves.push({ from, to: { row: tr, col: tc }, piece, captured: targetPiece })
            }
          } else if (enPassantTarget && enPassantTarget.row === tr && enPassantTarget.col === tc) {
            // En passant
            const capturedPawn = board[row][tc]
            moves.push({ from, to: { row: tr, col: tc }, piece, captured: capturedPawn, isEnPassant: true })
          }
        }
      }
      break
    }

    case 'knight': {
      const knightOffsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ]
      for (const [dr, dc] of knightOffsets) {
        const tr = row + dr
        const tc = col + dc
        if (isInsideBoard(tr, tc)) {
          const target = board[tr][tc]
          if (!target) {
            moves.push({ from, to: { row: tr, col: tc }, piece })
          } else if (target.color === opponent) {
            moves.push({ from, to: { row: tr, col: tc }, piece, captured: target })
          }
        }
      }
      break
    }

    case 'bishop':
    case 'rook':
    case 'queen': {
      const dirs: number[][] = []
      if (piece.type === 'bishop' || piece.type === 'queen') {
        dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1])
      }
      if (piece.type === 'rook' || piece.type === 'queen') {
        dirs.push([-1, 0], [1, 0], [0, -1], [0, 1])
      }

      for (const [dr, dc] of dirs) {
        let step = 1
        while (true) {
          const tr = row + dr * step
          const tc = col + dc * step
          if (!isInsideBoard(tr, tc)) break
          const target = board[tr][tc]
          if (!target) {
            moves.push({ from, to: { row: tr, col: tc }, piece })
          } else {
            if (target.color === opponent) {
              moves.push({ from, to: { row: tr, col: tc }, piece, captured: target })
            }
            break
          }
          step++
        }
      }
      break
    }

    case 'king': {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          const tr = row + dr
          const tc = col + dc
          if (isInsideBoard(tr, tc)) {
            const target = board[tr][tc]
            if (!target) {
              moves.push({ from, to: { row: tr, col: tc }, piece })
            } else if (target.color === opponent) {
              moves.push({ from, to: { row: tr, col: tc }, piece, captured: target })
            }
          }
        }
      }

      // Castling
      if (!piece.hasMoved && !isSquareAttacked(board, from, opponent)) {
        // Kingside (col 7 rook)
        const kingsideRook = board[row][7]
        if (kingsideRook && kingsideRook.type === 'rook' && !kingsideRook.hasMoved) {
          if (!board[row][5] && !board[row][6]) {
            if (!isSquareAttacked(board, { row, col: 5 }, opponent) && !isSquareAttacked(board, { row, col: 6 }, opponent)) {
              moves.push({ from, to: { row, col: 6 }, piece, isCastling: 'kingside' })
            }
          }
        }
        // Queenside (col 0 rook)
        const queensideRook = board[row][0]
        if (queensideRook && queensideRook.type === 'rook' && !queensideRook.hasMoved) {
          if (!board[row][1] && !board[row][2] && !board[row][3]) {
            if (!isSquareAttacked(board, { row, col: 2 }, opponent) && !isSquareAttacked(board, { row, col: 3 }, opponent)) {
              moves.push({ from, to: { row, col: 2 }, piece, isCastling: 'queenside' })
            }
          }
        }
      }
      break
    }
  }

  return moves
}

/**
 * Applies move onto a board state.
 */
export function applyChessMove(board: ChessBoardState, move: ChessMove) {
  const { from, to, piece, isCastling, isEnPassant, promotion } = move

  board[from.row][from.col] = null
  const movingPiece: ChessPieceData = {
    ...piece,
    hasMoved: true,
    type: promotion ?? piece.type,
  }

  board[to.row][to.col] = movingPiece

  if (isEnPassant) {
    // Remove captured pawn
    const capturedPawnRow = from.row
    board[capturedPawnRow][to.col] = null
  } else if (isCastling === 'kingside') {
    // Move rook from col 7 to col 5
    const rook = board[from.row][7]
    board[from.row][7] = null
    if (rook) board[from.row][5] = { ...rook, hasMoved: true }
  } else if (isCastling === 'queenside') {
    // Move rook from col 0 to col 3
    const rook = board[from.row][0]
    board[from.row][0] = null
    if (rook) board[from.row][3] = { ...rook, hasMoved: true }
  }
}

/**
 * Returns all fully legal moves for the given player (filtering moves that leave King in check).
 */
export function getLegalMoves(
  board: ChessBoardState,
  playerColor: PieceColor,
  enPassantTarget: SquareCoord | null
): ChessMove[] {
  const legal: ChessMove[] = []

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c]
      if (piece && piece.color === playerColor) {
        const pseudo = getPseudoLegalMoves(board, { row: r, col: c }, enPassantTarget)
        for (const m of pseudo) {
          const testBoard = cloneChessBoard(board)
          applyChessMove(testBoard, m)
          if (!isKingInCheck(testBoard, playerColor)) {
            legal.push(m)
          }
        }
      }
    }
  }

  return legal
}

// ─── AI Evaluation with Piece Values & Positional Tables ───

const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
}

// Center control bonuses
const CENTER_BONUS: number[][] = [
  [-10, -5, -5, -5, -5, -5, -5, -10],
  [-5,   0,  0,  0,  0,  0,  0,  -5],
  [-5,   0, 10, 15, 15, 10,  0,  -5],
  [-5,   0, 15, 25, 25, 15,  0,  -5],
  [-5,   0, 15, 25, 25, 15,  0,  -5],
  [-5,   0, 10, 15, 15, 10,  0,  -5],
  [-5,   0,  0,  0,  0,  0,  0,  -5],
  [-10, -5, -5, -5, -5, -5, -5, -10],
]

function evaluateChessBoard(board: ChessBoardState): number {
  let score = 0

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c]
      if (!p) continue

      const val = PIECE_VALUES[p.type]
      const pos = CENTER_BONUS[r][c]
      const total = val + (p.type === 'king' ? 0 : pos)

      if (p.color === 'black') score += total
      else score -= total
    }
  }

  return score
}

export function getBestChessAIMove(
  board: ChessBoardState,
  enPassantTarget: SquareCoord | null,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): ChessMove | null {
  const legalMoves = getLegalMoves(board, 'black', enPassantTarget)
  if (legalMoves.length === 0) return null
  if (legalMoves.length === 1) return legalMoves[0]

  // Easy mode: 50% random legal move, else depth 1
  if (difficulty === 'easy') {
    if (Math.random() < 0.5) {
      return legalMoves[Math.floor(Math.random() * legalMoves.length)]
    }
  }

  const depth = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3

  let bestScore = -Infinity
  let bestMove = legalMoves[0]

  for (const move of legalMoves) {
    const nextBoard = cloneChessBoard(board)
    applyChessMove(nextBoard, move)

    const score = minimaxChess(nextBoard, depth - 1, -Infinity, Infinity, false)
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return bestMove
}

function minimaxChess(
  board: ChessBoardState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0) return evaluateChessBoard(board)

  const player: PieceColor = isMaximizing ? 'black' : 'white'
  const legalMoves = getLegalMoves(board, player, null)

  if (legalMoves.length === 0) {
    if (isKingInCheck(board, player)) {
      return isMaximizing ? -50000 : 50000 // Checkmate
    }
    return 0 // Stalemate
  }

  if (isMaximizing) {
    let maxEval = -Infinity
    for (const move of legalMoves) {
      const nextBoard = cloneChessBoard(board)
      applyChessMove(nextBoard, move)
      const evaluation = minimaxChess(nextBoard, depth - 1, alpha, beta, false)
      maxEval = Math.max(maxEval, evaluation)
      alpha = Math.max(alpha, evaluation)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of legalMoves) {
      const nextBoard = cloneChessBoard(board)
      applyChessMove(nextBoard, move)
      const evaluation = minimaxChess(nextBoard, depth - 1, alpha, beta, true)
      minEval = Math.min(minEval, evaluation)
      beta = Math.min(beta, evaluation)
      if (beta <= alpha) break
    }
    return minEval
  }
}
