import { useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useWingRush } from './hooks/useWingRush'
import { WingRushCanvas } from './components/WingRushCanvas'
import type { GameComponentProps, Difficulty } from './types'
import { wingRushTranslations } from './i18n'
import { FullBleedLayout, Button, PillGroup } from '@all/ui'
import { StatsHeader, GameResultOverlay } from '@allgames/ui'
import './styles/wing-rush.css'

function RestartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  )
}

function TapIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

const DIFF_SHORT: Record<Difficulty, string> = { easy: 'EZY', normal: 'NRM', hard: 'HRD' }

export function WingRush({ setHeader, locale = 'en', isEink = false, theme = 'dark' }: GameComponentProps) {
  const t = wingRushTranslations[locale] || wingRushTranslations.en
  const isPl = locale === 'pl'

  const {
    difficulty,
    gameStatus,
    score,
    bestScore,
    isNewBest,
    bird,
    pipes,
    particles,
    flap,
    resetGame,
    changeDifficulty,
  } = useWingRush()

  // Injected Header Stats — score is on the canvas, best + difficulty shown in header
  const renderHeader = useCallback(() => {
    if (!setHeader) return
    setHeader(
      <StatsHeader
        label={isPl ? 'Poziom' : 'Level'}
        items={[
          { key: 'best', label: isPl ? 'Rekord' : 'Best', value: bestScore },
          {
            key: 'difficulty',
            label: 'Diff',
            value: DIFF_SHORT[difficulty],
          },
        ]}
      />
    )
  }, [setHeader, isPl, bestScore, difficulty])

  useEffect(() => {
    renderHeader()
  }, [renderHeader])

  useEffect(() => {
    return () => setHeader?.(null)
  }, [setHeader])

  return (
    <FullBleedLayout
      footer={
        <div className="wr-controls">
          {/* Difficulty Selector */}
          <PillGroup
            label="Difficulty"
            size="sm"
            value={difficulty}
            onChange={changeDifficulty}
            options={(['easy', 'normal', 'hard'] as Difficulty[]).map(diff => ({
              value: diff,
              label: t.difficultyLabels[diff],
            }))}
          />

          <Button
            id="wr-restart-btn"
            variant="secondary"
            size="sm"
            onClick={resetGame}
            icon={<RestartIcon />}
          >
            {t.restart}
          </Button>
        </div>
      }
    >
      <WingRushCanvas
        bird={bird}
        pipes={pipes}
        particles={particles}
        score={score}
        gameStatus={gameStatus}
        isEink={isEink}
        theme={theme}
        onFlap={flap}
      />

      {/* Ready State Overlay */}
      {gameStatus === 'ready' && (
        <div className="wr-ready-overlay">
          <div className="wr-ready-pill">
            <TapIcon />
            <span className="wr-ready-title">{t.readyPrompt}</span>
          </div>
          <p className="wr-ready-subtitle">{t.readySubPrompt}</p>
        </div>
      )}

      {/* Game Over Dialog */}
      <AnimatePresence>
        {gameStatus === 'gameover' && (
          <GameResultOverlay
            status="lost"
            title={isNewBest ? t.newBest : t.gameOverTitle}
            subtitle={t.gameOverSub}
            isEink={isEink}
            playAgainText={t.restart}
            onPlayAgain={resetGame}
            playAgainId="wr-play-again-btn"
            stats={[
              { label: t.score, value: score },
              { label: t.bestScore, value: bestScore },
              { label: t.difficulty, value: t.difficultyLabels[difficulty] },
            ]}
          />
        )}
      </AnimatePresence>
    </FullBleedLayout>
  )
}

export default WingRush
