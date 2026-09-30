import { useEffect, useCallback, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useBallSort } from './hooks/useBallSort'
import { TubesBoard } from './components/TubesBoard'
import { LevelSelectModal } from './components/LevelSelectModal'
import type { GameComponentProps } from './types'
import { ballSortTranslations } from './i18n'
import { BoardLayout, Button, ConfirmDialog, ControlsBar, StatsHeader, UndoIcon } from '@all/ui'
import { GameResultOverlay, GameStartOverlay } from '@allgames/ui'
import './styles/ball-sort.css'

export function BallSort({ setHeader, setIsActive, locale = 'en', isEink = false }: GameComponentProps) {
  const t = ballSortTranslations[locale] || ballSortTranslations.en

  const {
    currentLevel,
    maxLevel,
    config,
    tubes,
    selected,
    moves,
    status,
    isNewBest,
    progress,
    isGameActive,
    lastMove,
    canUndo,
    selectTube,
    undo,
    restartLevel,
    nextLevel,
    goToLevel,
  } = useBallSort()

  const [levelSelectOpen, setLevelSelectOpen] = useState(false)
  const [confirmRestart, setConfirmRestart] = useState(false)

  useEffect(() => {
    setIsActive?.(isGameActive)
    return () => setIsActive?.(false)
  }, [isGameActive, setIsActive])

  const requestRestart = () => {
    if (isGameActive) setConfirmRestart(true)
    else restartLevel()
  }

  const renderHeader = useCallback(() => {
    if (!setHeader) return
    setHeader(
      <StatsHeader
        label={t.level(currentLevel)}
        items={[
          { key: 'moves', label: t.moves, value: moves },
          { key: 'best', label: t.best, value: progress.levelBestMoves[currentLevel] ?? '—' },
        ]}
      />,
    )
  }, [setHeader, t, currentLevel, moves, progress])

  useEffect(() => {
    renderHeader()
  }, [renderHeader])

  useEffect(() => {
    return () => setHeader?.(null)
  }, [setHeader])

  const [introSeen, setIntroSeen] = useState(false)

  const showIntro = currentLevel === 1 && moves === 0 && status === 'playing' && !introSeen

  return (
    <>
      <BoardLayout
        variant="fluid"
        align="center"
        board={
          <TubesBoard
            tubes={tubes}
            capacity={config.capacity}
            selected={selected}
            onSelect={selectTube}
            isEink={isEink}
            lastMove={lastMove}
          />
        }
        controls={
          <ControlsBar className="bs-controls-bar">
            <Button
              id="ball-sort-undo-btn"
              variant="secondary"
              size="sm"
              icon={<UndoIcon />}
              disabled={!canUndo}
              onClick={undo}
            >
              {t.undo}
            </Button>
            <Button id="ball-sort-restart-btn" variant="secondary" size="sm" onClick={requestRestart}>
              {t.reset}
            </Button>
            <Button id="ball-sort-levels-btn" variant="secondary" size="sm" onClick={() => setLevelSelectOpen(true)}>
              {t.levels}
            </Button>
          </ControlsBar>
        }
        overlay={
          <AnimatePresence>
            {showIntro && (
              <GameStartOverlay
                title={t.howToPlayTitle}
                subtitle={t.howToPlayBody}
                startText={t.startLevel}
                onStart={() => setIntroSeen(true)}
                startId="ball-sort-start-btn"
                isEink={isEink}
              />
            )}


            {status === 'won' && (
              <GameResultOverlay
                status="won"
                title={t.wonTitle}
                subtitle={isNewBest ? undefined : t.wonSub}
                isEink={isEink}
                playAgainText={currentLevel < maxLevel ? t.nextLevel : t.chooseLevel}
                onPlayAgain={currentLevel < maxLevel ? nextLevel : () => setLevelSelectOpen(true)}
                playAgainId="ball-sort-next-btn"
                secondaryAction={{
                  label: t.levels,
                  onClick: () => setLevelSelectOpen(true),
                  id: 'ball-sort-won-levels-btn',
                }}
                stats={[
                  { label: t.moves, value: moves },
                  {
                    label: t.level(currentLevel),
                    value: '★'.repeat(
                      Math.max(
                        1,
                        Math.min(3, moves <= config.starThresholds[0] ? 3 : moves <= config.starThresholds[1] ? 2 : 1),
                      ),
                    ),
                  },
                ]}
              />
            )}
          </AnimatePresence>
        }
      />

      <LevelSelectModal
        open={levelSelectOpen}
        onClose={() => setLevelSelectOpen(false)}
        onSelect={goToLevel}
        currentLevel={currentLevel}
        maxLevel={maxLevel}
        progress={progress}
        t={t}
      />

      <ConfirmDialog
        open={confirmRestart}
        title={t.confirmTitle}
        description={t.confirmNewGameDesc}
        confirmLabel={t.confirmBtn}
        cancelLabel={t.cancelBtn}
        confirmVariant="danger"
        confirmId="ball-sort-confirm-restart-btn"
        cancelId="ball-sort-cancel-restart-btn"
        onConfirm={() => {
          setConfirmRestart(false)
          restartLevel()
        }}
        onCancel={() => setConfirmRestart(false)}
      />
    </>
  )
}

export default BallSort
