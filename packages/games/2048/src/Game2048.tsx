import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { use2048 } from './hooks/use2048'
import { Board2048 } from './components/Board2048'
import type { GameComponentProps, GridSize } from './types'
import { game2048Translations } from './i18n'
import {
  StatsHeader,
  GameModal,
  PillGroup,
  GameButton,
  ControlsBar,
  GameResultOverlay,
  UndoIcon,
} from '@allgames/ui'
import './styles/game2048.css'

/* ─── Sketched Arrow Icons ───────────────────────────────── */
function ArrowIcon({ dir }: { dir: 'up' | 'down' | 'left' | 'right' }) {
  const points =
    dir === 'up'
      ? '18 15 12 9 6 15'
      : dir === 'right'
        ? '9 18 15 12 9 6'
        : dir === 'down'
          ? '6 9 12 15 18 9'
          : '15 18 9 12 15 6'

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points={points} />
    </svg>
  )
}

const GRID_SIZES: GridSize[] = [3, 4, 5]

export function Game2048({ setHeader, locale = 'en', isEink = false }: GameComponentProps) {
  const [pendingSize, setPendingSize] = useState<GridSize | null>(null)

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

  const isGameActive = score > 0 && gameStatus !== 'lost'

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

  const handleSizeClick = (size: GridSize) => {
    if (size === gridSize) return
    if (isGameActive) {
      setPendingSize(size)
    } else {
      setGridSize(size)
    }
  }

  const handleConfirmSize = () => {
    if (pendingSize) {
      setGridSize(pendingSize)
      setPendingSize(null)
    }
  }

  const handleCancelSize = () => {
    setPendingSize(null)
  }

  return (
    <div className="g2048-root">
      <motion.div
        className="g2048-game"
        initial={!isEink ? { opacity: 0, scale: 0.98 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        {/* Board & Overlays */}
        <div style={{ position: 'relative' }}>
          <Board2048
            tiles={tiles}
            size={gridSize}
            isEink={isEink}
            onMove={handleMove}
          />

          {/* Win / Loss Overlay */}
          <AnimatePresence>
            {(gameStatus === 'won' || gameStatus === 'lost') && (
              <GameResultOverlay
                status={gameStatus}
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
            )}
          </AnimatePresence>
        </div>

        {/* D-pad controls for accessible navigation and touch */}
        <div className="g2048-dpad" role="group" aria-label="Direction Controls">
          <button
            type="button"
            id="g2048-dpad-up"
            className="g2048-dpad-btn g2048-dpad-up"
            onClick={() => handleMove('up')}
            aria-label="Move Up"
          >
            <ArrowIcon dir="up" />
          </button>
          <button
            type="button"
            id="g2048-dpad-left"
            className="g2048-dpad-btn g2048-dpad-left"
            onClick={() => handleMove('left')}
            aria-label="Move Left"
          >
            <ArrowIcon dir="left" />
          </button>
          <button
            type="button"
            id="g2048-dpad-down"
            className="g2048-dpad-btn g2048-dpad-down"
            onClick={() => handleMove('down')}
            aria-label="Move Down"
          >
            <ArrowIcon dir="down" />
          </button>
          <button
            type="button"
            id="g2048-dpad-right"
            className="g2048-dpad-btn g2048-dpad-right"
            onClick={() => handleMove('right')}
            aria-label="Move Right"
          >
            <ArrowIcon dir="right" />
          </button>
        </div>

        {/* Action Controls Bar */}
        <ControlsBar>
          <GameButton
            id="g2048-new-game-btn"
            variant="primary"
            onClick={() => resetGame()}
          >
            {t.newGame}
          </GameButton>

          <GameButton
            id="g2048-undo-btn"
            icon={<UndoIcon />}
            onClick={undoMove}
            disabled={!canUndo}
          >
            {t.undo}
          </GameButton>

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

        {/* Reset Confirmation Modal */}
        <AnimatePresence>
          {pendingSize && (
            <GameModal
              title={t.confirmResetTitle}
              description={t.confirmModeDesc}
              cancelText={t.cancelBtn}
              confirmText={t.confirmBtn}
              cancelId="g2048-modal-cancel"
              confirmId="g2048-modal-confirm"
              onCancel={handleCancelSize}
              onConfirm={handleConfirmSize}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
export default Game2048
