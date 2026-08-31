import { Suspense, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { findGame } from '../games/registry'
import { useI18n } from '../i18n'
import { useEink } from '../hooks/useEink'
import { getLocalizedText } from '../types/game'

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2L3 7l5 5" />
      <path d="M3 7h9" />
    </svg>
  )
}

function GameFallback() {
  const { t } = useI18n()
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
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
  const navigate = useNavigate()
  const { t } = useI18n()
  return (
    <div style={{ padding: '4rem 0', color: 'var(--text-muted)' }}>
      <p>{t.notFound} <code style={{ fontFamily: 'var(--font-mono)' }}>{slug}</code></p>
      <button
        onClick={() => navigate('/')}
        style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 0 }}
      >
        {t.returnToGames}
      </button>
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
  const { isEink } = useEink()
  const entry = findGame(slug)

  // Header slot — games can inject their stats/UI here via the setHeader prop
  const [headerExtra, setHeaderExtra] = useState<React.ReactNode>(null)
  const setHeader = useCallback((content: React.ReactNode) => {
    setHeaderExtra(content)
  }, [])

  const title = entry ? getLocalizedText(entry.metadata.name, locale) : ''

  return (
    <motion.div
      className="game-page"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="game-page-inner container">
        {/* ── Compact header ── */}
        <header className="game-page-header">
          <button
            id={`back-btn-${slug}`}
            className="back-button"
            onClick={() => navigate(-1)}
            aria-label={t.backToGamesAria}
          >
            <BackIcon />
            {t.backToGames}
          </button>

          <div className="game-page-title-row">
            <h1 className="game-page-title">
              {title}
            </h1>

            {/* Stats injected by the game component */}
            <AnimatePresence>
              {headerExtra && (
                <motion.div
                  className="game-page-header-extra"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  {headerExtra}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <div className="divider" role="separator" />

        {/* ── Game area — fills remaining viewport height ── */}
        <div className="game-page-content">
          {entry ? (
            <Suspense fallback={<GameFallback />}>
              {(() => {
                const GameComp = entry.load
                return <GameComp setHeader={setHeader} locale={locale} isEink={isEink} />
              })()}
            </Suspense>
          ) : (
            <NotFound slug={slug} />
          )}
        </div>
      </div>
    </motion.div>
  )
}
