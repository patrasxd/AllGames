import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useSudoku } from './hooks/useSudoku'
import { SudokuBoard } from './components/SudokuBoard'
import { Numpad } from './components/Numpad'
import type { GameComponentProps, SudokuDifficulty } from './types'
import { sudokuTranslations } from './i18n'
import { BoardLayout, Dialog, Button } from '@all/ui'
import {
  StatsHeader,
  PillGroup,
  ControlsBar,
  GameResultOverlay,
  formatTime,
} from '@allgames/ui'
import './styles/sudoku.css'

const DIFFICULTIES: SudokuDifficulty[] = ['easy', 'medium', 'hard']

export function Sudoku({ setHeader, locale = 'en', isEink = false }: GameComponentProps) {
  const [pendingDifficulty, setPendingDifficulty] = useState<SudokuDifficulty | null>(null)

  const t = sudokuTranslations[locale] || sudokuTranslations.en
  const isPl = locale === 'pl'

  const {
    board,
    difficulty,
    selectedCell,
    pencilMode,
    mistakes,
    gameStatus,
    elapsedSeconds,
    bestTime,
    setSelectedCell,
    setPencilMode,
    handleInputNumber,
    handleErase,
    handleUndo,
    resetGame,
    setDifficulty,
    resetBest,
  } = useSudoku({ isEink })

  const isGameActive = elapsedSeconds > 0 && gameStatus === 'playing'

  const renderHeader = useCallback(() => {
    if (!setHeader) return
    setHeader(
      <StatsHeader
        label={isPl ? 'Rekord' : 'Record'}
        items={[
          { key: 'best', label: isPl ? 'Rekord' : 'Best', value: bestTime !== null ? formatTime(bestTime) : '--:--' },
          { key: 'time', label: isPl ? 'Czas' : 'Time', value: formatTime(elapsedSeconds) },
          {
            key: 'mistakes',
            label: isPl ? 'Błędy' : 'Mistakes',
            value: `${mistakes}/3`,
            className: mistakes > 0 ? 'sdk-mistakes-val--warn' : '',
          },
        ]}
        onReset={bestTime !== null ? resetBest : undefined}
        resetAriaLabel={isPl ? 'Resetuj rekord' : 'Reset record'}
        resetId="sdk-reset-best-btn"
      />
    )
  }, [setHeader, elapsedSeconds, bestTime, mistakes, isPl, resetBest])

  useEffect(() => {
    renderHeader()
  }, [renderHeader])

  useEffect(() => {
    return () => setHeader?.(null)
  }, [setHeader])

  const handleDifficultyClick = (d: SudokuDifficulty) => {
    if (d === difficulty) return
    if (isGameActive) {
      setPendingDifficulty(d)
    } else {
      setDifficulty(d)
    }
  }

  const handleConfirmDifficulty = () => {
    if (pendingDifficulty) {
      setDifficulty(pendingDifficulty)
      setPendingDifficulty(null)
    }
  }

  const handleCancelDifficulty = () => {
    setPendingDifficulty(null)
  }

  return (
    <div className="sdk-root">
      <div className="sdk-game">
        <BoardLayout
          variant="square"
          board={
            <div>
              {/* Board */}
              <SudokuBoard
                board={board}
                selectedCell={selectedCell}
                isEink={isEink}
                onSelectCell={(r, c) => setSelectedCell([r, c])}
              />

              {/* Numpad & Action Tools */}
              <Numpad
                pencilMode={pencilMode}
                locale={locale}
                onNumber={handleInputNumber}
                onErase={handleErase}
                onTogglePencil={() => setPencilMode(p => !p)}
                onUndo={handleUndo}
              />
            </div>
          }
          overlay={
            <AnimatePresence>
              {(gameStatus === 'won' || gameStatus === 'lost') && (
                <GameResultOverlay
                  status={gameStatus}
                  title={gameStatus === 'won' ? t.youWon : t.youLost}
                  stats={[
                    { label: isPl ? 'Czas' : 'Time', value: formatTime(elapsedSeconds) },
                    { label: isPl ? 'Błędy' : 'Mistakes', value: `${mistakes}/3` },
                  ]}
                  isEink={isEink}
                  playAgainText={t.tryAgain}
                  onPlayAgain={() => resetGame()}
                  playAgainId="sdk-retry-btn"
                />
              )}
            </AnimatePresence>
          }
          controls={
            <ControlsBar>
              <Button
                id="sdk-new-game-btn"
                variant="primary"
                onClick={() => resetGame()}
              >
                {t.newGame}
              </Button>

              <PillGroup<SudokuDifficulty>
                label={t.difficultyLabel}
                options={DIFFICULTIES.map(d => ({
                  value: d,
                  label: d === 'easy' ? t.easy : d === 'medium' ? t.medium : t.hard,
                  id: `sdk-diff-${d}`,
                }))}
                value={difficulty}
                onChange={handleDifficultyClick}
              />
            </ControlsBar>
          }
        />

        {/* Reset Confirmation Dialog */}
        <Dialog
          isOpen={Boolean(pendingDifficulty)}
          onClose={handleCancelDifficulty}
          title={t.confirmResetTitle}
          description={t.confirmDifficultyDesc}
        >
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button
              id="sdk-modal-cancel"
              variant="secondary"
              onClick={handleCancelDifficulty}
            >
              Cancel
            </Button>
            <Button
              id="sdk-modal-confirm"
              variant="primary"
              onClick={handleConfirmDifficulty}
            >
              Continue
            </Button>
          </div>
        </Dialog>
      </div>
    </div>
  )
}
export default Sudoku
