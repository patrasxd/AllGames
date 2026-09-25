import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMemory } from './hooks/useMemory'
import { MemoryBoard } from './components/MemoryBoard'
import type { GameComponentProps, MemoryDifficulty, MemoryGameMode } from './types'
import { memoryTranslations } from './i18n'
import { BoardLayout, ConfirmDialog, Button, PillGroup, ControlsBar, ModeSelect, StatsHeader, formatTime } from '@all/ui'
import { GameResultOverlay, SinglePlayerIcon, TwoPlayersIcon } from '@allgames/ui'
import './styles/memory.css'

const DIFFICULTIES: MemoryDifficulty[] = ['easy', 'medium', 'hard']

export function Memory({ setHeader, setIsActive, locale = 'en', isEink = false }: GameComponentProps) {
  const [hasChosenMode, setHasChosenMode] = useState(false)
  const [pendingAction, setPendingAction] = useState<
    { type: 'difficulty'; value: MemoryDifficulty } | { type: 'mode' } | { type: 'newGame' } | null
  >(null)

  const t = memoryTranslations[locale] || memoryTranslations.en

  const {
    cards,
    difficulty,
    mode,
    scores,
    moves,
    matchedPairsCount,
    totalPairs,
    currentTurn,
    gameStatus,
    elapsedSeconds,
    bestScore,
    setDifficulty,
    changeMode,
    handleCardClick,
    resetGame,
    resetBest,
  } = useMemory({ isEink })

  const isGameActive = hasChosenMode && (moves > 0 || gameStatus === 'playing') && gameStatus !== 'ended'

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

    if (mode === '2p') {
      setHeader(
        <StatsHeader
          label={t.stats}
          items={[
            { key: 'p1', label: 'P1', value: scores.p1 },
            { key: 'p2', label: 'P2', value: scores.p2 },
            { key: 'pairs', label: t.pairs, value: `${matchedPairsCount}/${totalPairs}` },
          ]}
        />,
      )
      return
    }

    setHeader(
      <StatsHeader
        label={t.record}
        items={[
          { key: 'best', label: t.best, value: bestScore ? `${bestScore.moves}m` : '--' },
          { key: 'moves', label: t.moves, value: moves },
          { key: 'pairs', label: t.pairs, value: `${matchedPairsCount}/${totalPairs}` },
          { key: 'time', label: t.time, value: formatTime(elapsedSeconds) },
        ]}
        onReset={bestScore !== null ? resetBest : undefined}
        resetAriaLabel={t.resetStatsAria}
        resetId="memory-reset-best-btn"
      />,
    )
  }, [
    setHeader,
    hasChosenMode,
    mode,
    scores,
    matchedPairsCount,
    totalPairs,
    bestScore,
    moves,
    elapsedSeconds,
    t,
    resetBest,
  ])

  useEffect(() => {
    renderHeader()
  }, [renderHeader])

  useEffect(() => {
    return () => setHeader?.(null)
  }, [setHeader])

  const handleModeSelect = (m: MemoryGameMode) => {
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

  const handleDifficultyClick = (d: MemoryDifficulty) => {
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
    <div className="memory-root">
      <AnimatePresence mode="wait">
        {!hasChosenMode ? (
          <motion.div
            key="mode-select"
            {...pageVariants}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <ModeSelect<MemoryGameMode>
              label={t.chooseMode}
              options={[
                {
                  id: '1p',
                  title: t.onePlayer,
                  desc: t.onePlayerDesc,
                  icon: <SinglePlayerIcon />,
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
          <motion.div key="game" className="memory-game" {...pageVariants}>
            <BoardLayout
              variant="square"
              hud={
                <div className="memory-status" aria-live="polite">
                  {gameStatus === 'ended' ? (
                    <>
                      <div className="memory-status-text">
                        {mode === '2p'
                          ? scores.p1 === scores.p2
                            ? t.draw
                            : t.playerWon(scores.p1 > scores.p2 ? t.player1 : t.player2)
                          : t.youWon}
                      </div>
                      <div className="memory-status-sub">
                        {mode === '2p'
                          ? `${t.player1}: ${scores.p1} · ${t.player2}: ${scores.p2}`
                          : `${t.moves}: ${moves} · ${t.time}: ${formatTime(elapsedSeconds)}`}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="memory-status-text">
                        {mode === '2p' ? t.turn2p(currentTurn === 'p1' ? t.player1 : t.player2) : t.turn1p}
                      </div>
                      <div className="memory-status-sub">
                        {t.pairs}: {matchedPairsCount} / {totalPairs}
                      </div>
                    </>
                  )}
                </div>
              }
              board={
                <MemoryBoard cards={cards} difficulty={difficulty} isEink={isEink} onCardClick={handleCardClick} />
              }
              overlay={
                <AnimatePresence>
                  {gameStatus === 'ended' && (
                    <GameResultOverlay
                      status={mode === '2p' ? (scores.p1 === scores.p2 ? 'draw' : 'won') : 'won'}
                      title={
                        mode === '2p'
                          ? scores.p1 === scores.p2
                            ? t.draw
                            : t.playerWon(scores.p1 > scores.p2 ? t.player1 : t.player2)
                          : t.youWon
                      }
                      subtitle={
                        mode === '2p' ? undefined : bestScore && moves <= bestScore.moves ? t.newBest : undefined
                      }
                      isEink={isEink}
                      playAgainText={t.newGame}
                      onPlayAgain={() => resetGame()}
                      playAgainId="memory-play-again-btn"
                      stats={
                        mode === '2p'
                          ? [
                              { label: t.player1, value: scores.p1 },
                              { label: t.player2, value: scores.p2 },
                            ]
                          : [
                              { label: t.moves, value: moves },
                              { label: t.time, value: formatTime(elapsedSeconds) },
                              ...(bestScore ? [{ label: t.best, value: `${bestScore.moves}m` }] : []),
                            ]
                      }
                    />
                  )}
                </AnimatePresence>
              }
              controls={
                <ControlsBar className="memory-controls-bar">
                  <Button id="memory-new-game-btn" variant="primary" size="sm" onClick={handleNewGameClick}>
                    {t.newGame}
                  </Button>
                  <Button id="memory-change-mode-btn" variant="secondary" size="sm" onClick={handleChangeModeClick}>
                    {t.changeMode}
                  </Button>

                  <PillGroup<MemoryDifficulty>
                    label={t.difficultyLabel}
                    size="sm"
                    options={DIFFICULTIES.map((d) => ({
                      value: d,
                      label: d === 'easy' ? t.easy : d === 'medium' ? t.medium : t.hard,
                      id: `memory-diff-${d}`,
                    }))}
                    value={difficulty}
                    onChange={handleDifficultyClick}
                  />
                </ControlsBar>
              }
            />

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
              confirmId="memory-modal-confirm"
              cancelId="memory-modal-cancel"
              onConfirm={handleConfirmAction}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
export default Memory
