import { useEffect, useCallback, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useSnake } from './hooks/useSnake'
import { SnakeCanvas } from './components/SnakeCanvas'
import type { GameComponentProps, SpeedMode, MapMode } from './types'
import { snakeTranslations } from './i18n'
import { BoardLayout, Button, Badge, PillGroup, ControlsBar, ConfirmDialog, PlayIcon, PauseIcon, StatsHeader } from '@all/ui'
import { GameResultOverlay, GameStartOverlay, DPad } from '@allgames/ui'
import './styles/snake.css'

export function Snake({ setHeader, setIsActive, locale = 'en', isEink = false }: GameComponentProps) {
  const t = snakeTranslations[locale] || snakeTranslations.en

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

  const isGameActive = status === 'PLAYING' || status === 'PAUSED'

  useEffect(() => {
    setIsActive?.(isGameActive)
    return () => setIsActive?.(false)
  }, [isGameActive, setIsActive])

  const [pendingMapMode, setPendingMapMode] = useState<MapMode | null>(null)

  const handleMapModeChange = (m: MapMode) => {
    if (m === mapMode) return
    if (isGameActive) {
      setPendingMapMode(m)
    } else {
      setMapMode(m)
    }
  }

  const handleConfirmMapChange = () => {
    if (pendingMapMode) {
      setMapMode(pendingMapMode)
      setPendingMapMode(null)
    }
  }

  const handleCancelMapChange = () => {
    setPendingMapMode(null)
  }

  const renderHeader = useCallback(() => {
    if (!setHeader) return
    setHeader(
      <StatsHeader
        label={t.record}
        items={[
          { key: 'best', label: t.highScore, value: highScore },
          { key: 'score', label: t.score, value: score },
        ]}
        onReset={highScore > 0 ? resetHighScore : undefined}
        resetAriaLabel={t.resetStatsAria}
        resetId="snake-reset-stats-btn"
      />
    )
  }, [setHeader, highScore, score, t, resetHighScore])

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
                  { label: t.score, value: score },
                  { label: t.highScore, value: highScore },
                ]}
                isEink={isEink}
                playAgainText={t.restartBtn}
                onPlayAgain={startGame}
                playAgainId="snake-restart-btn"
              />
            )}
          </AnimatePresence>
        }
        dpad={
          <DPad
            onDirection={(dir) => changeDirection(dir.toUpperCase() as any)}
            labels={{
              up: t.upAria,
              down: t.downAria,
              left: t.leftAria,
              right: t.rightAria,
            }}
          />
        }
        controls={
          <ControlsBar className="snake-bottom-bar">
            {status === 'PLAYING' && (
              <Button
                id="snake-pause-btn"
                variant="secondary"
                size="sm"
                icon={<PauseIcon />}
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
                icon={<PlayIcon />}
                onClick={resumeGame}
              >
                {t.resumeBtn}
              </Button>
            )}

            {status === 'GAME_OVER' && (
              <Button
                id="snake-play-again-bottom-btn"
                variant="primary"
                size="sm"
                icon={<PlayIcon />}
                onClick={startGame}
              >
                {t.restartBtn}
              </Button>
            )}
          </ControlsBar>
        }
        onSettingsOpenChange={(open) => {
          if (open && status === 'PLAYING') {
            pauseGame()
          }
        }}
        settingsTitle={t.settings}
        settingsAriaLabel={t.settings}
        dpadToggleLabel={t.dpadLabel}
        dpadActiveLabel={t.dpadActive}
        dpadInactiveLabel={t.dpadInactive}
        settings={[
          {
            id: 'map',
            label: t.mapLabel,
            control: (
              <PillGroup<MapMode>
                size="sm"
                options={maps.map(m => ({
                  value: m,
                  label: m === 'classic' ? t.mapClassicShort : m === 'obstacles' ? t.mapObstaclesShort : t.mapBigShort,
                  id: `snake-map-${m}`,
                }))}
                value={mapMode}
                onChange={handleMapModeChange}
              />
            ),
          },
          {
            id: 'speed',
            label: t.speedLabel,
            control: (
              <PillGroup<SpeedMode>
                size="sm"
                options={speeds.map(s => ({
                  value: s,
                  label: s === 'relaxed' ? t.speedRelaxed : s === 'normal' ? t.speedNormal : t.speedFast,
                  id: `snake-speed-${s}`,
                }))}
                value={speed}
                onChange={setSpeed}
              />
            ),
          },
        ]}
      />

      {/* Map Mode Change Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(pendingMapMode)}
        onClose={handleCancelMapChange}
        title={t.confirmResetTitle}
        description={t.confirmMapDesc}
        confirmLabel={t.confirmBtn}
        cancelLabel={t.cancelBtn}
        confirmVariant="danger"
        confirmId="snake-modal-confirm"
        cancelId="snake-modal-cancel"
        onConfirm={handleConfirmMapChange}
      />
    </div>
  )
}


