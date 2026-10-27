import { useEffect, useCallback, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useUntangle, starsFor } from './hooks/useUntangle'
import { Board } from './components/Board'
import { LevelSelectModal } from './components/LevelSelectModal'
import { HelpIcon } from './components/Icons'
import type { GameComponentProps } from './types'
import { untangleTranslations } from './i18n'
import { BoardLayout, Button, ConfirmDialog, ControlsBar, Dialog, StatsHeader, UndoIcon } from '@all/ui'
import { GameResultOverlay } from '@allgames/ui'
import './styles/untangle.css'

export function Untangle({ setHeader, setIsActive, locale = 'en', isEink = false }: GameComponentProps) {
  const t = untangleTranslations[locale] || untangleTranslations.en

  const {
    currentLevel,
    maxLevel,
    config,
    slots,
    clearance,
    ropes,
    conflicts,
    moves,
    status,
    isNewBest,
    vanishing,
    resultReady,
    progress,
    isGameActive,
    canUndo,
    moveEnd,
    canMove,
    undo,
    restartLevel,
    nextLevel,
    goToLevel,
  } = useUntangle({ animate: !isEink })

  const [levelSelectOpen, setLevelSelectOpen] = useState(false)
  const [confirmRestart, setConfirmRestart] = useState(false)
  const [howToPlayOpen, setHowToPlayOpen] = useState(false)

  // Leave Game protection
  useEffect(() => {
    setIsActive?.(isGameActive)
    return () => setIsActive?.(false)
  }, [isGameActive, setIsActive])

  useEffect(() => {
    if (!isGameActive) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isGameActive])

  const requestRestart = () => {
    if (isGameActive) setConfirmRestart(true)
    else restartLevel()
  }

  const bestMoves = progress.levelBestMoves[currentLevel]

  const renderHeader = useCallback(() => {
    if (!setHeader) return
    setHeader(
      <StatsHeader
        label={t.level(currentLevel)}
        items={[
          { key: 'moves', label: t.moves, value: moves },
          { key: 'tangles', label: t.tangles, value: conflicts.length },
          { key: 'best', label: t.best, value: bestMoves ?? '—' },
        ]}
      />,
    )
  }, [setHeader, t, currentLevel, moves, conflicts.length, bestMoves])

  useEffect(() => {
    renderHeader()
  }, [renderHeader])

  useEffect(() => {
    return () => setHeader?.(null)
  }, [setHeader])

  const earnedStars = status === 'won' ? starsFor(config, moves) : 0

  return (
    <>
      <BoardLayout
        variant="square"
        align="center"
        board={
          <Board
            key={currentLevel}
            layout={config.layout}
            slots={slots}
            ropes={ropes}
            clearance={clearance}
            canMove={canMove}
            onMove={moveEnd}
            t={t}
            disabled={status !== 'playing'}
            won={status === 'won'}
            vanishing={vanishing}
            isEink={isEink}
          />
        }
        controls={
          <ControlsBar className="ut-controls-bar">
            <Button
              id="untangle-undo-btn"
              variant="secondary"
              size="sm"
              icon={<UndoIcon />}
              disabled={!canUndo}
              onClick={undo}
            >
              {t.undo}
            </Button>
            <Button
              id="untangle-how-to-play-btn"
              variant="secondary"
              size="sm"
              icon={<HelpIcon />}
              onClick={() => setHowToPlayOpen(true)}
            >
              {t.howToPlayTitle}
            </Button>
            <Button id="untangle-restart-btn" variant="secondary" size="sm" onClick={requestRestart}>
              {t.reset}
            </Button>
            <Button id="untangle-levels-btn" variant="secondary" size="sm" onClick={() => setLevelSelectOpen(true)}>
              {t.levels}
            </Button>
          </ControlsBar>
        }
        overlay={
          <AnimatePresence>
            {status === 'won' && resultReady && (
              <GameResultOverlay
                status="won"
                title={t.wonTitle}
                subtitle={isNewBest ? undefined : t.wonSub}
                isEink={isEink}
                playAgainText={currentLevel < maxLevel ? t.nextLevel : t.chooseLevel}
                onPlayAgain={currentLevel < maxLevel ? nextLevel : () => setLevelSelectOpen(true)}
                playAgainId="untangle-next-btn"
                secondaryAction={{
                  label: t.levels,
                  onClick: () => setLevelSelectOpen(true),
                  id: 'untangle-won-levels-btn',
                }}
                stats={[
                  { label: t.moves, value: moves },
                  { label: t.target, value: config.par },
                  {
                    label: t.level(currentLevel),
                    value: '★'.repeat(earnedStars),
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

      <Dialog
        isOpen={howToPlayOpen}
        onClose={() => setHowToPlayOpen(false)}
        title={t.howToPlayTitle}
        maxWidth="sm"
        className="ut-dialog"
        footer={
          <div className="ut-how-to-play-actions">
            <Button
              id="untangle-how-to-play-ok-btn"
              variant="primary"
              size="sm"
              onClick={() => setHowToPlayOpen(false)}
            >
              OK
            </Button>
          </div>
        }
      >
        <div className="ut-how-to-play-content">
          <p className="ut-how-to-play-text">{t.howToPlayBody}</p>
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirmRestart}
        title={t.confirmTitle}
        description={t.confirmRestartDesc}
        confirmLabel={t.confirmBtn}
        cancelLabel={t.cancelBtn}
        confirmVariant="danger"
        confirmId="untangle-confirm-restart-btn"
        cancelId="untangle-cancel-restart-btn"
        onConfirm={() => {
          setConfirmRestart(false)
          restartLevel()
        }}
        onCancel={() => setConfirmRestart(false)}
      />
    </>
  )
}

export default Untangle
