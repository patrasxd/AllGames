import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMemory } from './hooks/useMemory'
import { MemoryBoard } from './components/MemoryBoard'
import type { GameComponentProps, MemoryDifficulty, MemoryGameMode } from './types'
import { memoryTranslations } from './i18n'
import { ModeSelect, StatsHeader, GameModal, PillGroup, GameButton, ControlsBar, SinglePlayerIcon, TwoPlayersIcon, formatTime } from '@allgames/ui'
import './styles/memory.css'

const DIFFICULTIES: MemoryDifficulty[] = ['easy', 'medium', 'hard']

export function Memory({ setHeader, locale = 'en', isEink = false }: GameComponentProps) {
  const [hasChosenMode, setHasChosenMode] = useState(false)
  const [pendingAction, setPendingAction] = useState<
    { type: 'difficulty'; value: MemoryDifficulty } | { type: 'mode' } | null
  >(null)

  const t = memoryTranslations[locale] || memoryTranslations.en
  const isPl = locale === 'pl'

  const {
    cards,
    difficulty,
    mode,
    moves,
    matchedPairsCount,
    totalPairs,
    elapsedSeconds,
    currentTurn,
    scores,
    gameStatus,
    bestScore,
    handleCardClick,
    resetGame,
    setDifficulty,
    changeMode,
    resetBest,
  } = useMemory({ isEink })

  const isGameActive = moves > 0 && gameStatus !== 'ended'

  const renderHeader = useCallback(() => {
    if (!setHeader) return
    if (!hasChosenMode) {
      setHeader(null)
      return
    }

    if (mode === '2p') {
      setHeader(
        <StatsHeader
          label={isPl ? 'Statystyki' : 'Stats'}
          items={[
            { key: 'p1', label: 'P1', value: scores.p1 },
            { key: 'p2', label: 'P2', value: scores.p2 },
            { key: 'pairs', label: isPl ? 'Pary' : 'Pairs', value: `${matchedPairsCount}/${totalPairs}` },
          ]}
        />
      )
      return
    }

    setHeader(
      <StatsHeader
        label={isPl ? 'Rekord' : 'Record'}
        items={[
          { key: 'best', label: isPl ? 'Rekord' : 'Best', value: bestScore ? `${bestScore.moves}m` : '--' },
          { key: 'moves', label: isPl ? 'Ruchy' : 'Moves', value: moves },
          { key: 'pairs', label: isPl ? 'Pary' : 'Pairs', value: `${matchedPairsCount}/${totalPairs}` },
          { key: 'time', label: isPl ? 'Czas' : 'Time', value: formatTime(elapsedSeconds) },
        ]}
        onReset={bestScore !== null ? resetBest : undefined}
        resetAriaLabel={isPl ? 'Resetuj rekord' : 'Reset record'}
        resetId="memory-reset-best-btn"
      />
    )
  }, [setHeader, hasChosenMode, mode, scores, matchedPairsCount, totalPairs, bestScore, moves, elapsedSeconds, isPl, resetBest])

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
            {/* Status indicator */}
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
                    {mode === '2p'
                      ? t.turn2p(currentTurn === 'p1' ? t.player1 : t.player2)
                      : t.turn1p}
                  </div>
                  <div className="memory-status-sub">
                    {t.pairs}: {matchedPairsCount} / {totalPairs}
                  </div>
                </>
              )}
            </div>

            {/* Grid of Cards */}
            <MemoryBoard
              cards={cards}
              difficulty={difficulty}
              isEink={isEink}
              onCardClick={handleCardClick}
            />

            {/* Controls Bar */}
            <ControlsBar>
              <GameButton
                id="memory-new-game-btn"
                variant="primary"
                onClick={() => resetGame()}
              >
                {t.newGame}
              </GameButton>
              <GameButton
                id="memory-change-mode-btn"
                onClick={handleChangeModeClick}
              >
                {t.changeMode}
              </GameButton>

              <PillGroup<MemoryDifficulty>
                label={t.difficultyLabel}
                options={DIFFICULTIES.map(d => ({
                  value: d,
                  label: d === 'easy' ? t.easy : d === 'medium' ? t.medium : t.hard,
                  id: `memory-diff-${d}`,
                }))}
                value={difficulty}
                onChange={handleDifficultyClick}
              />
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
                  cancelId="memory-modal-cancel"
                  confirmId="memory-modal-confirm"
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
export default Memory
