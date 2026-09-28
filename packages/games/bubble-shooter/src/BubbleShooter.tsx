import { useEffect, useCallback, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useBubbleShooter } from './hooks/useBubbleShooter'
import { BubbleShooterCanvas } from './components/BubbleShooterCanvas'
import { AimControls } from './components/AimControls'
import type { GameComponentProps, Difficulty } from './types'
import { bubbleShooterTranslations } from './i18n'
import { Button, ConfirmDialog, ControlsBar, FullBleedLayout, PillGroup, StatsHeader } from '@all/ui'
import { GameResultOverlay, GameStartOverlay } from '@allgames/ui'
import './styles/bubble-shooter.css'

export function BubbleShooter({
  setHeader,
  setIsActive,
  locale = 'en',
  isEink = false,
  theme = 'dark',
}: GameComponentProps) {
  const t = bubbleShooterTranslations[locale] || bubbleShooterTranslations.en

  const {
    viewRef,
    isGameActive,
    difficulty,
    gameStatus,
    score,
    bestScore,
    isNewBest,
    aimAt,
    nudgeAim,
    shoot,
    startGame,
    resetGame,
    changeDifficulty,
  } = useBubbleShooter()

  // Tell the shell a game is running so leaving the page asks for confirmation, like the other games.
  useEffect(() => {
    setIsActive?.(isGameActive)
    return () => setIsActive?.(false)
  }, [isGameActive, setIsActive])

  // "New game" and difficulty changes both throw away a running game, so they ask first.
  const [pendingAction, setPendingAction] = useState<
    { type: 'newGame' } | { type: 'difficulty'; difficulty: Difficulty } | null
  >(null)

  const requestNewGame = () => {
    if (isGameActive) setPendingAction({ type: 'newGame' })
    else resetGame()
  }

  const requestDifficulty = (next: Difficulty) => {
    if (next === difficulty) return
    if (isGameActive) setPendingAction({ type: 'difficulty', difficulty: next })
    else changeDifficulty(next)
  }

  const confirmPending = () => {
    if (pendingAction?.type === 'newGame') resetGame()
    else if (pendingAction?.type === 'difficulty') changeDifficulty(pendingAction.difficulty)
    setPendingAction(null)
  }

  const renderHeader = useCallback(() => {
    if (!setHeader) return
    setHeader(
      <StatsHeader
        label={t.gameTitle}
        items={[
          { key: 'score', label: t.score, value: score },
          { key: 'best', label: t.bestScore, value: bestScore },
        ]}
      />,
    )
  }, [setHeader, t, score, bestScore])

  useEffect(() => {
    renderHeader()
  }, [renderHeader])

  useEffect(() => {
    return () => setHeader?.(null)
  }, [setHeader])

  const resultStats = [
    { label: t.score, value: score },
    { label: t.bestScore, value: bestScore },
    { label: t.difficulty, value: t.difficultyLabels[difficulty] },
  ]

  return (
    <>
      <FullBleedLayout
        footer={
          <>
            <AimControls
              disabled={gameStatus !== 'aiming'}
              labels={{ fire: t.fire, left: t.aimLeft, right: t.aimRight }}
              onNudge={nudgeAim}
              onFire={() => shoot()}
            />
            <ControlsBar className="bs-footer-bar">
              <Button id="bubble-shooter-new-game-btn" variant="secondary" size="sm" onClick={requestNewGame}>
                {t.newGame}
              </Button>
              <PillGroup
                label={t.difficulty}
                size="sm"
                value={difficulty}
                onChange={(diff) => requestDifficulty(diff as Difficulty)}
                options={(['easy', 'normal', 'hard'] as Difficulty[]).map((diff) => ({
                  value: diff,
                  label: t.difficultyLabels[diff],
                }))}
              />
            </ControlsBar>
          </>
        }
        overlay={
          <AnimatePresence>
            {gameStatus === 'ready' && (
              <GameStartOverlay
                title={t.gameTitle}
                subtitle={t.readySubPrompt}
                startText={t.startBtn}
                onStart={startGame}
                startId="bs-start-btn"
                isEink={isEink}
              />
            )}

            {(gameStatus === 'won' || gameStatus === 'lost') && (
              <GameResultOverlay
                status={gameStatus}
                title={isNewBest ? t.newBest : gameStatus === 'won' ? t.wonTitle : t.lostTitle}
                subtitle={gameStatus === 'won' ? t.wonSub : t.lostSub}
                isEink={isEink}
                playAgainText={t.restart}
                onPlayAgain={resetGame}
                playAgainId="bs-play-again-btn"
                stats={resultStats}
              />
            )}
          </AnimatePresence>
        }
      >
        <BubbleShooterCanvas viewRef={viewRef} isEink={isEink} theme={theme} onAim={aimAt} onShoot={shoot} />
      </FullBleedLayout>

      <ConfirmDialog
        open={pendingAction !== null}
        title={t.confirmTitle}
        description={pendingAction?.type === 'difficulty' ? t.confirmDifficultyDesc : t.confirmNewGameDesc}
        confirmLabel={t.confirmBtn}
        cancelLabel={t.cancelBtn}
        confirmVariant="danger"
        confirmId="bubble-shooter-confirm-btn"
        cancelId="bubble-shooter-cancel-btn"
        onConfirm={confirmPending}
        onCancel={() => setPendingAction(null)}
      />
    </>
  )
}

export default BubbleShooter
