import { useEffect, useCallback, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useBlockOut, starsFor } from './hooks/useBlockOut'
import { Board } from './components/Board'
import { LevelSelectModal } from './components/LevelSelectModal'
import { HelpIcon } from './components/Icons'
import type { GameComponentProps } from './types'
import { blockOutTranslations } from './i18n'
import { BoardLayout, Button, ConfirmDialog, ControlsBar, Dialog, StatsHeader, UndoIcon } from '@all/ui'
import { GameResultOverlay } from '@allgames/ui'
import './styles/block-out.css'

export function BlockOut({
  setHeader,
  setIsActive,
  locale = 'en',
  isEink = false,
  theme = 'dark',
}: GameComponentProps) {
  const t = blockOutTranslations[locale] || blockOutTranslations.en

  const {
    currentLevel,
    maxLevel,
    config,
    blocks,
    moves,
    status,
    isNewBest,
    progress,
    isGameActive,
    canUndo,
    slideBlock,
    undo,
    restartLevel,
    nextLevel,
    goToLevel,
  } = useBlockOut()

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

  const renderHeader = useCallback(() => {
    if (!setHeader) return
    setHeader(
      <StatsHeader
        label={t.level(currentLevel)}
        items={[
          { key: 'moves', label: t.moves, value: moves },
          { key: 'min', label: t.minMoves, value: config.minMoves },
          { key: 'best', label: t.best, value: progress.levelBestMoves[currentLevel] ?? '—' },
        ]}
      />,
    )
  }, [setHeader, t, currentLevel, moves, config.minMoves, progress])

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
        board={<Board blocks={blocks} onSlide={slideBlock} isEink={isEink} theme={theme} />}
        controls={
          <ControlsBar className="bo-controls-bar">
            <Button
              id="block-out-undo-btn"
              variant="secondary"
              size="sm"
              icon={<UndoIcon />}
              disabled={!canUndo}
              onClick={undo}
            >
              {t.undo}
            </Button>
            <Button
              id="block-out-how-to-play-btn"
              variant="secondary"
              size="sm"
              icon={<HelpIcon />}
              onClick={() => setHowToPlayOpen(true)}
            >
              {t.howToPlayTitle}
            </Button>
            <Button id="block-out-restart-btn" variant="secondary" size="sm" onClick={requestRestart}>
              {t.reset}
            </Button>
            <Button id="block-out-levels-btn" variant="secondary" size="sm" onClick={() => setLevelSelectOpen(true)}>
              {t.levels}
            </Button>
          </ControlsBar>
        }
        overlay={
          <AnimatePresence>
            {status === 'won' && (
              <GameResultOverlay
                status="won"
                title={t.wonTitle}
                subtitle={isNewBest ? undefined : t.wonSub}
                isEink={isEink}
                playAgainText={currentLevel < maxLevel ? t.nextLevel : t.chooseLevel}
                onPlayAgain={currentLevel < maxLevel ? nextLevel : () => setLevelSelectOpen(true)}
                playAgainId="block-out-next-btn"
                secondaryAction={{
                  label: t.levels,
                  onClick: () => setLevelSelectOpen(true),
                  id: 'block-out-won-levels-btn',
                }}
                stats={[
                  { label: t.moves, value: moves },
                  { label: t.minMoves, value: config.minMoves },
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
        className="bo-dialog"
        footer={
          <div className="bo-how-to-play-actions">
            <Button
              id="block-out-how-to-play-ok-btn"
              variant="primary"
              size="sm"
              onClick={() => setHowToPlayOpen(false)}
            >
              OK
            </Button>
          </div>
        }
      >
        <div className="bo-how-to-play-content">
          <p className="bo-how-to-play-text">{t.howToPlayBody}</p>
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirmRestart}
        title={t.confirmTitle}
        description={t.confirmRestartDesc}
        confirmLabel={t.confirmBtn}
        cancelLabel={t.cancelBtn}
        confirmVariant="danger"
        confirmId="block-out-confirm-restart-btn"
        cancelId="block-out-cancel-restart-btn"
        onConfirm={() => {
          setConfirmRestart(false)
          restartLevel()
        }}
        onCancel={() => setConfirmRestart(false)}
      />
    </>
  )
}

export default BlockOut
