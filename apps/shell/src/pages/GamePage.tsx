import { Suspense, useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button, BackLink, ConfirmDialog } from '@all/ui'
import { findGame } from '../games/registry'
import { useI18n } from '../i18n'
import { useTheme } from '../hooks/useTheme'
import { useGameHeader } from '../components/Layout'

function GameFallback() {
  const { t } = useI18n()
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      minHeight: '200px',
      backgroundColor: 'var(--bg)',
      color: 'var(--text-muted)',
      fontSize: '0.8125rem',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      fontWeight: 500,
    }}>
      <motion.span
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
      >
        {t.loading}
      </motion.span>
    </div>
  )
}

function NotFound({ slug }: { slug: string }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  return (
    <div style={{ padding: '4rem 0', color: 'var(--text-muted)', textAlign: 'center' }}>
      <p>{t.notFound} <code style={{ fontFamily: 'var(--font-mono)' }}>{slug}</code></p>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate('/')}
        style={{ marginTop: '1rem' }}
      >
        {t.backToGames}
      </Button>
    </div>
  )
}

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, y: -6,  transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
}

export function GamePage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { locale, t } = useI18n()
  const { theme, isEink } = useTheme()
  const entry = findGame(slug)

  const [isGameActive, setIsGameActive] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  const { setHeaderExtra } = useGameHeader()
  const setHeader = useCallback((content: React.ReactNode) => {
    setHeaderExtra(content)
  }, [setHeaderExtra])

  const handleBack = useCallback(() => {
    if (isGameActive) {
      setShowLeaveConfirm(true)
    } else {
      navigate('/')
    }
  }, [isGameActive, navigate])

  return (
    <motion.div
      className="game-page"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="game-page-inner">
        <div className="container" style={{ width: '100%' }}>
          <BackLink
            id={`back-btn-${slug}`}
            label={t.backToGames}
            onClick={handleBack}
            aria-label={t.backToGamesAria}
            title={t.backToGames}
          />
        </div>

        {/* ── Game area — fills remaining viewport height ── */}
        <div className="game-page-content">
          {entry ? (
            <Suspense fallback={<GameFallback />}>
              {(() => {
                const GameComp = entry.load
                return (
                  <GameComp
                    setHeader={setHeader}
                    setIsActive={setIsGameActive}
                    locale={locale}
                    isEink={isEink}
                    theme={theme}
                  />
                )
              })()}
            </Suspense>
          ) : (
            <NotFound slug={slug} />
          )}
        </div>
      </div>

      {/* Confirmation Dialog when leaving an active game session */}
      <ConfirmDialog
        open={showLeaveConfirm}
        title={t.confirmLeaveTitle}
        description={t.confirmLeaveDesc}
        confirmLabel={t.confirmLeaveBtn}
        cancelLabel={t.cancelBtn}
        confirmVariant="danger"
        confirmId="leave-game-confirm-btn"
        cancelId="leave-game-cancel-btn"
        onConfirm={() => {
          setShowLeaveConfirm(false)
          navigate('/')
        }}
        onClose={() => setShowLeaveConfirm(false)}
      />
    </motion.div>
  )
}
