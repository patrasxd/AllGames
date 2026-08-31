import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useSolitaire } from './hooks/useSolitaire'
import { SolitaireBoard } from './components/SolitaireBoard'
import type { GameComponentProps, DrawMode } from './types'
import { solitaireTranslations } from './i18n'
import {
  StatsHeader,
  GameModal,
  PillGroup,
  GameButton,
  ControlsBar,
  GameResultOverlay,
  UndoIcon,
  HintIcon,
  formatTime,
} from '@allgames/ui'
import './styles/solitaire.css'

function FinishIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

const DRAW_MODES: DrawMode[] = [1, 3]

export function Solitaire({ setHeader, locale = 'en', isEink = false }: GameComponentProps) {
  const [pendingDrawMode, setPendingDrawMode] = useState<DrawMode | null>(null)

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
        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
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

          {/* Win Overlay */}
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
        </div>

        {/* Global Unified Controls Bar */}
        <ControlsBar>
          <GameButton
            id="sol-new-game-btn"
            variant="primary"
            onClick={() => resetGame()}
          >
            {t.newGame}
          </GameButton>

          <GameButton
            id="sol-undo-btn"
            icon={<UndoIcon />}
            onClick={handleUndo}
          >
            {t.undo}
          </GameButton>

          <GameButton
            id="sol-hint-btn"
            icon={<HintIcon />}
            onClick={handleHint}
          >
            {t.hint}
          </GameButton>

          {isEligibleForAutoFinish && !state.isWon && (
            <GameButton
              id="sol-finish-btn"
              icon={<FinishIcon />}
              onClick={handleAutoComplete}
            >
              {t.autoComplete}
            </GameButton>
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

        {/* Reset Confirmation Modal */}
        <AnimatePresence>
          {pendingDrawMode && (
            <GameModal
              title={t.confirmResetTitle}
              description={t.confirmDrawDesc}
              cancelText="Cancel"
              confirmText="Continue"
              cancelId="sol-modal-cancel"
              confirmId="sol-modal-confirm"
              onCancel={handleCancelDrawMode}
              onConfirm={handleConfirmDrawMode}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
export default Solitaire
