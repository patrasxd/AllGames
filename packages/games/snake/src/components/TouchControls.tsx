import { useRef } from 'react'
import type { Direction, Locale } from '../types'
import { snakeTranslations } from '../i18n'

interface TouchControlsProps {
  onDirection: (dir: Direction) => void
  locale?: Locale
}

export function TouchControls({ onDirection, locale = 'en' }: TouchControlsProps) {
  const t = snakeTranslations[locale] || snakeTranslations.en
  const lastTouchRef = useRef(0)

  function makeHandlers(dir: Direction) {
    return {
      onTouchStart: (e: React.TouchEvent) => {
        e.preventDefault()
        lastTouchRef.current = Date.now()
        onDirection(dir)
      },
      onClick: () => {
        // ignoruj jeśli touch był <500ms temu (zapobiega double-fire w Chrome)
        if (Date.now() - lastTouchRef.current < 500) return
        onDirection(dir)
      },
    }
  }

  return (
    <div className="snake-dpad" role="group" aria-label={t.controlsHelp}>
      <button
        type="button"
        id="dpad-up"
        className="snake-dpad-btn snake-dpad-btn--up"
        {...makeHandlers('UP')}
        aria-label={t.upAria}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      <div className="snake-dpad-row">
        <button
          type="button"
          id="dpad-left"
          className="snake-dpad-btn snake-dpad-btn--left"
          {...makeHandlers('LEFT')}
          aria-label={t.leftAria}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          type="button"
          id="dpad-down"
          className="snake-dpad-btn snake-dpad-btn--down"
          {...makeHandlers('DOWN')}
          aria-label={t.downAria}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <button
          type="button"
          id="dpad-right"
          className="snake-dpad-btn snake-dpad-btn--right"
          {...makeHandlers('RIGHT')}
          aria-label={t.rightAria}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
