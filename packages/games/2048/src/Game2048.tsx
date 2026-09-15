import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { use2048 } from './hooks/use2048'
import { Board2048 } from './components/Board2048'
import type { GameComponentProps, GridSize } from './types'
import { game2048Translations } from './i18n'
import { BoardLayout, ConfirmDialog, Button, PillGroup, ControlsBar } from '@all/ui'
import { StatsHeader, GameResultOverlay, UndoIcon, DPad } from '@allgames/ui'
import './styles/game2048.css'

const GRID_SIZES: GridSize[] = [3, 4, 5]

export function Game2048({ setHeader, setIsActive, locale = 'en', isEink = false }: GameComponentProps) {
  const [pendingAction, setPendingAction] = useState<
    { type: 'size'; value: GridSize } | { type: 'newGame' } | null
  >(null)

  const t = game2048Translations[locale] || game2048Translations.en
  const isPl = locale === 'pl'

  const {
    tiles,
    gridSize,
    score,
    bestScore,
    gameStatus,
    canUndo,
    handleMove,
    undoMove,
    resetGame,
    setGridSize,
    dismissWin,
    resetBestScore,
  } = use2048({ isEink })

  const isGameActive = (score > 0 || canUndo) && gameStatus === 'playing'

  useEffect(() => {
    setIsActive?.(isGameActive)
    return () => setIsActive?.(false)
  }, [isGameActive, setIsActive])

  const renderHeader = useCallback(() => {
    if (!setHeader) return
    setHeader(
      <StatsHeader
        label={isPl ? 'Rekord' : 'Record'}
        items={[
          { key: 'best', label: isPl ? 'Rekord' : 'Best', value: bestScore },
          { key: 'score', label: isPl ? 'Wynik' : 'Score', value: score },
        ]}
        onReset={bestScore > 0 ? resetBestScore : undefined}
        resetAriaLabel={isPl ? 'Resetuj rekord' : 'Reset record'}
        resetId="g2048-reset-best-btn"
      />
    )
  }, [setHeader, bestScore, score, isPl, resetBestScore])

  useEffect(() => {
    renderHeader()
  }, [renderHeader])

  useEffect(() => {
    return () => setHeader?.(null)
  }, [setHeader])

  const handleNewGameClick = () => {
    if (isGameActive) {
      setPendingAction({ type: 'newGame' })
    } else {
      resetGame()
    }
  }

  const handleSizeClick = (size: GridSize) => {
    if (size === gridSize) return
    if (isGameActive) {
      setPendingAction({ type: 'size', value: size })
    } else {
      setGridSize(size)
    }
  }

  const handleConfirmAction = () => {
    if (!pendingAction) return
    if (pendingAction.type === 'size') {
      setGridSize(pendingAction.value)
    } else if (pendingAction.type === 'newGame') {
      resetGame()
    }
    setPendingAction(null)
  }

  const handleCancelAction = () => {
    setPendingAction(null)
  }

  return (
    <div className="g2048-root">
      <motion.div
        className="g2048-game"
        initial={!isEink ? { opacity: 0, scale: 0.98 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        <BoardLayout
          variant="square"
          board={
            <Board2048
              tiles={tiles}
              size={gridSize}
              isEink={isEink}
              onMove={handleMove}
            />
          }
          overlay={
            (gameStatus === 'won' || gameStatus === 'lost') ? (
              <GameResultOverlay
                status={gameStatus === 'won' ? 'won' : 'lost'}
                title={gameStatus === 'won' ? t.youWon : t.youLost}
                stats={[
                  { label: t.score, value: score },
                  { label: t.bestScore, value: bestScore },
                ]}
                isEink={isEink}
                playAgainText={t.tryAgain}
                onPlayAgain={() => resetGame()}
                playAgainId="g2048-retry-btn"
                secondaryAction={
                  gameStatus === 'won'
                    ? {
                        label: t.keepPlaying,
                        onClick: dismissWin,
                        id: 'g2048-keep-playing-btn',
                      }
                    : undefined
                }
              />
            ) : null
          }
          dpad={
            <DPad
              onDirection={handleMove}
              ariaLabel={t.swipeHint}
            />
          }
          controls={
            <ControlsBar>
              <Button
                id="g2048-new-game-btn"
                variant="primary"
                size="sm"
                onClick={handleNewGameClick}
              >
                {t.newGame}
              </Button>

              <Button
                id="g2048-undo-btn"
                variant="secondary"
                size="sm"
                icon={<UndoIcon />}
                onClick={undoMove}
                disabled={!canUndo}
              >
                {t.undo}
              </Button>

              <PillGroup<GridSize>
                label={t.gridSizeLabel}
                options={GRID_SIZES.map(s => ({
                  value: s,
                  label: s === 3 ? t.grid3 : s === 4 ? t.grid4 : t.grid5,
                  id: `g2048-size-${s}`,
                }))}
                value={gridSize}
                onChange={handleSizeClick}
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
            pendingAction?.type === 'newGame'
              ? t.confirmNewGameDesc
              : t.confirmModeDesc
          }
          confirmLabel={pendingAction?.type === 'newGame' ? t.newGame : t.confirmBtn}
          cancelLabel={t.cancelBtn}
          confirmVariant="danger"
          confirmId="g2048-modal-confirm"
          cancelId="g2048-modal-cancel"
          onConfirm={handleConfirmAction}
        />
      </motion.div>
    </div>
  )
}
export default Game2048
