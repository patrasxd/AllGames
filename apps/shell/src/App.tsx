import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { GamePage } from './pages/GamePage'
import { LegalPage } from './pages/LegalPage'
import { useI18n } from './i18n'
import { GAMES } from './games/registry'
import { getLocalizedText } from './types/game'

function NotFoundRoute() {
  const { t } = useI18n()
  return (
    <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
      <p>{t.pageNotFound}</p>
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const { locale } = useI18n()

  useEffect(() => {
    const [section, slug] = location.pathname.split('/').filter(Boolean)
    const game = section === 'games' ? GAMES.find((entry) => entry.metadata.slug === slug) : undefined
    document.title = game ? `${getLocalizedText(game.metadata.name, locale)} · AllGames` : 'AllGames'
  }, [location.pathname, locale])

  const routes = (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<HomePage />} />
      <Route path="/games/:slug" element={<GamePage />} />
      <Route path="/legal" element={<LegalPage />} />
      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  )

  return <Layout>{routes}</Layout>
}
