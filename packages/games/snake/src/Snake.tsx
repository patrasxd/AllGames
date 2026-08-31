import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSnake } from './hooks/useSnake'
import { SnakeCanvas } from './components/SnakeCanvas'
import { TouchControls } from './components/TouchControls'
import type { GameComponentProps, SpeedMode, MapMode } from './types'
import { snakeTranslations } from './i18n'
import { StatsHeader, ControlsBar, GameButton, PillGroup, Badge } from '@allgames/ui'
import './styles/snake.css'

export function Snake({ setHeader, locale = 'en', isEink = false }: GameComponentProps) {
  const t = snakeTranslations[locale] || snakeTranslations.en
  const isPl = locale === 'pl'

  const {
    snake,
    food,
    obstacles,
    gridSize,
    direction,
    score,
    highScore,
    status,
    speed,
    isNewHighScore,
    mapMode,
    startGame,
    pauseGame,
    resumeGame,
    changeDirection,
    setSpeed,
    setMapMode,
    resetHighScore,
  } = useSnake({ isEink })

  const renderHeader = useCallback(() => {
    if (!setHeader) return
    setHeader(
      <StatsHeader
        label={isPl ? 'Rekord' : 'Record'}
        items={[
          { key: 'best', label: isPl ? 'Rekord' : 'Best', value: highScore },
          { key: 'score', label: isPl ? 'Wynik' : 'Score', value: score },
        ]}
        onReset={highScore > 0 ? resetHighScore : undefined}
        resetAriaLabel={isPl ? 'Resetuj rekord' : 'Reset record'}
        resetId="snake-reset-stats-btn"
      />
    )
  }, [setHeader, highScore, score, isPl, resetHighScore])

  useEffect(() => {
    renderHeader()
  }, [renderHeader])

  useEffect(() => {
    return () => setHeader?.(null)
  }, [setHeader])

  const speeds: SpeedMode[] = ['relaxed', 'normal', 'fast']
  const maps: MapMode[] = ['classic', 'obstacles', 'big']

  return (
    <div className="snake-root">
      <div className="snake-game">
        {/* Responsive Board with Overlay */}
        <div style={{ position: 'relative' }}>
          <SnakeCanvas
            snake={snake}
            food={food}
            obstacles={obstacles}
            gridSize={gridSize}
            direction={direction}
            status={status}
            isEink={isEink}
            onSwipe={changeDirection}
            onBoardClick={() => {
              if (status === 'IDLE' || status === 'GAME_OVER') startGame()
              else if (status === 'PAUSED') resumeGame()
            }}
          />

          {/* Overlays for Idle, Paused, and Game Over */}
          <AnimatePresence>
            {status !== 'PLAYING' && (
              <motion.div
                className="snake-overlay"
                initial={!isEink ? { opacity: 0, scale: 0.96 } : false}
                animate={{ opacity: 1, scale: 1 }}
                exit={!isEink ? { opacity: 0, scale: 0.96 } : undefined}
                transition={{ duration: 0.2 }}
              >
                {status === 'IDLE' && (
                  <>
                    <h2 className="snake-overlay-title">{t.title}</h2>
                    <p className="snake-overlay-sub">{t.startGame}</p>
                    <GameButton
                      id="snake-start-btn"
                      variant="primary"
                      onClick={startGame}
                    >
                      {t.startBtn}
                    </GameButton>
                  </>
                )}

                {status === 'PAUSED' && (
                  <>
                    <h2 className="snake-overlay-title">{t.pauseBtn}</h2>
                    <p className="snake-overlay-sub">{t.controlsHelp}</p>
                    <GameButton
                      id="snake-resume-btn"
                      variant="primary"
                      onClick={resumeGame}
                    >
                      {t.resumeBtn}
                    </GameButton>
                  </>
                )}

                {status === 'GAME_OVER' && (
                  <>
                    <h2 className="snake-overlay-title">{t.gameOver}</h2>
                    <p className="snake-overlay-score">{t.finalScore(score)}</p>
                    {isNewHighScore && (
                      <Badge variant="warning" style={{ marginBottom: '12px' }}>
                        {t.newHighScore}
                      </Badge>
                    )}
                    <GameButton
                      id="snake-restart-btn"
                      variant="primary"
                      onClick={startGame}
                    >
                      {t.restartBtn}
                    </GameButton>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls, Maps & Speed Settings */}
        <ControlsBar>
          {status === 'PLAYING' && (
            <GameButton
              id="snake-pause-btn"
              onClick={pauseGame}
            >
              {t.pauseBtn}
            </GameButton>
          )}

          {status === 'PAUSED' && (
            <GameButton
              id="snake-resume-bottom-btn"
              variant="primary"
              onClick={resumeGame}
            >
              {t.resumeBtn}
            </GameButton>
          )}

          {/* Map Selector */}
          <PillGroup<MapMode>
            label={t.mapLabel}
            options={maps.map(m => ({
              value: m,
              label: m === 'classic' ? t.mapClassicShort : m === 'obstacles' ? t.mapObstaclesShort : t.mapBigShort,
              id: `snake-map-${m}`,
            }))}
            value={mapMode}
            onChange={setMapMode}
          />

          {/* Speed Selector */}
          <PillGroup<SpeedMode>
            label={t.speedLabel}
            options={speeds.map(s => ({
              value: s,
              label: s === 'relaxed' ? t.speedRelaxed : s === 'normal' ? t.speedNormal : t.speedFast,
              id: `snake-speed-${s}`,
            }))}
            value={speed}
            onChange={setSpeed}
          />
        </ControlsBar>

        {/* D-Pad for Mobile Touch Devices */}
        <TouchControls onDirection={changeDirection} locale={locale} />
      </div>
    </div>
  )
}
