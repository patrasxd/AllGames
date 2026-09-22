import { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCrystalMatch } from './hooks/useCrystalMatch'
import { CrystalBoard } from './components/CrystalBoard'
import { GemIcon } from './components/GemIcon'
import { LevelSelectModal } from './components/LevelSelectModal'
import {
  IceGoalIcon,
  TargetScoreIcon,
  SparkleIcon,
  LaserBeamIcon,
  CrystalBombIcon,
  RainbowPrismIcon,
  StarIcon,
  MovesIcon,
  LockIcon,
} from './components/Icons'
import type { GameComponentProps } from './types'
import { crystalMatchTranslations } from './i18n'
import { BoardLayout, Dialog, ConfirmDialog, Button, ControlsBar, StatsHeader } from '@all/ui'
import { GameResultOverlay, GameStartOverlay } from '@allgames/ui'
import './styles/crystal-match.css'

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function HelpIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

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

export function CrystalMatch({ setHeader, setIsActive, locale = 'en', isEink = false }: GameComponentProps) {
  const t = crystalMatchTranslations[locale] || crystalMatchTranslations.en

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<'restart' | 'levels' | null>(null)

  const {
    level,
    config,
    board,
    movesLeft,
    score,
    goals,
    gameStatus,
    bursts,
    comboPopups,
    progress,
    isLevelModalOpen,
    setIsLevelModalOpen,
    isLevelIntroOpen,
    setIsLevelIntroOpen,
    isHowToPlayOpen,
    setIsHowToPlayOpen,
    hintCoords,
    handleSwap,
    nextLevel,
    restartLevel,
    selectLevel,
    resetAllProgress,
  } = useCrystalMatch({ isEink, locale })

  const isAnimating = gameStatus === 'animating'
  const totalStars = Object.values(progress.levelStars).reduce((sum, s) => sum + s, 0)
  const isGameActive = (movesLeft < config.maxMoves || score > 0) && gameStatus === 'playing'

  useEffect(() => {
    setIsActive?.(isGameActive)
    return () => setIsActive?.(false)
  }, [isGameActive, setIsActive])

  const handleRestartClick = () => {
    if (isGameActive) {
      setPendingAction('restart')
    } else {
      restartLevel()
    }
  }

  const handleLevelsClick = () => {
    if (isGameActive) {
      setPendingAction('levels')
    } else {
      setIsLevelModalOpen(true)
    }
  }

  // Injected Header Stats
  const renderHeader = useCallback(() => {
    if (!setHeader) return
    setHeader(
      <StatsHeader
        label={t.goals}
        items={[
          { key: 'level', label: 'LVL', value: level },
          { key: 'score', label: t.score, value: score },
          { key: 'moves', label: 'MOV', value: movesLeft },
          { key: 'stars', label: t.stars, value: totalStars },
        ]}
      />
    )
  }, [setHeader, t, level, score, movesLeft, totalStars])

  useEffect(() => {
    renderHeader()
  }, [renderHeader])

  useEffect(() => {
    return () => setHeader?.(null)
  }, [setHeader])

  return (
    <div className="cm-root">
      <motion.div
        className="cm-game"
        initial={!isEink ? { opacity: 0, scale: 0.98 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        <BoardLayout
          variant="square"
          hud={
            <div className="cm-goals-bar">
              <span className="cm-goals-label">
                <TargetScoreIcon size={13} />
                <span>{t.goals}:</span>
              </span>
              <div className="cm-goals-container">
                {goals.map((g, idx) => {
                  const isDone = g.type === 'score' ? score >= g.target : g.current >= g.target

                  return (
                    <div
                      key={idx}
                      className={`cm-goal-pill ${isDone ? 'cm-goal-pill--done' : ''}`}
                      title={
                        g.type === 'score'
                          ? t.scoreGoal(g.target)
                          : g.type === 'ice'
                          ? t.iceGoal(g.current, g.target)
                          : g.gemType
                          ? t.gemGoal(g.current, g.target, g.gemType)
                          : ''
                      }
                    >
                      {g.type === 'gems' && g.gemType && (
                        <div className="cm-goal-icon">
                          <GemIcon gem={g.gemType} isEink={isEink} size={14} />
                        </div>
                      )}
                      {g.type === 'ice' && (
                        <IceGoalIcon size={13} />
                      )}
                      {g.type === 'score' && (
                        <TargetScoreIcon size={13} />
                      )}

                      <span>
                        {g.type === 'score' ? `${score}/${g.target}` : `${g.current}/${g.target}`}
                      </span>
                      {isDone && <CheckIcon />}
                    </div>
                  )
                })}
              </div>
            </div>
          }
          board={
            <CrystalBoard
              board={board}
              isEink={isEink}
              isAnimating={isAnimating}
              bursts={bursts}
              comboPopups={comboPopups}
              hintCoords={hintCoords}
              onSwap={handleSwap}
            />
          }
          overlay={
            <AnimatePresence>
              {/* Level Intro */}
              {isLevelIntroOpen && (
                <GameStartOverlay
                  title={t.level(level)}
                  subtitle={t.levelTargetTitle}
                  startText={t.startLevel}
                  onStart={() => setIsLevelIntroOpen(false)}
                  startId="cm-start-level-btn"
                  isEink={isEink}
                  secondaryAction={{
                    label: t.howToPlay,
                    onClick: () => {
                      setIsLevelIntroOpen(false)
                      setIsHowToPlayOpen(true)
                    },
                    id: 'cm-rules-from-intro-btn',
                  }}
                >
                  <div className="cm-intro-goals-list">
                    {goals.map((g, idx) => (
                      <div key={idx} className="cm-intro-goal-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {g.type === 'gems' && g.gemType && (
                            <div style={{ width: 20, height: 20 }}>
                              <GemIcon gem={g.gemType} isEink={isEink} size={20} />
                            </div>
                          )}
                          {g.type === 'ice' && <IceGoalIcon size={18} />}
                          {g.type === 'score' && <TargetScoreIcon size={18} />}
                          <span>
                            {g.type === 'score'
                              ? t.scoreGoal(g.target)
                              : g.type === 'ice'
                              ? t.iceGoal(0, g.target)
                              : g.gemType
                              ? t.gemGoal(0, g.target, g.gemType)
                              : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                    {/* The move limit belongs to the level, not to a single goal: show it once, styled like the goals */}
                    <div className="cm-intro-goal-card" data-testid="cm-intro-moves">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MovesIcon size={18} />
                        <span>
                          {t.moves}: {config.maxMoves}
                        </span>
                      </div>
                    </div>
                  </div>
                </GameStartOverlay>
              )}

              {/* Victory Overlay */}
              {gameStatus === 'won' && (() => {
                const starsWon = score >= config.starThresholds[2] ? 3 : score >= config.starThresholds[1] ? 2 : 1
                const starTip = starsWon === 3 ? t.tip3Stars : starsWon === 2 ? t.tip2Stars : t.tip1Star
                // Score needed for the next star; nothing to show once all three are earned
                const nextStarAt = starsWon === 3 ? null : config.starThresholds[starsWon]

                return (
                  <GameResultOverlay
                    status="won"
                    title={t.victoryTitle}
                    subtitle={starTip}
                    isEink={isEink}
                    playAgainText={t.nextLevel}
                    onPlayAgain={nextLevel}
                    playAgainId="cm-next-level-btn"
                    stats={[
                      { label: t.score, value: score },
                      { label: t.movesLeft, value: movesLeft },
                      {
                        label: t.stars,
                        value: (
                          <div style={{ display: 'flex', gap: '3px', alignItems: 'center', justifyContent: 'center' }}>
                            <StarIcon filled={starsWon >= 1} size={16} />
                            <StarIcon filled={starsWon >= 2} size={16} />
                            <StarIcon filled={starsWon >= 3} size={16} />
                          </div>
                        ),
                      },
                      ...(nextStarAt !== null ? [{ label: t.nextStar, value: nextStarAt }] : []),
                    ]}
                    secondaryAction={{
                      label: t.levelSelect,
                      onClick: () => setIsLevelModalOpen(true),
                      id: 'cm-won-levels-btn',
                    }}
                  />
                )
              })()}

              {/* Defeat Overlay */}
              {gameStatus === 'lost' && (
                <GameResultOverlay
                  status="lost"
                  title={t.defeatTitle}
                  subtitle={t.defeatSub}
                  isEink={isEink}
                  playAgainText={t.tryAgain}
                  onPlayAgain={restartLevel}
                  playAgainId="cm-retry-btn"
                  stats={[
                    { label: t.score, value: score },
                    { label: t.target, value: config.starThresholds[0] },
                  ]}
                  secondaryAction={{
                    label: t.levelSelect,
                    onClick: () => setIsLevelModalOpen(true),
                    id: 'cm-lost-levels-btn',
                  }}
                />
              )}
            </AnimatePresence>
          }
          controls={
            <ControlsBar className="cm-controls-bar">
              <Button
                id="cm-levels-btn"
                variant="secondary"
                size="sm"
                onClick={handleLevelsClick}
              >
                {t.levelSelect}
              </Button>

              <Button
                id="cm-how-to-play-btn"
                variant="secondary"
                size="sm"
                onClick={() => setIsHowToPlayOpen(true)}
                icon={<HelpIcon />}
              >
                {t.howToPlay}
              </Button>

              <Button
                id="cm-restart-btn"
                variant="secondary"
                size="sm"
                onClick={handleRestartClick}
                icon={<RestartIcon />}
              >
                {t.restart}
              </Button>
            </ControlsBar>
          }
        />

        {/* How to Play Rules Modal */}
        <Dialog
          isOpen={isHowToPlayOpen}
          onClose={() => setIsHowToPlayOpen(false)}
          title={t.rulesTitle}
          maxWidth="sm"
          className="cm-dialog"
          footer={
            <div className="cm-modal-actions">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsHowToPlayOpen(false)}
              >
                OK
              </Button>
            </div>
          }
        >
          <div className="cm-rules-list">
            <div className="cm-rules-item">
              <SparkleIcon size={16} />
              <span>{t.rule1}</span>
            </div>
            <div className="cm-rules-item">
              <LaserBeamIcon size={16} />
              <span>{t.rule2}</span>
            </div>
            <div className="cm-rules-item">
              <CrystalBombIcon size={16} />
              <span>{t.rule3}</span>
            </div>
            <div className="cm-rules-item">
              <RainbowPrismIcon size={16} />
              <span>{t.rule4}</span>
            </div>
            <div className="cm-rules-item">
              <IceGoalIcon size={16} />
              <span>{t.rule5}</span>
            </div>
            <div className="cm-rules-item">
              <LockIcon size={16} />
              <span>{t.rule6}</span>
            </div>
          </div>
        </Dialog>

        {/* Level Select Modal */}
        <LevelSelectModal
          isOpen={isLevelModalOpen}
          progress={progress}
          currentLevel={level}
          onSelectLevel={selectLevel}
          onClose={() => setIsLevelModalOpen(false)}
          title={t.levelSelect}
        />

        {/* Restart / Level Select Confirmation Dialog */}
        <ConfirmDialog
          open={pendingAction !== null}
          title={pendingAction === 'restart' ? t.confirmRestartTitle : t.levelSelect}
          description={pendingAction === 'restart' ? t.confirmRestartDesc : t.confirmLevelSelectDesc}
          confirmLabel={pendingAction === 'restart' ? t.restart : t.confirmBtn}
          cancelLabel={t.cancelBtn}
          confirmVariant="danger"
          confirmId="cm-confirm-action-btn"
          cancelId="cm-cancel-action-btn"
          onConfirm={() => {
            if (pendingAction === 'restart') {
              restartLevel()
            } else if (pendingAction === 'levels') {
              setIsLevelModalOpen(true)
            }
            setPendingAction(null)
          }}
          onClose={() => setPendingAction(null)}
        />

        {/* Reset Progress Confirmation Dialog */}
        <ConfirmDialog
          open={isResetConfirmOpen}
          onClose={() => setIsResetConfirmOpen(false)}
          title={t.confirmResetProgress}
          description={t.confirmResetDesc}
          confirmLabel={t.confirmBtn}
          cancelLabel={t.cancelBtn}
          confirmVariant="danger"
          confirmId="cm-reset-confirm"
          cancelId="cm-reset-cancel"
          onConfirm={() => {
            resetAllProgress()
            setIsResetConfirmOpen(false)
          }}
        />
      </motion.div>
    </div>
  )
}
export default CrystalMatch
