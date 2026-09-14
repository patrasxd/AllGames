import { useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useWingRush } from './hooks/useWingRush'
import { WingRushCanvas } from './components/WingRushCanvas'
import type { GameComponentProps, Difficulty } from './types'
import { wingRushTranslations } from './i18n'
import { FullBleedLayout, PillGroup } from '@all/ui'
import { StatsHeader, GameResultOverlay, GameStartOverlay } from '@allgames/ui'
import './styles/wing-rush.css'

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
        </div>
      }
      overlay={
        <AnimatePresence>
          {gameStatus === 'ready' && (
            <GameStartOverlay
              title={t.gameTitle}
              subtitle={t.readySubPrompt}
              startText={t.startBtn}
              onStart={flap}
              startId="wr-start-btn"
              isEink={isEink}
            />
          )}

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
    </FullBleedLayout>
  )
}

export default WingRush
