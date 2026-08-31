import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from './hooks/useGame'
import { Board } from './components/Board'
import type { GameComponentProps, GameMetadata, DifficultyLevel } from './types'
import type { GameMode, Player } from './logic'
import { gameTranslations, type Locale } from './i18n'
import { ModeSelect, StatsHeader, GameModal, PillGroup, GameButton, ControlsBar, ComputerIcon, TwoPlayersIcon } from '@allgames/ui'
import './styles/tictactoe.css'

export interface GameMetadataExtended extends GameMetadata {
  description: Record<Locale, string>
}

function ThinkingDots() {
  return (
    <span className="ttt-thinking-dots" aria-hidden="true">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="ttt-dot"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  )
}

function StatusText({
  winner,
  isDraw,
  currentPlayer,
  isAIThinking,
  mode,
  locale,
  isEink,
}: {
  winner: Player | null
  isDraw: boolean
  currentPlayer: Player
  isAIThinking: boolean
  mode: GameMode
  locale: Locale
  isEink: boolean
}) {
  const t = gameTranslations[locale] || gameTranslations.en

  if (winner) {
    const isPlayerWin = winner === 'X'
    let mainText = ''
    if (mode === 'ai') {
      mainText = isPlayerWin ? t.youWon : t.computerWon
    } else {
      mainText = t.playerWon(winner)
    }
    return (
      <>
        <div className="ttt-status-text">{mainText}</div>
        <div className="ttt-status-sub">{t.gameOver}</div>
      </>
    )
  }

  if (isDraw) {
    return (
      <>
        <div className="ttt-status-text">{t.draw}</div>
        <div className="ttt-status-sub">{t.nobodyWon}</div>
      </>
    )
  }

  if (isAIThinking) {
    return (
      <div className="ttt-status-text">
        {t.computerThinking}
        {!isEink ? <ThinkingDots /> : '…'}
      </div>
    )
  }

  const isHumanTurn = mode === 'ai' ? currentPlayer === 'X' : true
  const mainText = mode === 'ai' ? (isHumanTurn ? t.yourTurn : t.computerTurn) : t.playerTurn(currentPlayer)
  const subText = currentPlayer === 'X' ? t.playsX : t.playsO

  return (
    <>
      <div className="ttt-status-text">{mainText}</div>
      <div className="ttt-status-sub">{subText}</div>
    </>
  )
}

const DIFFICULTIES: DifficultyLevel[] = ['easy', 'medium', 'hard']

export function TicTacToe({ setHeader, locale = 'en', isEink = false }: GameComponentProps) {
  const [hasChosenMode, setHasChosenMode] = useState(false)
  const [pendingAction, setPendingAction] = useState<
    { type: 'difficulty'; value: DifficultyLevel } | { type: 'mode' } | null
  >(null)

  const t = gameTranslations[locale] || gameTranslations.en
  const isPl = locale === 'pl'

  const {
    board,
    currentPlayer,
    winner,
    winningLine,
    isDraw,
    gameOver,
    isAIThinking,
    stats,
    mode,
    difficulty,
    makeMove,
    resetGame: reset,
    changeMode,
    setDifficulty,
    resetStats,
  } = useGame({ isEink })

  const isGameActive = board.some(cell => cell !== null) && !gameOver

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
          { key: 'x', label: isAI ? (isPl ? 'Ty' : 'You') : 'X', value: stats.X },
          { key: 'd', label: isPl ? 'R' : 'D', value: stats.draw },
          { key: 'o', label: isAI ? 'AI' : 'O', value: stats.O },
        ]}
        onReset={resetStats}
        resetAriaLabel={isPl ? 'Resetuj statystyki' : 'Reset stats'}
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
      reset()
    }
  }

  const handleDifficultyClick = (d: DifficultyLevel) => {
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
      reset()
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
    <div className="ttt-root">
      <AnimatePresence mode="wait">
        {!hasChosenMode ? (
          <motion.div
            key="mode-select"
            {...pageVariants}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <ModeSelect<GameMode>
              label={t.chooseMode}
              options={[
                {
                  id: 'ai',
                  title: t.vsComputer,
                  desc: t.vsComputerDesc,
                  icon: <ComputerIcon />,
                  ariaLabel: t.vsComputerAria,
                },
                {
                  id: '2p',
                  title: t.twoPlayers,
                  desc: t.twoPlayersDesc,
                  icon: <TwoPlayersIcon />,
                  ariaLabel: t.twoPlayersAria,
                },
              ]}
              onSelect={handleModeSelect}
            />
          </motion.div>
        ) : (
          <motion.div key="game" className="ttt-game" {...pageVariants}>
            {/* Status indicator */}
            <AnimatePresence mode="wait">
              <motion.div
                className="ttt-status"
                key={`${winner}-${isDraw}-${currentPlayer}-${isAIThinking}-${locale}`}
                initial={!isEink ? { opacity: 0, y: 6 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={!isEink ? { opacity: 0, y: -6 } : undefined}
                transition={{ duration: 0.18 }}
                aria-live="polite"
                aria-atomic="true"
              >
                <StatusText
                  winner={winner}
                  isDraw={isDraw}
                  currentPlayer={currentPlayer}
                  isAIThinking={isAIThinking}
                  mode={mode}
                  locale={locale}
                  isEink={isEink}
                />
              </motion.div>
            </AnimatePresence>

            {/* Board */}
            <Board
              board={board}
              winningLine={winningLine}
              currentPlayer={currentPlayer}
              gameOver={gameOver}
              isAIThinking={isAIThinking}
              locale={locale}
              isEink={isEink}
              onMove={makeMove}
            />

            {/* Controls */}
            <ControlsBar>
              <GameButton
                id="ttt-reset-btn"
                variant="primary"
                onClick={reset}
              >
                {t.newGame}
              </GameButton>

              <GameButton
                id="ttt-change-mode-btn"
                onClick={handleChangeModeClick}
              >
                {t.changeMode}
              </GameButton>

              {mode === 'ai' && (
                <PillGroup<DifficultyLevel>
                  label={t.difficultyLabel}
                  options={DIFFICULTIES.map(d => ({
                    value: d,
                    label: d === 'easy' ? t.difficultyEasy : d === 'medium' ? t.difficultyMedium : t.difficultyHard,
                    id: `ttt-diff-${d}`,
                  }))}
                  value={difficulty}
                  onChange={handleDifficultyClick}
                />
              )}
            </ControlsBar>

            {/* Confirmation Modal */}
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
                  cancelId="ttt-modal-cancel"
                  confirmId="ttt-modal-confirm"
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
export default TicTacToe
