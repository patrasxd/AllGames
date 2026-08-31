import { motion } from 'framer-motion'
import type { Piece } from '../types'

interface PieceProps {
  piece: Piece
  isSelected?: boolean
  isEink?: boolean
}

function CrownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </svg>
  )
}

export function CheckersPiece({ piece, isSelected = false, isEink = false }: PieceProps) {
  const isWhite = piece.color === 'white'

  const content = (
    <div
      className={`checkers-piece checkers-piece--${piece.color} ${piece.isKing ? 'checkers-piece--king' : ''} ${
        isSelected ? 'checkers-piece--selected' : ''
      }`}
    >
      {/* Inner decorative concentric ink ring */}
      <span className="checkers-piece-inner">
        {piece.isKing && <CrownIcon />}
      </span>
    </div>
  )

  if (isEink) {
    return content
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: isSelected ? 1.08 : 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
      style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {content}
    </motion.div>
  )
}
