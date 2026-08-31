import { motion } from 'framer-motion'
import type { Board } from '../logic'
import { GameCell } from './Cell'
import { gameTranslations, type Locale } from '../i18n'

interface BoardProps {
  board: Board
  winningLine: [number, number, number] | null
  currentPlayer: 'X' | 'O'
  gameOver: boolean
  isAIThinking: boolean
  locale?: Locale
  isEink?: boolean
  onMove: (index: number) => void
}

// Win line coords in 300×300 viewBox
const WIN_LINE_POSITIONS: Record<string, { x1: number; y1: number; x2: number; y2: number }> = {
  '0,1,2': { x1: 10,  y1: 50,  x2: 290, y2: 50  },
  '3,4,5': { x1: 10,  y1: 150, x2: 290, y2: 150 },
  '6,7,8': { x1: 10,  y1: 250, x2: 290, y2: 250 },
  '0,3,6': { x1: 50,  y1: 10,  x2: 50,  y2: 290 },
  '1,4,7': { x1: 150, y1: 10,  x2: 150, y2: 290 },
  '2,5,8': { x1: 250, y1: 10,  x2: 250, y2: 290 },
  '0,4,8': { x1: 10,  y1: 10,  x2: 290, y2: 290 },
  '2,4,6': { x1: 290, y1: 10,  x2: 10,  y2: 290 },
}

function WinLine({ line, isEink }: { line: [number, number, number]; isEink: boolean }) {
  const key = line.join(',')
  const pos = WIN_LINE_POSITIONS[key]
  if (!pos) return null

  if (isEink) {
    return (
      <svg className="ttt-win-line" viewBox="0 0 300 300" preserveAspectRatio="none" aria-hidden="true">
        <line x1={pos.x1} y1={pos.y1} x2={pos.x2} y2={pos.y2} stroke="var(--text)" strokeWidth={6} strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg className="ttt-win-line" viewBox="0 0 300 300" preserveAspectRatio="none" aria-hidden="true">
      <motion.line
        x1={pos.x1} y1={pos.y1}
        x2={pos.x2} y2={pos.y2}
        stroke="var(--text)"
        strokeWidth={6}
        strokeLinecap="round"
        opacity={0.35}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.35 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  )
}

/**
 * Grid lines for the 3x3 board.
 */
function GridLines({ isEink }: { isEink: boolean }) {
  if (isEink) {
    return (
      <svg className="ttt-grid" viewBox="0 0 3 3" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 1 0.05 Q 1.02 1.5 1 2.95" stroke="var(--border-2)" strokeWidth="0.04" strokeLinecap="round" fill="none" />
        <path d="M 2 0.05 Q 2.01 1.5 2 2.95" stroke="var(--border-2)" strokeWidth="0.04" strokeLinecap="round" fill="none" />
        <path d="M 0.05 1 Q 1.5 1.02 2.95 1" stroke="var(--border-2)" strokeWidth="0.04" strokeLinecap="round" fill="none" />
        <path d="M 0.05 2 Q 1.5 2.01 2.95 2" stroke="var(--border-2)" strokeWidth="0.04" strokeLinecap="round" fill="none" />
      </svg>
    )
  }

  return (
    <svg className="ttt-grid" viewBox="0 0 3 3" preserveAspectRatio="none" aria-hidden="true">
      <motion.path
        d="M 1 0.05 Q 1.02 1.5 1 2.95"
        stroke="var(--border-2)"
        strokeWidth="0.04"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.path
        d="M 2 0.05 Q 2.01 1.5 2 2.95"
        stroke="var(--border-2)"
        strokeWidth="0.04"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.path
        d="M 0.05 1 Q 1.5 1.02 2.95 1"
        stroke="var(--border-2)"
        strokeWidth="0.04"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.path
        d="M 0.05 2 Q 1.5 2.01 2.95 2"
        stroke="var(--border-2)"
        strokeWidth="0.04"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  )
}

export function Board({
  board,
  winningLine,
  currentPlayer,
  gameOver,
  isAIThinking,
  locale = 'en',
  isEink = false,
  onMove,
}: BoardProps) {
  const winSet = winningLine ? new Set(winningLine) : null
  const t = gameTranslations[locale] || gameTranslations.en

  return (
    <div className="ttt-board-wrapper">
      <div className="ttt-board" role="grid" aria-label={t.boardAria}>
        <GridLines isEink={isEink} />
        {board.map((cell, i) => (
          <GameCell
            key={i}
            value={cell}
            index={i}
            isWinning={winSet ? winSet.has(i) : false}
            canClick={!gameOver && !isAIThinking && cell === null}
            locale={locale}
            isEink={isEink}
            onClick={() => onMove(i)}
          />
        ))}
        {winningLine && <WinLine line={winningLine} isEink={isEink} />}
      </div>
    </div>
  )
}
