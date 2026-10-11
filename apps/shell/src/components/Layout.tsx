import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppHeader, clearLastActiveCardId, setLastActiveCardId } from '@all/ui'
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
  setHeaderBackAction: (action: (() => void) | null) => void
}

const GameHeaderContext = createContext<GameHeaderContextValue>({
  headerExtra: null,
  setHeaderExtra: () => undefined,
  setHeaderBackAction: () => undefined,
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
  const [headerBackAction, setHeaderBackActionState] = useState<(() => void) | null>(null)
  const setHeaderBackAction = useCallback((action: (() => void) | null) => {
    setHeaderBackActionState(() => action)
  }, [])

  useEffect(() => {
    setHeaderExtra(null)
    // Only force scroll-to-top when navigating into a game or subpage.
    // When navigating to home ('/'), allow useCardScrollRestoration to position the last active card.
    if (location.pathname !== '/') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      if (document.documentElement) {
        document.documentElement.scrollTop = 0
      }
    }
  }, [location.pathname])

  const slug = location.pathname.match(/^\/games\/([^/]+)/)?.[1]
  const game = slug ? findGame(slug) : undefined
  const gameTitle = game ? getLocalizedText(game.metadata.name, locale) : ''
  const isGamePage = Boolean(game)

  return (
    <GameHeaderContext.Provider value={{ headerExtra, setHeaderExtra, setHeaderBackAction }}>
      <AppHeader
        logo={
          <button
            type="button"
            className="header-logo"
            onClick={() => {
              if (isGamePage && headerBackAction) {
                headerBackAction()
                return
              }
              if (isGamePage && slug) {
                setLastActiveCardId(`game-card-${slug}`)
              } else {
                clearLastActiveCardId()
              }
              window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
              navigate('/')
            }}
            aria-label={isGamePage ? t.backToGamesAria : t.backToHomeAria}
          >
            AllGames
          </button>
        }
        title={isGamePage ? gameTitle : undefined}
        actions={isGamePage && headerExtra ? headerExtra : undefined}
        menu={<HeaderMenu />}
      />

      <main className="app-main">{children}</main>
    </GameHeaderContext.Provider>
  )
}
