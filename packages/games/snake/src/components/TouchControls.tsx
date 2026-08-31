import type { Direction, Locale } from '../types'
import { snakeTranslations } from '../i18n'

interface TouchControlsProps {
  onDirection: (dir: Direction) => void
  locale?: Locale
}

export function TouchControls({ onDirection, locale = 'en' }: TouchControlsProps) {
  const t = snakeTranslations[locale] || snakeTranslations.en

  return (
    <div className="snake-dpad" role="group" aria-label={t.controlsHelp}>
      <button
        type="button"
        id="dpad-up"
        className="snake-dpad-btn snake-dpad-btn--up"
        onClick={() => onDirection('UP')}
        aria-label={t.upAria}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      <div className="snake-dpad-row">
        <button
          type="button"
          id="dpad-left"
          className="snake-dpad-btn snake-dpad-btn--left"
          onClick={() => onDirection('LEFT')}
          aria-label={t.leftAria}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          type="button"
          id="dpad-down"
          className="snake-dpad-btn snake-dpad-btn--down"
          onClick={() => onDirection('DOWN')}
          aria-label={t.downAria}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <button
          type="button"
          id="dpad-right"
          className="snake-dpad-btn snake-dpad-btn--right"
          onClick={() => onDirection('RIGHT')}
          aria-label={t.rightAria}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
