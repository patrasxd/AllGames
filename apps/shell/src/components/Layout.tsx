import { createContext, useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { HeaderMenu } from './HeaderMenu'
import { useI18n } from '../i18n'
import { findGame } from '../games/registry'
import { getLocalizedText } from '../types/game'

interface LayoutProps {
  children: React.ReactNode
}

interface GameHeaderContextValue {
  headerExtra: React.ReactNode
  setHeaderExtra: (content: React.ReactNode) => void
}

const GameHeaderContext = createContext<GameHeaderContextValue>({
  headerExtra: null,
  setHeaderExtra: () => undefined,
})

export function useGameHeader() {
  return useContext(GameHeaderContext)
}

/**
 * Global application layout containing top navigation bar and dynamic content area.
 */
export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, locale } = useI18n()
  const [headerExtra, setHeaderExtra] = useState<React.ReactNode>(null)

  useEffect(() => {
    setHeaderExtra(null)
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    if (document.documentElement) {
      document.documentElement.scrollTop = 0
    }
  }, [location.pathname])

  const slug = location.pathname.match(/^\/games\/([^/]+)/)?.[1]
  const game = slug ? findGame(slug) : undefined
  const gameTitle = game ? getLocalizedText(game.metadata.name, locale) : ''
  const isGamePage = Boolean(game)

  return (
    <GameHeaderContext.Provider value={{ headerExtra, setHeaderExtra }}>
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <div className="header-left-group">
              <button
                className="header-logo"
                onClick={() => navigate('/')}
                style={{ background: 'none', border: 'none', padding: 0 }}
                aria-label={t.backToHomeAria}
              >
                AllGames
              </button>

              {isGamePage && (
                <div className="header-game-title" aria-live="polite">
                  {gameTitle}
                </div>
              )}
            </div>

            <div className="header-actions">
              {isGamePage && headerExtra && (
                <div className="header-game-stats">
                  {headerExtra}
                </div>
              )}
              <HeaderMenu />
            </div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </GameHeaderContext.Provider>
  )
}
