import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useSolitaire } from './hooks/useSolitaire'
import { SolitaireBoard } from './components/SolitaireBoard'
import type { GameComponentProps, DrawMode } from './types'
import { solitaireTranslations } from './i18n'
import { BoardLayout, ConfirmDialog, Button } from '@all/ui'
import {
  StatsHeader,
  PillGroup,
  ControlsBar,
  GameResultOverlay,
  UndoIcon,
  HintIcon,
  formatTime,
} from '@allgames/ui'
import './styles/solitaire.css'

function FinishIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12l5 5L20 7" />
    </svg>
  )
}

const DRAW_MODES: DrawMode[] = [1, 3]

export function Solitaire({ setHeader, setIsActive, locale = 'en', isEink = false }: GameComponentProps) {
  const [pendingDrawMode, setPendingDrawMode] = useState<DrawMode | null>(null)
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false)

  const t = solitaireTranslations[locale] || solitaireTranslations.en
  const isPl = locale === 'pl'

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
        label={isPl ? 'Rekord' : 'Record'}
        items={[
          { key: 'best', label: isPl ? 'Rekord' : 'Best', value: bestScore ?? '--' },
          { key: 'score', label: isPl ? 'Wynik' : 'Score', value: state.score },
          { key: 'time', label: isPl ? 'Czas' : 'Time', value: formatTime(elapsedSeconds) },
          { key: 'moves', label: isPl ? 'Ruchy' : 'Moves', value: state.moves },
        ]}
        onReset={bestScore !== null ? resetBest : undefined}
        resetAriaLabel={isPl ? 'Resetuj rekord' : 'Reset record'}
        resetId="sol-reset-best-btn"
      />
    )
  }, [setHeader, state.score, bestScore, elapsedSeconds, state.moves, isPl, resetBest])

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
      <div className="sol-game">
        <BoardLayout
          variant="wide"
          controls={
            <ControlsBar>
              <Button
                id="sol-new-game-btn"
                variant="primary"
                onClick={handleNewGameClick}
              >
                {t.newGame}
              </Button>

              <Button
                id="sol-undo-btn"
                variant="secondary"
                icon={<UndoIcon />}
                onClick={handleUndo}
              >
                {t.undo}
              </Button>

              <Button
                id="sol-hint-btn"
                variant="secondary"
                icon={<HintIcon />}
                onClick={handleHint}
              >
                {t.hint}
              </Button>

              {isEligibleForAutoFinish && !state.isWon && (
                <Button
                  id="sol-finish-btn"
                  variant="secondary"
                  icon={<FinishIcon />}
                  onClick={handleAutoComplete}
                >
                  {t.autoComplete}
                </Button>
              )}

              <PillGroup<DrawMode>
                label={t.drawModeLabel}
                options={DRAW_MODES.map(m => ({
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
        >
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <SolitaireBoard
              state={state}
              selectedLocation={selectedLocation}
              hint={hint}
              isEink={isEink}
              onStockClick={handleStockClick}
              onCardClick={handleCardClick}
              onDoubleClick={handleAutoMoveToFoundation}
              onEmptyTableauClick={colIdx => {
                if (selectedLocation) {
                  handleMove(selectedLocation, { type: 'tableau', pileIndex: colIdx })
                }
              }}
              onEmptyFoundationClick={fIdx => {
                if (selectedLocation) {
                  handleMove(selectedLocation, { type: 'foundation', pileIndex: fIdx })
                }
              }}
            />
          </div>
        </BoardLayout>

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
    </div>
  )
}
export default Solitaire
