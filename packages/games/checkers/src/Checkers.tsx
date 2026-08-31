import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCheckers } from './hooks/useCheckers'
import { CheckersBoard } from './components/CheckersBoard'
import type { GameComponentProps, GameMode, Locale, CheckersDifficulty } from './types'
import { checkersTranslations } from './i18n'
import { ModeSelect, StatsHeader, GameModal, PillGroup, GameButton, ControlsBar, ComputerIcon, TwoPlayersIcon } from '@allgames/ui'
import './styles/checkers.css'

function ThinkingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: '3px', marginLeft: '4px' }} aria-hidden="true">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block' }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  )
}

const DIFFICULTIES: CheckersDifficulty[] = ['easy', 'medium', 'hard']

export function Checkers({ setHeader, locale = 'en', isEink = false }: GameComponentProps) {
  const [hasChosenMode, setHasChosenMode] = useState(false)
  const [pendingAction, setPendingAction] = useState<
    { type: 'difficulty'; value: CheckersDifficulty } | { type: 'mode' } | null
  >(null)

  const t = checkersTranslations[locale] || checkersTranslations.en
  const isPl = locale === 'pl'

  const {
    board,
    turn,
    selectedPos,
    validMovesForSelected,
    hasJumps,
    winner,
    isAIThinking,
    stats,
    mode,
    difficulty,
    piecesCount,
    handleSquareClick,
    resetGame,
    changeMode,
    setDifficulty,
    resetStats,
  } = useCheckers({ isEink })

  const isGameActive = (piecesCount.white !== 12 || piecesCount.black !== 12 || selectedPos !== null) && !winner

  const renderHeader = useCallback(() => {
    if (!setHeader) return
    if (!hasChosenMode) {
      setHeader(null)
      return
    }

    const isAI = mode === 'ai'
    setHeader(
      <StatsHeader
        label={isPl ? 'Statystyki' : 'Stats'}
        items={[
          { key: 'w', label: isAI ? (isPl ? 'W' : 'W') : (isPl ? 'B' : 'W'), value: stats.white },
          { key: 'd', label: isPl ? 'R' : 'D', value: stats.draw },
          { key: 'b', label: isAI ? (isPl ? 'P' : 'L') : (isPl ? 'C' : 'B'), value: stats.black },
        ]}
        onReset={resetStats}
        resetAriaLabel={isPl ? 'Resetuj statystyki' : 'Reset stats'}
        resetId="checkers-reset-stats-btn"
      />
    )
  }, [setHeader, hasChosenMode, mode, stats, isPl, resetStats])

  useEffect(() => {
    renderHeader()
  }, [renderHeader])

  useEffect(() => {
    return () => setHeader?.(null)
  }, [setHeader])

  const handleModeSelect = (m: GameMode) => {
    changeMode(m)
    setHasChosenMode(true)
  }

  const handleChangeModeClick = () => {
    if (isGameActive) {
      setPendingAction({ type: 'mode' })
    } else {
      setHasChosenMode(false)
      resetGame()
    }
  }

  const handleDifficultyClick = (d: CheckersDifficulty) => {
    if (d === difficulty) return
    if (isGameActive) {
      setPendingAction({ type: 'difficulty', value: d })
    } else {
      setDifficulty(d)
    }
  }

  const handleConfirmAction = () => {
    if (!pendingAction) return
    if (pendingAction.type === 'difficulty') {
      setDifficulty(pendingAction.value)
    } else if (pendingAction.type === 'mode') {
      setHasChosenMode(false)
      resetGame()
    }
    setPendingAction(null)
  }

  const handleCancelAction = () => {
    setPendingAction(null)
  }

  const pageVariants = {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.97, transition: { duration: 0.18 } },
  }

  return (
    <div className="checkers-root">
      <AnimatePresence mode="wait">
        {!hasChosenMode ? (
          <motion.div
            key="mode-select"
            {...pageVariants}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <ModeSelect
              label={t.chooseMode}
              options={[
                {
                  id: 'ai',
                  title: t.vsComputer,
                  desc: t.vsComputerDesc,
                  icon: <ComputerIcon />,
                },
                {
                  id: '2p',
                  title: t.twoPlayers,
                  desc: t.twoPlayersDesc,
                  icon: <TwoPlayersIcon />,
                },
              ]}
              onSelect={handleModeSelect}
            />
          </motion.div>
        ) : (
          <motion.div key="game" className="checkers-game" {...pageVariants}>
            {/* Status indicator */}
            <div className="checkers-status" aria-live="polite">
              {winner ? (
                <>
                  <div className="checkers-status-text">
                    {mode === 'ai'
                      ? winner === 'white'
                        ? t.youWon
                        : t.computerWon
                      : t.playerWon(winner === 'white' ? t.white : t.black)}
                  </div>
                  <div className="checkers-status-sub">{t.gameOver}</div>
                </>
              ) : isAIThinking ? (
                <div className="checkers-status-text">
                  {t.computerThinking}
                  {!isEink ? <ThinkingDots /> : '…'}
                </div>
              ) : (
                <>
                  <div className="checkers-status-text">
                    {mode === 'ai'
                      ? t.yourTurn
                      : t.playerTurn(turn === 'white' ? t.white : t.black)}
                  </div>
                  <div className="checkers-status-sub">
                    {hasJumps
                      ? t.mustJump
                      : `${t.white}: ${piecesCount.white} · ${t.black}: ${piecesCount.black}`}
                  </div>
                </>
              )}
            </div>

            {/* 8x8 Board */}
            <CheckersBoard
              board={board}
              selectedPos={selectedPos}
              validMoves={validMovesForSelected}
              turn={turn}
              isEink={isEink}
              locale={locale}
              onSquareClick={handleSquareClick}
            />

            {/* Controls */}
            <ControlsBar>
              <GameButton
                id="checkers-new-game-btn"
                variant="primary"
                onClick={resetGame}
              >
                {t.newGame}
              </GameButton>
              <GameButton
                id="checkers-change-mode-btn"
                onClick={handleChangeModeClick}
              >
                {t.changeMode}
              </GameButton>

              {mode === 'ai' && (
                <PillGroup
                  label={t.difficultyLabel}
                  options={DIFFICULTIES.map(d => ({
                    value: d,
                    label: d === 'easy' ? t.difficultyEasy : d === 'medium' ? t.difficultyMedium : t.difficultyHard,
                    id: `checkers-diff-${d}`,
                  }))}
                  value={difficulty}
                  onChange={handleDifficultyClick}
                />
              )}
            </ControlsBar>

            {/* Reset Confirmation Modal */}
            <AnimatePresence>
              {pendingAction && (
                <GameModal
                  title={t.confirmResetTitle}
                  description={
                    pendingAction.type === 'difficulty'
                      ? t.confirmDifficultyDesc
                      : t.confirmModeDesc
                  }
                  cancelText={t.cancelBtn}
                  confirmText={t.confirmBtn}
                  cancelId="checkers-modal-cancel"
                  confirmId="checkers-modal-confirm"
                  onCancel={handleCancelAction}
                  onConfirm={handleConfirmAction}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
export default Checkers
