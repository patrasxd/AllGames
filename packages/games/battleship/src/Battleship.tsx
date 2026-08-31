import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBattleship } from './hooks/useBattleship'
import { Grid10x10 } from './components/Grid10x10'
import { PlacementControls } from './components/PlacementControls'
import type { GameComponentProps, BattleshipDifficulty, BattleshipMode, Locale } from './types'
import { battleshipTranslations } from './i18n'
import { ModeSelect, StatsHeader, GameModal, PillGroup, GameButton, ControlsBar, ComputerIcon, TwoPlayersIcon } from '@allgames/ui'
import './styles/battleship.css'

const DIFFICULTIES: BattleshipDifficulty[] = ['easy', 'medium', 'hard']

export function Battleship({ setHeader, locale = 'en', isEink = false }: GameComponentProps) {
  const [hasChosenMode, setHasChosenMode] = useState(false)
  const [pendingAction, setPendingAction] = useState<
    { type: 'difficulty'; value: BattleshipDifficulty } | { type: 'mode' } | null
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

  const isBattleActive = phase === 'battle' && p1Shots > 0 && winner === null
  const p2Hits = p1State.grid.flat().filter(c => c === 'hit' || c === 'sunk').length

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
    }
    setPendingAction(null)
  }

  const handleCancelAction = () => {
    setPendingAction(null)
  }

  const currentPlacementState = activePlacementPlayer === 'p1' ? p1State : p2State

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
        ) : phase === 'placement' ? (
          <motion.div
            key="placement"
            className="bs-game"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
          >
            <div className="bs-status">
              <div className="bs-status-text">
                {mode === '2p' && activePlacementPlayer === 'p2'
                  ? t.player2Fleet
                  : t.placementPhase}
              </div>
              <div className="bs-status-sub">{t.placementDesc}</div>
            </div>

            <Grid10x10
              grid={currentPlacementState.grid}
              ships={currentPlacementState.ships}
              isEnemy={false}
              isInteractive={false}
              title={mode === '2p' && activePlacementPlayer === 'p2' ? t.player2Fleet : t.yourFleet}
              isEink={isEink}
            />

            <PlacementControls
              locale={locale}
              hasShips={currentPlacementState.ships.length > 0}
              onAutoDeploy={autoDeployCurrent}
              onClear={clearCurrent}
              onStart={confirmPlacementAndStart}
            />
          </motion.div>
        ) : (
          <motion.div
            key="battle"
            className="bs-game"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Status Bar */}
            <div className="bs-status">
              <div className="bs-status-text">
                {winner !== null
                  ? mode === 'ai'
                    ? winner === 'p1'
                      ? t.youWon
                      : t.youLost
                    : t.playerWon(winner === 'p1' ? 'Gracz 1' : 'Gracz 2')
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
                  : mode === 'ai'
                  ? `${t.difficultyLabel}: ${difficulty.toUpperCase()}`
                  : `${t.player1Turn} vs ${t.player2Turn}`}
              </div>
            </div>

            {/* Dual Radar Grids */}
            <div className="bs-boards-row">
              <Grid10x10
                grid={p1State.grid}
                ships={p1State.ships}
                isEnemy={false}
                isInteractive={false}
                title={mode === '2p' ? t.player1Fleet : t.yourFleet}
                isEink={isEink}
              />

              <Grid10x10
                grid={p2State.grid}
                ships={p2State.ships}
                isEnemy={true}
                isInteractive={winner === null && !isAIThinking && currentTurn === 'p1'}
                title={mode === '2p' ? t.player2Fleet : t.enemyWaters}
                isEink={isEink}
                onCellClick={handleFire}
              />
            </div>

            {/* Controls Bar */}
            <ControlsBar>
              <GameButton
                id="bs-new-game-btn"
                variant="primary"
                onClick={() => resetGame()}
              >
                {t.newGame}
              </GameButton>

              <GameButton
                id="bs-change-mode-btn"
                onClick={handleChangeModeClick}
              >
                {t.changeMode}
              </GameButton>

              {mode === 'ai' && (
                <PillGroup
                  label={t.difficultyLabel}
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
                  cancelId="bs-modal-cancel"
                  confirmId="bs-modal-confirm"
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
export default Battleship
