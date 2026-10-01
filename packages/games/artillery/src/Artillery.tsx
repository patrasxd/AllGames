import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useArtillery } from './hooks/useArtillery'
import { ArtilleryCanvas } from './components/ArtilleryCanvas'
import { ArtilleryFooterBar } from './components/ArtilleryHUD'
import type { GameComponentProps, GameMode, DifficultyLevel } from './types'
import { artilleryTranslations } from './i18n'
import { FullBleedLayout, ConfirmDialog, ModeSelect, StatsHeader } from '@all/ui'
import { GameResultOverlay, ComputerIcon, TwoPlayersIcon } from '@allgames/ui'
import './styles/artillery.css'

export function Artillery({
  setHeader,
  setIsActive,
  locale = 'en',
  isEink = false,
  theme = 'dark',
}: GameComponentProps) {
  const t = artilleryTranslations[locale] || artilleryTranslations.en

  const [hasChosenMode, setHasChosenMode] = useState<boolean>(false)
  const [pendingConfirm, setPendingConfirm] = useState<'mode' | 'newGame' | null>(null)
  // Difficulty picked while a match is running; applied (with a fresh map) once the player confirms.
  const [pendingDifficulty, setPendingDifficulty] = useState<DifficultyLevel | null>(null)

  const {
    matchId,
    mode,
    difficulty,
    phase,
    currentTurn,
    wind,
    winner,
    tanks,
    terrain,
    projectiles,
    explosions,
    floatingTexts,
    stats,
    isAiThinking,
    screenShake,
    screenShakeRef,
    engineRef,
    setAngle,
    setSelectedWeapon,
    fire,
    startMatch,
    resetStats,
  } = useArtillery({ isEink })

  const isGameInProgress = hasChosenMode && phase !== 'game_over'

  // Notify shell of active game session
  useEffect(() => {
    setIsActive?.(isGameInProgress)
    return () => setIsActive?.(false)
  }, [setIsActive, isGameInProgress])

  // Prevent accidental tab close/reload during active game
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isGameInProgress) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isGameInProgress])

  // Inject Scoreboard Header into App Shell Navbar without label: 0 YOU · 0 D · 0 AI
  const renderHeader = useCallback(() => {
    if (!setHeader) return
    if (!hasChosenMode) {
      setHeader(null)
      return
    }

    const isAI = mode === 'ai'
    setHeader(
      <StatsHeader
        label=""
        items={[
          { key: 'p1', label: isAI ? t.you : t.p1, value: stats.p1Wins },
          { key: 'draws', label: t.drawShort, value: stats.draws },
          { key: 'p2', label: isAI ? t.ai : t.p2, value: stats.p2Wins },
        ]}
        onReset={resetStats}
        resetAriaLabel="Reset score"
      />,
    )
  }, [setHeader, hasChosenMode, mode, stats, t, resetStats])

  useEffect(() => {
    renderHeader()
  }, [renderHeader])

  useEffect(() => {
    return () => setHeader?.(null)
  }, [setHeader])

  // Mode Selection handler
  const handleSelectMode = (newMode: GameMode) => {
    startMatch(newMode, difficulty)
    setHasChosenMode(true)
  }

  // Confirm flow for Reset / Mode change
  const handleRequestChangeMode = () => {
    if (isGameInProgress) {
      setPendingConfirm('mode')
    } else {
      setHasChosenMode(false)
    }
  }

  const handleRequestNewGame = () => {
    if (isGameInProgress) {
      setPendingConfirm('newGame')
    } else {
      startMatch(mode, difficulty)
    }
  }

  // Difficulty sets the wind range and how far apart the tanks spawn, so changing it needs a fresh map.
  const handleRequestDifficulty = (next: DifficultyLevel) => {
    if (next === difficulty) return
    if (isGameInProgress) {
      setPendingDifficulty(next)
      setPendingConfirm('newGame')
    } else {
      startMatch(mode, next)
    }
  }

  const handleConfirmAction = () => {
    if (pendingConfirm === 'mode') {
      setHasChosenMode(false)
    } else if (pendingConfirm === 'newGame') {
      startMatch(mode, pendingDifficulty ?? difficulty)
    }
    setPendingDifficulty(null)
    setPendingConfirm(null)
  }

  const handleCancelAction = () => {
    setPendingDifficulty(null)
    setPendingConfirm(null)
  }

  const activeTank = tanks[currentTurn]

  const windText = wind === 0 ? t.windCalm : wind < 0 ? t.windLeft(Math.abs(wind)) : t.windRight(wind)

  const isP1 = currentTurn === 'p1'
  const turnTitle = isAiThinking
    ? t.aiThinking
    : mode === 'ai'
      ? isP1
        ? t.yourTurn
        : t.aiTurn
      : isP1
        ? t.yourTurn
        : t.p2Turn

  const isDarkTheme = theme !== 'light' && theme !== 'e-ink-light'

  return (
    <div
      className={`artillery-root ${isDarkTheme ? 'artillery-root--dark' : 'artillery-root--light'}`}
      data-theme={theme}
      data-eink={isEink ? 'true' : undefined}
    >
      <AnimatePresence mode="wait">
        {!hasChosenMode ? (
          <motion.div
            key="mode-select"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.18 } }}
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
              onSelect={handleSelectMode}
            />
          </motion.div>
        ) : (
          <FullBleedLayout
            className="artillery-fullbleed-layout"
            footer={
              <ArtilleryFooterBar
                t={t}
                difficulty={difficulty}
                onDifficultyChange={handleRequestDifficulty}
                onChangeMode={handleRequestChangeMode}
                onNewGame={handleRequestNewGame}
              />
            }
            overlay={
              <AnimatePresence>
                {phase === 'game_over' && (
                  <GameResultOverlay
                    status={winner === 'draw' ? 'draw' : mode === 'ai' && winner === 'p2' ? 'lost' : 'won'}
                    title={
                      winner === 'draw'
                        ? t.drawResult
                        : mode === 'ai'
                          ? winner === 'p1'
                            ? t.p1Victory
                            : t.aiVictory
                          : winner === 'p1'
                            ? t.p1Victory
                            : t.p2Victory
                    }
                    subtitle={t.gameOverTitle}
                    isEink={isEink}
                    playAgainText={t.rematch}
                    onPlayAgain={() => startMatch(mode, difficulty)}
                    playAgainId="artillery-play-again-btn"
                    stats={[
                      { label: t.round, value: stats.roundsPlayed },
                      {
                        label: mode === 'ai' ? t.you : 'P1 Wins',
                        value: stats.p1Wins,
                      },
                      {
                        label: mode === 'ai' ? t.ai : 'P2 Wins',
                        value: stats.p2Wins,
                      },
                    ]}
                  />
                )}
              </AnimatePresence>
            }
          >
            <ArtilleryCanvas
              matchId={matchId}
              tanks={tanks}
              terrain={terrain}
              projectiles={projectiles}
              explosions={explosions}
              floatingTexts={floatingTexts}
              currentTurn={currentTurn}
              phase={phase}
              wind={wind}
              screenShake={screenShake}
              screenShakeRef={screenShakeRef}
              engineRef={engineRef}
              isEink={isEink}
              theme={theme}
              mode={mode}
              turnTitle={turnTitle}
              windText={windText}
              p2Label={t.ai}
              activeTank={activeTank}
              onAngleChange={setAngle}
              onFireWithPower={fire}
              onSelectWeapon={setSelectedWeapon}
              locale={locale}
              t={t}
            />
          </FullBleedLayout>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog for Leaving or Resetting Match */}
      <ConfirmDialog
        open={Boolean(pendingConfirm)}
        title={t.confirmResetTitle}
        description={t.confirmResetDesc}
        confirmLabel={t.confirmBtn}
        cancelLabel={t.cancelBtn}
        confirmVariant="danger"
        confirmId="artillery-confirm-reset-btn"
        cancelId="artillery-cancel-reset-btn"
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />
    </div>
  )
}

export default Artillery
