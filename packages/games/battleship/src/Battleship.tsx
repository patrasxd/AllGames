import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBattleship } from './hooks/useBattleship'
import { Grid10x10 } from './components/Grid10x10'
import { PlacementControls } from './components/PlacementControls'
import type { GameComponentProps, BattleshipDifficulty, BattleshipMode } from './types'
import { battleshipTranslations } from './i18n'
import {
  BoardLayout,
  ConfirmDialog,
  Button,
  PillGroup,
  ControlsBar,
  StatsHeader,
  ModeSelect,
} from '@all/ui'
import {
  GameResultOverlay,
  ComputerIcon,
  TwoPlayersIcon,
} from '@allgames/ui'
import './styles/battleship.css'

const DIFFICULTIES: BattleshipDifficulty[] = ['easy', 'medium', 'hard']

export function Battleship({ setHeader, setIsActive, locale = 'en', isEink = false }: GameComponentProps) {
  const [hasChosenMode, setHasChosenMode] = useState(false)
  const [pendingAction, setPendingAction] = useState<
    { type: 'difficulty'; value: BattleshipDifficulty } | { type: 'mode' } | { type: 'newGame' } | null
  >(null)

  const t = battleshipTranslations[locale] || battleshipTranslations.en
  const isPl = locale === 'pl'

  const {
    mode,
    difficulty,
    phase,
    p1State,
    p2State,
    activePlacementPlayer,
    currentTurn,
    winner,
    isAIThinking,
    lastShotInfo,
    turnCountdown,
    passDevicePlayer,
    p1Shots,
    p1Hits,
    bestShots,
    setDifficulty,
    changeMode,
    autoDeployCurrent,
    clearCurrent,
    confirmPlacementAndStart,
    handleFire,
    resetGame,
    resetBest,
  } = useBattleship({ isEink })

  // Active game session condition for leave confirmation and status
  const isBattleActive =
    (phase === 'battle' ||
      (phase === 'placement' && (p1State.ships.length > 0 || p2State.ships.length > 0))) &&
    winner === null

  const p2Hits = p1State.grid.flat().filter(c => c === 'hit' || c === 'sunk').length

  // Notify shell of active game session (triggers shell leave confirmation dialog)
  useEffect(() => {
    setIsActive?.(isBattleActive)
    return () => setIsActive?.(false)
  }, [isBattleActive, setIsActive])

  // Native beforeunload protection when battle is active
  useEffect(() => {
    if (!isBattleActive) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isBattleActive])

  const renderHeader = useCallback(() => {
    if (!setHeader) return
    if (!hasChosenMode || phase === 'placement') {
      setHeader(null)
      return
    }

    if (mode === '2p') {
      setHeader(
        <StatsHeader
          label={isPl ? 'Statystyki' : 'Stats'}
          items={[
            { key: 'p1', label: 'P1', value: `${p1Hits}/20` },
            { key: 'p2', label: 'P2', value: `${p2Hits}/20` },
          ]}
        />
      )
      return
    }

    setHeader(
      <StatsHeader
        label={isPl ? 'Rekord' : 'Record'}
        items={[
          { key: 'best', label: isPl ? 'Rekord' : 'Best', value: bestShots ?? '--' },
          { key: 'shots', label: isPl ? 'Strzały' : 'Shots', value: p1Shots },
          { key: 'hits', label: isPl ? 'Trafienia' : 'Hits', value: `${p1Hits}/20` },
        ]}
        onReset={bestShots !== null ? resetBest : undefined}
        resetAriaLabel={isPl ? 'Resetuj rekord' : 'Reset record'}
        resetId="bs-reset-best-btn"
      />
    )
  }, [setHeader, hasChosenMode, phase, mode, p1Shots, p1Hits, bestShots, p2Hits, isPl, resetBest])

  useEffect(() => {
    renderHeader()
  }, [renderHeader])

  useEffect(() => {
    return () => setHeader?.(null)
  }, [setHeader])

  const handleModeSelect = (m: BattleshipMode) => {
    changeMode(m)
    setHasChosenMode(true)
  }

  const handleNewGameClick = () => {
    if (isBattleActive) {
      setPendingAction({ type: 'newGame' })
    } else {
      resetGame()
    }
  }

  const handleChangeModeClick = () => {
    if (isBattleActive) {
      setPendingAction({ type: 'mode' })
    } else {
      setHasChosenMode(false)
      resetGame()
    }
  }

  const handleDifficultyClick = (d: BattleshipDifficulty) => {
    if (d === difficulty) return
    if (isBattleActive) {
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

  const currentPlacementState = activePlacementPlayer === 'p1' ? p1State : p2State
  const playerViewTurn = mode === '2p' && currentTurn === 'p2'
  const leftBoardState = playerViewTurn ? p2State : p1State
  const rightBoardState = playerViewTurn ? p1State : p2State
  const leftBoardTitle = mode === '2p' ? (playerViewTurn ? t.player2Fleet : t.player1Fleet) : t.yourFleet
  const rightBoardTitle = mode === '2p' ? (playerViewTurn ? t.player1Fleet : t.player2Fleet) : t.enemyWaters
  const isEnemyBoardInteractive =
    winner === null && !isAIThinking && turnCountdown === null && (mode === 'ai' ? currentTurn === 'p1' : true)
  const handoffPlayerLabel =
    passDevicePlayer === 'p1'
      ? isPl ? 'Gracz 1' : 'Player 1'
      : passDevicePlayer === 'p2'
      ? isPl ? 'Gracz 2' : 'Player 2'
      : currentTurn === 'p1'
      ? isPl ? 'Gracz 1' : 'Player 1'
      : isPl ? 'Gracz 2' : 'Player 2'
  const isPassDeviceVisible = passDevicePlayer !== null && turnCountdown !== null

  return (
    <div className="bs-root">
      <AnimatePresence mode="wait">
        {!hasChosenMode ? (
          <motion.div
            key="mode-select"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <ModeSelect<BattleshipMode>
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
        ) : phase === 'placement' ? (
          <motion.div
            key="placement"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            style={{ width: '100%', height: '100%' }}
          >
            <BoardLayout
              variant="fluid"
              align="center"
              hud={
                !isPassDeviceVisible ? (
                  <div className="bs-status">
                    <div className="bs-status-text">
                      {mode === '2p' && activePlacementPlayer === 'p2'
                        ? t.player2Fleet
                        : t.placementPhase}
                    </div>
                    <div className="bs-status-sub">{t.placementDesc}</div>
                  </div>
                ) : undefined
              }
              board={
                <div className="bs-placement-stage">
                  {isPassDeviceVisible ? (
                    <div className="bs-turn-handoff" aria-live="polite">
                      <div className="bs-turn-handoff__label">{isPl ? 'Przekaż urządzenie' : 'Pass device to'}</div>
                      <div className="bs-turn-handoff__player">{handoffPlayerLabel}</div>
                      <div className="bs-turn-handoff__timer">{turnCountdown}s</div>
                    </div>
                  ) : (
                    <Grid10x10
                      grid={currentPlacementState.grid}
                      ships={currentPlacementState.ships}
                      isEnemy={false}
                      isInteractive={false}
                      title={mode === '2p' && activePlacementPlayer === 'p2' ? t.player2Fleet : t.yourFleet}
                      isEink={isEink}
                    />
                  )}
                </div>
              }
              controls={
                !isPassDeviceVisible ? (
                  <PlacementControls
                    locale={locale}
                    hasShips={currentPlacementState.ships.length > 0}
                    onAutoDeploy={autoDeployCurrent}
                    onClear={clearCurrent}
                    onStart={confirmPlacementAndStart}
                  />
                ) : undefined
              }
            />
          </motion.div>
        ) : (
          <motion.div
            key="battle"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ width: '100%', height: '100%' }}
          >
            <BoardLayout
              variant="fluid"
              align="center"
              hud={
                !isPassDeviceVisible ? (
                  <div className="bs-status">
                    <div className="bs-status-text">
                      {winner !== null
                        ? mode === 'ai'
                          ? winner === 'p1'
                            ? t.youWon
                            : t.youLost
                          : t.playerWon(winner === 'p1' ? (isPl ? 'Gracz 1' : 'Player 1') : (isPl ? 'Gracz 2' : 'Player 2'))
                        : turnCountdown !== null
                        ? `${isPl ? 'Przekaż urządzenie do:' : 'Pass device to'} ${handoffPlayerLabel}`
                        : isAIThinking
                        ? t.computerTurn
                        : lastShotInfo
                        ? lastShotInfo.sunkShip
                          ? t.hitAndSunk(lastShotInfo.sunkShip.name)
                          : lastShotInfo.hit
                          ? t.hit
                          : t.miss
                        : mode === 'ai'
                        ? t.yourTurn
                        : currentTurn === 'p1'
                        ? t.player1Turn
                        : t.player2Turn}
                    </div>
                    <div className="bs-status-sub">
                      {winner !== null
                        ? `${t.shots}: ${p1Shots}`
                        : turnCountdown !== null
                        ? `${isPl ? 'Następna tura za' : 'Next turn in'} ${turnCountdown}s`
                        : mode === 'ai'
                        ? `${t.difficultyLabel}: ${difficulty.toUpperCase()}`
                        : `${t.player1Turn} vs ${t.player2Turn}`}
                    </div>
                  </div>
                ) : undefined
              }
              board={
                isPassDeviceVisible ? (
                  <div className="bs-turn-handoff" aria-live="polite">
                    <div className="bs-turn-handoff__label">{isPl ? 'Przekaż urządzenie' : 'Pass device to'}</div>
                    <div className="bs-turn-handoff__player">{handoffPlayerLabel}</div>
                    <div className="bs-turn-handoff__timer">{turnCountdown}s</div>
                  </div>
                ) : (
                  <div className="bs-boards-row">
                    <Grid10x10
                      grid={leftBoardState.grid}
                      ships={leftBoardState.ships}
                      isEnemy={false}
                      isInteractive={false}
                      title={leftBoardTitle}
                      isEink={isEink}
                      showShips={true}
                    />

                    <Grid10x10
                      grid={rightBoardState.grid}
                      ships={rightBoardState.ships}
                      isEnemy={true}
                      isInteractive={isEnemyBoardInteractive}
                      title={rightBoardTitle}
                      isEink={isEink}
                      showShips={false}
                      onCellClick={handleFire}
                    />
                  </div>
                )
              }
              controls={
                !isPassDeviceVisible ? (
                  <ControlsBar>
                    <Button
                      id="bs-new-game-btn"
                      variant="primary"
                      size="sm"
                      onClick={handleNewGameClick}
                    >
                      {t.newGame}
                    </Button>

                    <Button
                      id="bs-change-mode-btn"
                      variant="secondary"
                      size="sm"
                      onClick={handleChangeModeClick}
                    >
                      {t.changeMode}
                    </Button>

                    {mode === 'ai' && (
                      <PillGroup<BattleshipDifficulty>
                        label={t.difficultyLabel}
                        size="sm"
                        options={DIFFICULTIES.map(d => ({
                          value: d,
                          label: d === 'easy' ? t.easy : d === 'medium' ? t.medium : t.hard,
                          id: `bs-diff-${d}`,
                        }))}
                        value={difficulty}
                        onChange={handleDifficultyClick}
                      />
                    )}
                  </ControlsBar>
                ) : undefined
              }
              overlay={
                <AnimatePresence>
                  {winner !== null && (
                    <GameResultOverlay
                      status={mode === 'ai' ? (winner === 'p1' ? 'won' : 'lost') : 'won'}
                      title={
                        mode === 'ai'
                          ? winner === 'p1'
                            ? t.youWon
                            : t.youLost
                          : t.playerWon(winner === 'p1' ? (isPl ? 'Gracz 1' : 'Player 1') : (isPl ? 'Gracz 2' : 'Player 2'))
                      }
                      subtitle={isPl ? 'Bitwa zakończona' : 'Battle ended'}
                      isEink={isEink}
                      playAgainText={t.newGame}
                      onPlayAgain={resetGame}
                      playAgainId="bs-play-again-btn"
                      stats={
                        mode === 'ai'
                          ? [
                              { label: isPl ? 'Strzały' : 'Shots', value: p1Shots },
                              { label: isPl ? 'Trafienia' : 'Hits', value: `${p1Hits}/20` },
                              ...(bestShots !== null ? [{ label: isPl ? 'Rekord' : 'Best', value: bestShots }] : []),
                            ]
                          : [
                              { label: isPl ? 'Trafienia P1' : 'P1 Hits', value: `${p1Hits}/20` },
                              { label: isPl ? 'Trafienia P2' : 'P2 Hits', value: `${p2Hits}/20` },
                            ]
                      }
                    />
                  )}
                </AnimatePresence>
              }
            />

            {/* Reset Confirmation Modal */}
            <ConfirmDialog
              open={pendingAction !== null}
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
              confirmId="bs-modal-confirm"
              cancelId="bs-modal-cancel"
              onConfirm={handleConfirmAction}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
export default Battleship
