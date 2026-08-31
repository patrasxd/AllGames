import { useNavigate } from 'react-router-dom'
import { HeaderMenu } from './HeaderMenu'
import { useI18n } from '../i18n'

interface LayoutProps {
  children: React.ReactNode
}

/**
 * Global application layout containing top navigation bar and dynamic content area.
 */
export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <button
              className="header-logo"
              onClick={() => navigate('/')}
              style={{ background: 'none', border: 'none', padding: 0 }}
              aria-label={t.backToHomeAria}
            >
              AllGames
              <span>beta</span>
            </button>

            <div className="header-actions">
              <HeaderMenu />
            </div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </>
  )
}
