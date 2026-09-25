import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useSolitaire } from './hooks/useSolitaire'
import { SolitaireBoard } from './components/SolitaireBoard'
import type { GameComponentProps, DrawMode } from './types'
import { solitaireTranslations } from './i18n'
import {
  BoardLayout,
  ConfirmDialog,
  Button,
  PillGroup,
  ControlsBar,
  StatsHeader,
  formatTime,
  UndoIcon,
  HintIcon,
} from '@all/ui'
import { GameResultOverlay } from '@allgames/ui'
import './styles/solitaire.css'

function FinishIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

const DRAW_MODES: DrawMode[] = [1, 3]

export function Solitaire({ setHeader, setIsActive, locale = 'en', isEink = false }: GameComponentProps) {
  const [pendingDrawMode, setPendingDrawMode] = useState<DrawMode | null>(null)
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false)

  const t = solitaireTranslations[locale] || solitaireTranslations.en

  const {
    state,
    drawMode,
    selectedLocation,
    hint,
    elapsedSeconds,
    bestScore,
    isEligibleForAutoFinish,
    handleStockClick,
    handleCardClick,
    handleAutoMoveToFoundation,
    handleMove,
    handleUndo,
    handleHint,
    handleAutoComplete,
    resetGame,
    setDrawMode,
    resetBest,
  } = useSolitaire({ isEink })

  const isGameActive = state.moves > 0 && !state.isWon

  useEffect(() => {
    setIsActive?.(isGameActive)
    return () => setIsActive?.(false)
  }, [isGameActive, setIsActive])

  // Native beforeunload protection when a game is in progress
  useEffect(() => {
    if (!isGameActive) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isGameActive])

  const handleNewGameClick = () => {
    if (isGameActive) {
      setShowNewGameConfirm(true)
    } else {
      resetGame()
    }
  }

  const renderHeader = useCallback(() => {
    if (!setHeader) return
    setHeader(
      <StatsHeader
        label={t.record}
        items={[
          { key: 'best', label: t.bestScore, value: bestScore ?? '--' },
          { key: 'score', label: t.score, value: state.score },
          { key: 'time', label: t.time, value: formatTime(elapsedSeconds) },
          { key: 'moves', label: t.moves, value: state.moves },
        ]}
        onReset={bestScore !== null ? resetBest : undefined}
        resetAriaLabel={t.resetStatsAria}
        resetId="sol-reset-best-btn"
      />,
    )
  }, [setHeader, state.score, bestScore, elapsedSeconds, state.moves, t, resetBest])

  useEffect(() => {
    renderHeader()
  }, [renderHeader])

  useEffect(() => {
    return () => setHeader?.(null)
  }, [setHeader])

  const handleDrawModeClick = (mode: DrawMode) => {
    if (mode === drawMode) return
    if (isGameActive) {
      setPendingDrawMode(mode)
    } else {
      setDrawMode(mode)
    }
  }

  const handleConfirmDrawMode = () => {
    if (pendingDrawMode) {
      setDrawMode(pendingDrawMode)
      setPendingDrawMode(null)
    }
  }

  const handleCancelDrawMode = () => {
    setPendingDrawMode(null)
  }

  return (
    <div className="sol-root">
      <BoardLayout
        variant="wide"
        align="top"
        board={
          <div className="sol-board-stage">
            <SolitaireBoard
              state={state}
              selectedLocation={selectedLocation}
              hint={hint}
              isEink={isEink}
              onStockClick={handleStockClick}
              onCardClick={handleCardClick}
              onDoubleClick={handleAutoMoveToFoundation}
              onMove={handleMove}
              onEmptyTableauClick={(colIdx) => {
                if (selectedLocation) {
                  handleMove(selectedLocation, { type: 'tableau', pileIndex: colIdx })
                }
              }}
              onEmptyFoundationClick={(fIdx) => {
                if (selectedLocation) {
                  handleMove(selectedLocation, { type: 'foundation', pileIndex: fIdx })
                }
              }}
            />
          </div>
        }
        controls={
          <ControlsBar>
            <Button id="sol-new-game-btn" variant="primary" size="sm" onClick={handleNewGameClick}>
              {t.newGame}
            </Button>

            <Button id="sol-undo-btn" variant="secondary" size="sm" icon={<UndoIcon />} onClick={handleUndo}>
              {t.undo}
            </Button>

            <Button id="sol-hint-btn" variant="secondary" size="sm" icon={<HintIcon />} onClick={handleHint}>
              {t.hint}
            </Button>

            {isEligibleForAutoFinish && !state.isWon && (
              <Button
                id="sol-finish-btn"
                variant="secondary"
                size="sm"
                icon={<FinishIcon />}
                onClick={handleAutoComplete}
              >
                {t.autoComplete}
              </Button>
            )}

            <PillGroup<DrawMode>
              label={t.drawModeLabel}
              size="sm"
              options={DRAW_MODES.map((m) => ({
                value: m,
                label: m === 1 ? t.draw1 : t.draw3,
                id: `sol-draw-${m}-btn`,
              }))}
              value={drawMode}
              onChange={handleDrawModeClick}
            />
          </ControlsBar>
        }
        overlay={
          <AnimatePresence>
            {state.isWon && (
              <GameResultOverlay
                status="won"
                title={t.youWon}
                stats={[
                  { label: t.score, value: state.score },
                  { label: t.time, value: formatTime(elapsedSeconds) },
                  { label: t.moves, value: state.moves },
                ]}
                isEink={isEink}
                playAgainText={t.playAgain}
                onPlayAgain={() => resetGame()}
                playAgainId="sol-play-again-btn"
              />
            )}
          </AnimatePresence>
        }
      />

      {/* New Game Confirmation Modal */}
      <ConfirmDialog
        open={showNewGameConfirm}
        title={t.confirmResetTitle}
        description={t.confirmNewGameDesc}
        confirmLabel={t.newGame}
        cancelLabel={t.cancelBtn}
        confirmVariant="danger"
        confirmId="sol-new-game-confirm"
        cancelId="sol-new-game-cancel"
        onConfirm={() => {
          setShowNewGameConfirm(false)
          resetGame()
        }}
        onClose={() => setShowNewGameConfirm(false)}
      />

      {/* Draw Mode Change Confirmation Modal */}
      <ConfirmDialog
        open={pendingDrawMode !== null}
        title={t.confirmResetTitle}
        description={t.confirmDrawDesc}
        confirmLabel={t.continueBtn}
        cancelLabel={t.cancelBtn}
        confirmVariant="danger"
        confirmId="sol-modal-confirm"
        cancelId="sol-modal-cancel"
        onConfirm={handleConfirmDrawMode}
        onClose={handleCancelDrawMode}
      />
    </div>
  )
}
export default Solitaire
