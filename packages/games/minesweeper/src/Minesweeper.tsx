import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMinesweeper } from './hooks/useMinesweeper'
import { MinesweeperBoard } from './components/MinesweeperBoard'
import type { GameComponentProps, MinesweeperDifficulty, GameStatus } from './types'
import { minesweeperTranslations } from './i18n'
import { StatsHeader, GameModal, PillGroup, GameButton, ControlsBar, pad3 } from '@allgames/ui'
import './styles/minesweeper.css'

/* ─── Sketched Vector Icons ──────────────────────────────── */
function PickaxeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.5 4.5l5 5" />
      <path d="M18 3c1.5 1 3 3 3 4.5-2 .5-4.5 0-6.5-1L6 15l-3-3 8.5-8.5C12.5 1.5 16 1 18 3z" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  )
}

function FlagActionIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M4 2v20h2V14h14l-3-5 3-5H6V2H4z" />
    </svg>
  )
}

function SketchFace({ status, isShocked }: { status: GameStatus; isShocked: boolean }) {
  if (status === 'won') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9.5" />
        <path d="M5.5 10.5h13" />
        <path d="M6 10.5l1.5 4.5h3.5l1-4.5" fill="currentColor" />
        <path d="M12 10.5l1 4.5h3.5l1.5-4.5" fill="currentColor" />
        <path d="M8 17c1.2 1.5 2.8 2 4 2s2.8-.5 4-2" />
      </svg>
    )
  }

  if (status === 'lost') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9.5" />
        <line x1="7.5" y1="8" x2="10.5" y2="11" />
        <line x1="10.5" y1="8" x2="7.5" y2="11" />
        <line x1="13.5" y1="8" x2="16.5" y2="11" />
        <line x1="16.5" y1="8" x2="13.5" y2="11" />
        <path d="M8.5 16.5c1-.8 2-.8 3.5 0s2.5.8 3.5 0" />
      </svg>
    )
  }

  if (isShocked) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9.5" />
        <circle cx="9" cy="9.5" r="1.2" fill="currentColor" />
        <circle cx="15" cy="9.5" r="1.2" fill="currentColor" />
        <ellipse cx="12" cy="15.5" rx="2.2" ry="2.8" fill="none" />
      </svg>
    )
  }

  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="8.8" cy="9.5" r="1.2" fill="currentColor" />
      <circle cx="15.2" cy="9.5" r="1.2" fill="currentColor" />
      <path d="M8.5 14.5c1 1.6 2.2 2.2 3.5 2.2s2.5-.6 3.5-2.2" />
    </svg>
  )
}

const DIFFICULTIES: MinesweeperDifficulty[] = ['beginner', 'intermediate', 'expert']

export function Minesweeper({ setHeader, locale = 'en', isEink = false }: GameComponentProps) {
  const [pendingDifficulty, setPendingDifficulty] = useState<MinesweeperDifficulty | null>(null)

  const t = minesweeperTranslations[locale] || minesweeperTranslations.en
  const isPl = locale === 'pl'

  const {
    board,
    difficulty,
    gameStatus,
    elapsedSeconds,
    remainingMines,
    bestTime,
    isFaceShocked,
    touchMode,
    setTouchMode,
    handleCellClick,
    handleCellContextMenu,
    handleCellToggleFlag,
    handleCellMouseDown,
    handleCellMouseUp,
    resetGame,
    setDifficulty,
    resetBestTime,
  } = useMinesweeper({ isEink })

  const isGameActive = elapsedSeconds > 0 && gameStatus === 'playing'

  const renderHeader = useCallback(() => {
    if (!setHeader) return
    setHeader(
      <StatsHeader
        label={isPl ? 'Rekord' : 'Record'}
        items={[
          { key: 'best', label: isPl ? 'Rekord' : 'Best', value: bestTime !== null ? `${bestTime}s` : '--' },
          { key: 'time', label: isPl ? 'Czas' : 'Time', value: `${elapsedSeconds}s` },
          { key: 'mines', label: isPl ? 'Miny' : 'Mines', value: remainingMines },
        ]}
        onReset={bestTime !== null ? resetBestTime : undefined}
        resetAriaLabel={isPl ? 'Resetuj rekord' : 'Reset record'}
        resetId="ms-reset-best-btn"
      />
    )
  }, [setHeader, bestTime, elapsedSeconds, remainingMines, isPl, resetBestTime])

  useEffect(() => {
    renderHeader()
  }, [renderHeader])

  useEffect(() => {
    return () => setHeader?.(null)
  }, [setHeader])

  const handleDifficultyClick = (d: MinesweeperDifficulty) => {
    if (d === difficulty) return
    if (isGameActive) {
      setPendingDifficulty(d)
    } else {
      setDifficulty(d)
    }
  }

  const handleConfirmDifficulty = () => {
    if (pendingDifficulty) {
      setDifficulty(pendingDifficulty)
      setPendingDifficulty(null)
    }
  }

  const handleCancelDifficulty = () => {
    setPendingDifficulty(null)
  }

  return (
    <div className="ms-root">
      <motion.div
        className="ms-game"
        initial={!isEink ? { opacity: 0, scale: 0.98 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        {/* Status bar with retro counters and sketched face button */}
        <div className="ms-statusbar">
          <div className="ms-counter ms-counter--mines" title={t.minesLeft}>
            {pad3(remainingMines)}
          </div>

          <button
            type="button"
            id="ms-face-btn"
            className="ms-face-btn"
            onClick={() => resetGame()}
            aria-label={t.clickSmileDesc}
            title={t.clickSmileDesc}
          >
            <SketchFace status={gameStatus} isShocked={isFaceShocked} />
          </button>

          <div className="ms-counter ms-counter--time" title={t.time}>
            {pad3(elapsedSeconds)}
          </div>
        </div>

        {/* Board Grid with interactive zoom */}
        <MinesweeperBoard
          board={board}
          isEink={isEink}
          onCellClick={handleCellClick}
          onCellContextMenu={handleCellContextMenu}
          onToggleFlag={handleCellToggleFlag}
          onCellMouseDown={handleCellMouseDown}
          onCellMouseUp={handleCellMouseUp}
        />

        {/* Controls & Difficulty Bar */}
        <div className="ms-controls">
          <PillGroup<MinesweeperDifficulty>
            label={t.difficultyLabel}
            options={DIFFICULTIES.map(d => ({
              value: d,
              label: d === 'beginner' ? t.beginner : d === 'intermediate' ? t.intermediate : t.expert,
              id: `ms-diff-${d}`,
            }))}
            value={difficulty}
            onChange={handleDifficultyClick}
          />

          {/* Mobile Tap Mode Switcher (Dig vs Flag) */}
          <div className="ms-touch-switcher" role="group" aria-label="Action Mode">
            <button
              type="button"
              id="ms-touch-dig"
              className={`ms-touch-btn ${touchMode === 'reveal' ? 'ms-touch-btn--active' : ''}`}
              onClick={() => setTouchMode('reveal')}
            >
              <PickaxeIcon />
              <span>{t.modeReveal}</span>
            </button>
            <button
              type="button"
              id="ms-touch-flag"
              className={`ms-touch-btn ${touchMode === 'flag' ? 'ms-touch-btn--active' : ''}`}
              onClick={() => setTouchMode('flag')}
            >
              <FlagActionIcon />
              <span>{t.modeFlag}</span>
            </button>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        <AnimatePresence>
          {pendingDifficulty && (
            <GameModal
              title={t.confirmResetTitle}
              description={t.confirmDifficultyDesc}
              cancelText={t.cancelBtn}
              confirmText={t.confirmBtn}
              cancelId="ms-modal-cancel"
              confirmId="ms-modal-confirm"
              onCancel={handleCancelDifficulty}
              onConfirm={handleConfirmDifficulty}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
export default Minesweeper
