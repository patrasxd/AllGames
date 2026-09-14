import { useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useSnake } from './hooks/useSnake'
import { SnakeCanvas } from './components/SnakeCanvas'
import type { GameComponentProps, SpeedMode, MapMode } from './types'
import { snakeTranslations } from './i18n'
import { BoardLayout, Button, Badge, PillGroup, ControlsBar } from '@all/ui'
import { StatsHeader, GameResultOverlay, GameStartOverlay, DPad } from '@allgames/ui'
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
      <BoardLayout
        variant="square"
        board={
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
        }
        overlay={
          <AnimatePresence>
            {status === 'IDLE' && (
              <GameStartOverlay
                title={t.title}
                subtitle={t.startGame}
                startText={t.startBtn}
                onStart={startGame}
                startId="snake-start-btn"
                isEink={isEink}
              />
            )}

            {status === 'PAUSED' && (
              <GameStartOverlay
                title={t.pauseBtn}
                subtitle={t.controlsHelp}
                startText={t.resumeBtn}
                onStart={resumeGame}
                startId="snake-resume-btn"
                isEink={isEink}
              />
            )}

            {status === 'GAME_OVER' && (
              <GameResultOverlay
                status="lost"
                title={t.gameOver}
                subtitle={isNewHighScore ? t.newHighScore : undefined}
                stats={[
                  { label: isPl ? 'Wynik' : 'Score', value: score },
                  { label: isPl ? 'Rekord' : 'Best', value: highScore },
                ]}
                isEink={isEink}
                playAgainText={t.restartBtn}
                onPlayAgain={startGame}
                playAgainId="snake-restart-btn"
              />
            )}
          </AnimatePresence>
        }
        controls={
          <div className="snake-controls-section">
            {/* Standardized D-Pad for Mobile Touch Devices from @allgames/ui */}
            <DPad
              onDirection={(dir) => changeDirection(dir.toUpperCase() as any)}
              labels={{
                up: t.upAria,
                down: t.downAria,
                left: t.leftAria,
                right: t.rightAria,
              }}
            />

            {/* Bottom Settings Bar — Map, Speed & Pause */}
            <ControlsBar className="snake-bottom-bar">
              {status === 'PLAYING' && (
                <Button
                  id="snake-pause-btn"
                  variant="secondary"
                  size="sm"
                  onClick={pauseGame}
                >
                  {t.pauseBtn}
                </Button>
              )}

              {status === 'PAUSED' && (
                <Button
                  id="snake-resume-bottom-btn"
                  variant="primary"
                  size="sm"
                  onClick={resumeGame}
                >
                  {t.resumeBtn}
                </Button>
              )}

              {/* Map Selector */}
              <PillGroup<MapMode>
                label={t.mapLabel}
                size="sm"
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
                size="sm"
                options={speeds.map(s => ({
                  value: s,
                  label: s === 'relaxed' ? t.speedRelaxed : s === 'normal' ? t.speedNormal : t.speedFast,
                  id: `snake-speed-${s}`,
                }))}
                value={speed}
                onChange={setSpeed}
              />
            </ControlsBar>
          </div>
        }
      />
    </div>
  )
}


