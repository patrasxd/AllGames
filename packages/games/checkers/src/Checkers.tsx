import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCheckers } from './hooks/useCheckers'
import { CheckersBoard } from './components/CheckersBoard'
import type { GameComponentProps, GameMode, Locale, CheckersDifficulty } from './types'
import { checkersTranslations } from './i18n'
import { BoardLayout, ConfirmDialog, Button, PillGroup, ControlsBar, ModeSelect, StatsHeader } from '@all/ui'
import { GameResultOverlay, ComputerIcon, TwoPlayersIcon } from '@allgames/ui'
import './styles/checkers.css'

function ThinkingDots() {
  return (
    <span className="checkers-thinking-dots" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="checkers-dot"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  )
}

const DIFFICULTIES: CheckersDifficulty[] = ['easy', 'medium', 'hard']

export function Checkers({ setHeader, setIsActive, locale = 'en', isEink = false }: GameComponentProps) {
  const [hasChosenMode, setHasChosenMode] = useState(false)
  const [pendingAction, setPendingAction] = useState<
    { type: 'difficulty'; value: CheckersDifficulty } | { type: 'mode' } | { type: 'newGame' } | null
  >(null)

  const t = checkersTranslations[locale] || checkersTranslations.en

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

  const isGameActive =
    hasChosenMode &&
    (turn !== 'white' ||
      piecesCount.white !== 12 ||
      piecesCount.black !== 12 ||
      selectedPos !== null ||
      board[3].some(Boolean) ||
      board[4].some(Boolean)) &&
    !winner

  useEffect(() => {
    setIsActive?.(isGameActive)
    return () => setIsActive?.(false)
  }, [isGameActive, setIsActive])

  const renderHeader = useCallback(() => {
    if (!setHeader) return
    if (!hasChosenMode) {
      setHeader(null)
      return
    }

    const isAI = mode === 'ai'
    setHeader(
      <StatsHeader
        label={t.stats}
        items={[
          { key: 'w', label: isAI ? t.winShort : t.whiteShort, value: stats.white },
          { key: 'd', label: t.drawShort, value: stats.draw },
          { key: 'b', label: isAI ? t.lossShort : t.blackShort, value: stats.black },
        ]}
        onReset={resetStats}
        resetAriaLabel={t.resetStatsAria}
        resetId="checkers-reset-stats-btn"
      />,
    )
  }, [setHeader, hasChosenMode, mode, stats, t, resetStats])

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

  const handleNewGameClick = () => {
    if (isGameActive) {
      setPendingAction({ type: 'newGame' })
    } else {
      resetGame()
    }
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
    } else if (pendingAction.type === 'newGame') {
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
            <ModeSelect<GameMode>
              label={t.chooseMode}
              options={[
                {
                  id: 'ai',
                  title: t.vsComputer,
                  desc: t.vsComputerDesc,
                  icon: <ComputerIcon />,
                  ariaLabel: t.vsComputer,
                },
                {
                  id: '2p',
                  title: t.twoPlayers,
                  desc: t.twoPlayersDesc,
                  icon: <TwoPlayersIcon />,
                  ariaLabel: t.twoPlayers,
                },
              ]}
              onSelect={handleModeSelect}
            />
          </motion.div>
        ) : (
          <BoardLayout
            variant="square"
            hud={
              <div className="checkers-status" aria-live="polite">
                {isAIThinking ? (
                  <div className="checkers-status-text">
                    {t.computerThinking}
                    {!isEink ? <ThinkingDots /> : '…'}
                  </div>
                ) : (
                  <>
                    <div className="checkers-status-text">
                      {mode === 'ai' ? t.yourTurn : t.playerTurn(turn === 'white' ? t.white : t.black)}
                    </div>
                    <div className="checkers-status-sub">
                      {hasJumps ? t.mustJump : `${t.white}: ${piecesCount.white} · ${t.black}: ${piecesCount.black}`}
                    </div>
                  </>
                )}
              </div>
            }
            board={
              <CheckersBoard
                board={board}
                selectedPos={selectedPos}
                validMoves={validMovesForSelected}
                turn={turn}
                isEink={isEink}
                locale={locale}
                onSquareClick={handleSquareClick}
              />
            }
            overlay={
              <AnimatePresence>
                {winner && (
                  <GameResultOverlay
                    status={winner === 'draw' ? 'draw' : mode === 'ai' ? (winner === 'white' ? 'won' : 'lost') : 'won'}
                    title={
                      winner === 'draw'
                        ? t.draw
                        : mode === 'ai'
                          ? winner === 'white'
                            ? t.youWon
                            : t.computerWon
                          : t.playerWon(winner === 'white' ? t.white : t.black)
                    }
                    subtitle={t.gameOver}
                    isEink={isEink}
                    playAgainText={t.newGame}
                    onPlayAgain={resetGame}
                    playAgainId="checkers-play-again-btn"
                    stats={[
                      { label: t.white, value: piecesCount.white },
                      { label: t.black, value: piecesCount.black },
                    ]}
                  />
                )}
              </AnimatePresence>
            }
            controls={
              <ControlsBar className="checkers-controls-bar">
                <Button id="checkers-new-game-btn" variant="primary" size="sm" onClick={handleNewGameClick}>
                  {t.newGame}
                </Button>
                <Button id="checkers-change-mode-btn" variant="secondary" size="sm" onClick={handleChangeModeClick}>
                  {t.changeMode}
                </Button>

                {mode === 'ai' && (
                  <PillGroup<CheckersDifficulty>
                    label={t.difficultyLabel}
                    size="sm"
                    options={DIFFICULTIES.map((d) => ({
                      value: d,
                      label: d === 'easy' ? t.difficultyEasy : d === 'medium' ? t.difficultyMedium : t.difficultyHard,
                      id: `checkers-diff-${d}`,
                    }))}
                    value={difficulty}
                    onChange={handleDifficultyClick}
                  />
                )}
              </ControlsBar>
            }
          />
        )}
      </AnimatePresence>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(pendingAction)}
        onClose={handleCancelAction}
        title={t.confirmResetTitle}
        description={
          pendingAction?.type === 'difficulty'
            ? t.confirmDifficultyDesc
            : pendingAction?.type === 'newGame'
              ? t.confirmNewGameDesc
              : t.confirmModeDesc
        }
        confirmLabel={pendingAction?.type === 'newGame' ? t.newGame : t.confirmBtn}
        cancelLabel={t.cancelBtn}
        confirmVariant="danger"
        confirmId="checkers-modal-confirm"
        cancelId="checkers-modal-cancel"
        onConfirm={handleConfirmAction}
      />
    </div>
  )
}
export default Checkers
