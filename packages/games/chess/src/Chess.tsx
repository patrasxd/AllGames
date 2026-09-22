import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChess } from './hooks/useChess'
import { ChessBoard } from './components/ChessBoard'
import { PromotionModal } from './components/PromotionModal'
import type { GameComponentProps, ChessGameMode, Locale, ChessDifficulty } from './types'
import { chessTranslations } from './i18n'
import { BoardLayout, ConfirmDialog, Button, PillGroup, ControlsBar, ModeSelect, StatsHeader } from '@all/ui'
import { GameResultOverlay, ComputerIcon, TwoPlayersIcon } from '@allgames/ui'
import './styles/chess.css'

function ThinkingDots() {
  return (
    <span className="chess-thinking-dots" aria-hidden="true">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="chess-dot"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  )
}

const DIFFICULTIES: ChessDifficulty[] = ['easy', 'medium', 'hard']

export function Chess({ setHeader, setIsActive, locale = 'en', isEink = false }: GameComponentProps) {
  const [hasChosenMode, setHasChosenMode] = useState(false)
  const [pendingAction, setPendingAction] = useState<
    { type: 'difficulty'; value: ChessDifficulty } | { type: 'mode' } | { type: 'newGame' } | null
  >(null)

  const t = chessTranslations[locale] || chessTranslations.en

  const {
    board,
    turn,
    selectedCoord,
    validMovesForSelected,
    inCheck,
    winner,
    isCheckmate,
    isStalemate,
    isAIThinking,
    pendingPromotion,
    stats,
    mode,
    difficulty,
    handleSquareClick,
    choosePromotion,
    resetGame,
    changeMode,
    setDifficulty,
    resetStats,
  } = useChess({ isEink })

  const isGameActive =
    (turn !== 'white' ||
      selectedCoord !== null ||
      board[2].some(Boolean) ||
      board[3].some(Boolean) ||
      board[4].some(Boolean) ||
      board[5].some(Boolean)) &&
    !winner &&
    !isCheckmate &&
    !isStalemate

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
        resetId="chess-reset-stats-btn"
      />
    )
  }, [setHeader, hasChosenMode, mode, stats, t, resetStats])

  useEffect(() => {
    renderHeader()
  }, [renderHeader])

  useEffect(() => {
    return () => setHeader?.(null)
  }, [setHeader])

  const handleModeSelect = (m: ChessGameMode) => {
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

  const handleDifficultyClick = (d: ChessDifficulty) => {
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
    <div className="chess-root">
      <AnimatePresence mode="wait">
        {!hasChosenMode ? (
          <motion.div
            key="mode-select"
            {...pageVariants}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <ModeSelect<ChessGameMode>
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
              <div className="chess-status" aria-live="polite">
                {isAIThinking ? (
                  <div className="chess-status-text">
                    {t.computerThinking}
                    {!isEink ? <ThinkingDots /> : '…'}
                  </div>
                ) : (
                  <>
                    <div className="chess-status-text">
                      {mode === 'ai'
                        ? t.yourTurn
                        : t.playerTurn(turn === 'white' ? t.white : t.black)}
                      {inCheck && <span className="chess-check-badge"> {t.check}</span>}
                    </div>
                    <div className="chess-status-sub">
                      {turn === 'white' ? `${t.white}` : `${t.black}`}
                    </div>
                  </>
                )}
              </div>
            }
            board={
              <ChessBoard
                board={board}
                selectedCoord={selectedCoord}
                validMoves={validMovesForSelected}
                turn={turn}
                inCheck={inCheck}
                isEink={isEink}
                locale={locale}
                onSquareClick={handleSquareClick}
              />
            }
            overlay={
              <AnimatePresence>
                {(isCheckmate || isStalemate || winner !== null) && (
                  <GameResultOverlay
                    status={
                      isStalemate || winner === 'draw'
                        ? 'draw'
                        : mode === 'ai'
                        ? winner === 'white'
                          ? 'won'
                          : 'lost'
                        : 'won'
                    }
                    title={
                      isStalemate || winner === 'draw'
                        ? t.stalemate
                        : mode === 'ai'
                        ? winner === 'white'
                          ? t.youWon
                          : t.computerWon
                        : t.playerWon(winner === 'white' ? t.white : t.black)
                    }
                    subtitle={isCheckmate ? t.checkmate : t.gameOver}
                    isEink={isEink}
                    playAgainText={t.newGame}
                    onPlayAgain={resetGame}
                    playAgainId="chess-play-again-btn"
                  />
                )}
              </AnimatePresence>
            }
            controls={
              <ControlsBar className="chess-controls-bar">
                <Button
                  id="chess-new-game-btn"
                  variant="primary"
                  size="sm"
                  onClick={handleNewGameClick}
                >
                  {t.newGame}
                </Button>
                <Button
                  id="chess-change-mode-btn"
                  variant="secondary"
                  size="sm"
                  onClick={handleChangeModeClick}
                >
                  {t.changeMode}
                </Button>

                {mode === 'ai' && (
                  <PillGroup<ChessDifficulty>
                    label={t.difficultyLabel}
                    size="sm"
                    options={DIFFICULTIES.map(d => ({
                      value: d,
                      label: d === 'easy' ? t.difficultyEasy : d === 'medium' ? t.difficultyMedium : t.difficultyHard,
                      id: `chess-diff-${d}`,
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

      {/* Pawn Promotion Dialog */}
      {pendingPromotion && (
        <PromotionModal
          color={turn}
          locale={locale}
          isEink={isEink}
          onSelect={choosePromotion}
        />
      )}

      {/* Reset Confirmation Modal */}
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
        confirmId="chess-modal-confirm"
        cancelId="chess-modal-cancel"
        onConfirm={handleConfirmAction}
      />
    </div>
  )
}
export default Chess
