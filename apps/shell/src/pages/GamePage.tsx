import { Suspense, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { findGame } from '../games/registry'
import { useI18n } from '../i18n'
import { useTheme } from '../hooks/useTheme'
import { useEink } from '../hooks/useEink'
import { useGameHeader } from '../components/Layout'

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
  const { t } = useI18n()
  return (
    <div style={{ padding: '4rem 0', color: 'var(--text-muted)' }}>
      <p>{t.notFound} <code style={{ fontFamily: 'var(--font-mono)' }}>{slug}</code></p>
      <Link
        to="/"
        className="game-floating-back"
        style={{ marginTop: '1rem', display: 'inline-flex' }}
      >
        <span>{t.backToGames}</span>
      </Link>
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
  const { locale, t } = useI18n()
  const { theme } = useTheme()
  const { isEink } = useEink()
  const entry = findGame(slug)

  const { setHeaderExtra } = useGameHeader()
  const setHeader = useCallback((content: React.ReactNode) => {
    setHeaderExtra(content)
  }, [setHeaderExtra])

  return (
    <motion.div
      className="game-page"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="game-page-inner container">
        <Link
          to="/"
          className="game-floating-back"
          aria-label={t.backToGamesAria}
          title={t.backToGames}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
            <path d="M9 12h10" />
          </svg>
          <span>{t.backToGames}</span>
        </Link>

        {/* ── Game area — fills remaining viewport height ── */}
        <div className="game-page-content">
          {entry ? (
            <Suspense fallback={<GameFallback />}>
              {(() => {
                const GameComp = entry.load
                return <GameComp setHeader={setHeader} locale={locale} isEink={isEink} theme={theme} />
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
