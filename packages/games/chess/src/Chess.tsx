import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChess } from './hooks/useChess'
import { ChessBoard } from './components/ChessBoard'
import { PromotionModal } from './components/PromotionModal'
import type { GameComponentProps, ChessGameMode, Locale, ChessDifficulty } from './types'
import { chessTranslations } from './i18n'
import { BoardLayout, Dialog, Button } from '@all/ui'
import { ModeSelect, StatsHeader, PillGroup, ControlsBar, ComputerIcon, TwoPlayersIcon } from '@allgames/ui'
import './styles/chess.css'

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

const DIFFICULTIES: ChessDifficulty[] = ['easy', 'medium', 'hard']

export function Chess({ setHeader, locale = 'en', isEink = false }: GameComponentProps) {
  const [hasChosenMode, setHasChosenMode] = useState(false)
  const [pendingAction, setPendingAction] = useState<
    { type: 'difficulty'; value: ChessDifficulty } | { type: 'mode' } | null
  >(null)

  const t = chessTranslations[locale] || chessTranslations.en
  const isPl = locale === 'pl'

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

  const isGameActive = (selectedCoord !== null || winner !== null || isCheckmate)

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
        resetId="chess-reset-stats-btn"
      />
    )
  }, [setHeader, hasChosenMode, mode, stats, isPl, resetStats])

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
          <motion.div key="game" className="chess-game" {...pageVariants}>
            <BoardLayout
              variant="square"
              hud={
                <div className="chess-status" aria-live="polite">
                  {isCheckmate ? (
                    <>
                      <div className="chess-status-text">
                        {mode === 'ai'
                          ? turn === 'black'
                            ? t.youWon
                            : t.computerWon
                          : t.playerWon(turn === 'black' ? t.white : t.black)}
                      </div>
                      <div className="chess-status-sub">{t.checkmate}</div>
                    </>
                  ) : isStalemate ? (
                    <>
                      <div className="chess-status-text">{t.stalemate}</div>
                      <div className="chess-status-sub">{t.gameOver}</div>
                    </>
                  ) : isAIThinking ? (
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
              controls={
                <ControlsBar>
                  <Button
                    id="chess-new-game-btn"
                    variant="primary"
                    onClick={resetGame}
                  >
                    {t.newGame}
                  </Button>
                  <Button
                    id="chess-change-mode-btn"
                    variant="secondary"
                    onClick={handleChangeModeClick}
                  >
                    {t.changeMode}
                  </Button>

                  {mode === 'ai' && (
                    <PillGroup<ChessDifficulty>
                      label={t.difficultyLabel}
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

            {/* Pawn Promotion Dialog */}
            {pendingPromotion && (
              <PromotionModal
                color={turn}
                locale={locale}
                onSelect={choosePromotion}
              />
            )}

            {/* Reset Confirmation Modal */}
            <Dialog
              isOpen={Boolean(pendingAction)}
              onClose={handleCancelAction}
              title={t.confirmResetTitle}
              description={
                pendingAction?.type === 'difficulty'
                  ? t.confirmDifficultyDesc
                  : t.confirmModeDesc
              }
            >
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <Button
                  id="chess-modal-cancel"
                  variant="secondary"
                  onClick={handleCancelAction}
                >
                  {t.cancelBtn}
                </Button>
                <Button
                  id="chess-modal-confirm"
                  variant="primary"
                  onClick={handleConfirmAction}
                >
                  {t.confirmBtn}
                </Button>
              </div>
            </Dialog>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
export default Chess
