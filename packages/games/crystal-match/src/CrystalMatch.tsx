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
  TipIcon,
  StarIcon,
} from './components/Icons'
import type { GameComponentProps } from './types'
import { crystalMatchTranslations } from './i18n'
import { StatsHeader, GameButton, ControlsBar, GameResultOverlay, GameModal } from '@allgames/ui'
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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

export function CrystalMatch({ setHeader, locale = 'en', isEink = false }: GameComponentProps) {
  const t = crystalMatchTranslations[locale] || crystalMatchTranslations.en
  const isPl = locale === 'pl'

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)

  const {
    level,
    config,
    board,
    movesLeft,
    score,
    goals,
    gameStatus,
    particles,
    comboPopups,
    progress,
    isLevelModalOpen,
    setIsLevelModalOpen,
    isLevelIntroOpen,
    setIsLevelIntroOpen,
    isHowToPlayOpen,
    setIsHowToPlayOpen,
    hintCoords,
    swapAnimation,
    handleSwap,
    nextLevel,
    restartLevel,
    selectLevel,
    resetAllProgress,
  } = useCrystalMatch({ isEink })

  const isAnimating = gameStatus === 'animating'
  const totalStars = Object.values(progress.levelStars).reduce((sum, s) => sum + s, 0)

  // Injected Header Stats
  const renderHeader = useCallback(() => {
    if (!setHeader) return
    setHeader(
      <StatsHeader
        label={isPl ? 'Postęp' : 'Progress'}
        items={[
          { key: 'level', label: isPl ? 'Poziom' : 'Level', value: level },
          { key: 'score', label: isPl ? 'Wynik' : 'Score', value: score },
          { key: 'moves', label: isPl ? 'Ruchy' : 'Moves', value: movesLeft },
          { key: 'stars', label: isPl ? 'Gwiazdki' : 'Stars', value: totalStars },
        ]}
      />
    )
  }, [setHeader, isPl, level, score, movesLeft, totalStars])

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
        {/* Active Goals Target Bar (Board-width, Non-duplicated) */}
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

        {/* Level 1 Tutorial Tip */}
        {level === 1 && !isLevelIntroOpen && movesLeft >= 18 && (
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-dim)',
              textAlign: 'center',
              padding: '0 0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            <TipIcon size={14} />
            <span>{t.tutorialTip}</span>
          </div>
        )}

        {/* Interactive Board Grid */}
        <CrystalBoard
          board={board}
          isEink={isEink}
          isAnimating={isAnimating}
          particles={particles}
          comboPopups={comboPopups}
          swapAnimation={swapAnimation}
          hintCoords={hintCoords}
          onSwap={handleSwap}
        />

        {/* In-Game Action Bar (Board-width, equal 1/3 buttons) */}
        <div className="cm-controls">
          <GameButton
            id="cm-levels-btn"
            variant="secondary"
            onClick={() => setIsLevelModalOpen(true)}
          >
            {t.levelSelect}
          </GameButton>

          <GameButton
            id="cm-how-to-play-btn"
            variant="secondary"
            onClick={() => setIsHowToPlayOpen(true)}
          >
            <HelpIcon />
            <span>{t.howToPlay}</span>
          </GameButton>

          <GameButton
            id="cm-restart-btn"
            variant="secondary"
            onClick={restartLevel}
          >
            {t.restart}
          </GameButton>
        </div>

        {/* Level Goal Intro Modal */}
        <AnimatePresence>
          {isLevelIntroOpen && (
            <div className="cm-modal-overlay" role="dialog" aria-modal="true">
              <div className="cm-intro-modal">
                <h3 className="cm-intro-title">{t.level(level)}</h3>
                <p className="cm-intro-subtitle">{t.levelTargetTitle}</p>

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
                      <span style={{ color: 'var(--text-muted)' }}>
                        {movesLeft} {t.moves.toLowerCase()}
                      </span>
                    </div>
                  ))}
                </div>

                <GameButton
                  id="cm-start-level-btn"
                  variant="primary"
                  onClick={() => setIsLevelIntroOpen(false)}
                >
                  {t.startLevel}
                </GameButton>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* How to Play Rules Modal */}
        <AnimatePresence>
          {isHowToPlayOpen && (
            <div className="cm-modal-overlay" role="dialog" aria-modal="true">
              <div className="cm-intro-modal">
                <div className="cm-level-modal-header">
                  <h3 className="cm-intro-title">{t.rulesTitle}</h3>
                  <button
                    type="button"
                    className="cm-modal-close-btn"
                    onClick={() => setIsHowToPlayOpen(false)}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

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
                </div>

                <GameButton
                  variant="primary"
                  onClick={() => setIsHowToPlayOpen(false)}
                >
                  OK
                </GameButton>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Victory Dialog */}
        <AnimatePresence>
          {gameStatus === 'won' && (
            <GameResultOverlay
              status="won"
              title={t.victoryTitle}
              subtitle={t.victorySub}
              isEink={isEink}
              playAgainText={t.nextLevel}
              onPlayAgain={nextLevel}
              playAgainId="cm-next-level-btn"
              stats={[
                { label: t.score, value: score },
                { label: t.moves, value: movesLeft },
                {
                  label: t.stars,
                  value: (
                    <div style={{ display: 'flex', gap: '3px', alignItems: 'center', justifyContent: 'center' }}>
                      <StarIcon filled={score >= config.starThresholds[0]} size={16} />
                      <StarIcon filled={score >= config.starThresholds[1]} size={16} />
                      <StarIcon filled={score >= config.starThresholds[2]} size={16} />
                    </div>
                  ),
                },
              ]}
              secondaryAction={{
                label: t.levelSelect,
                onClick: () => setIsLevelModalOpen(true),
                id: 'cm-won-levels-btn',
              }}
            />
          )}
        </AnimatePresence>

        {/* Defeat Dialog */}
        <AnimatePresence>
          {gameStatus === 'lost' && (
            <GameResultOverlay
              status="lost"
              title={t.defeatTitle}
              subtitle={t.defeatSub}
              isEink={isEink}
              playAgainText={t.tryAgain}
              onPlayAgain={restartLevel}
              playAgainId="cm-try-again-btn"
              stats={[
                { label: t.score, value: score },
                { label: t.moves, value: 0 },
              ]}
              secondaryAction={{
                label: t.levelSelect,
                onClick: () => setIsLevelModalOpen(true),
                id: 'cm-lost-levels-btn',
              }}
            />
          )}
        </AnimatePresence>

        {/* Saga Level Selector Modal */}
        <AnimatePresence>
          {isLevelModalOpen && (
            <LevelSelectModal
              progress={progress}
              currentLevel={level}
              onSelectLevel={selectLevel}
              onClose={() => setIsLevelModalOpen(false)}
              isPl={isPl}
            />
          )}
        </AnimatePresence>

        {/* Reset Progress Confirmation Modal */}
        <AnimatePresence>
          {isResetConfirmOpen && (
            <GameModal
              title={t.confirmResetProgress}
              description={t.confirmResetDesc}
              cancelText={t.cancelBtn}
              confirmText={t.confirmBtn}
              cancelId="cm-reset-cancel"
              confirmId="cm-reset-confirm"
              onCancel={() => setIsResetConfirmOpen(false)}
              onConfirm={() => {
                resetAllProgress()
                setIsResetConfirmOpen(false)
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
export default CrystalMatch
