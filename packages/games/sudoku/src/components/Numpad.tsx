import { memo } from 'react'
import type { Locale } from '../types'
import { sudokuTranslations } from '../i18n'

interface NumpadProps {
  pencilMode: boolean
  locale: Locale
  onNumber: (num: number) => void
  onErase: () => void
  onTogglePencil: () => void
  onUndo: () => void
}

/* ─── Sketched Action Icons ──────────────────────────────── */
function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  )
}

function EraserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 20H7L3 16C2 15 2 13 3 12L13 2C14 1 16 1 17 2L22 7C23 8 23 10 22 11L14 19" />
      <path d="M7 12l7 7" />
    </svg>
  )
}

function UndoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  )
}

export const Numpad = memo(function Numpad({
  pencilMode,
  locale,
  onNumber,
  onErase,
  onTogglePencil,
  onUndo,
}: NumpadProps) {
  const t = sudokuTranslations[locale] || sudokuTranslations.en

  return (
    <div className="sdk-numpad-container">
      {/* Top Action Tools */}
      <div className="sdk-tools-row">
        <button
          type="button"
          id="sdk-tool-undo"
          className="sdk-tool-btn"
          onClick={onUndo}
          aria-label={t.undo}
          title={t.undo}
        >
          <UndoIcon />
          <span>{t.undo}</span>
        </button>

        <button
          type="button"
          id="sdk-tool-erase"
          className="sdk-tool-btn"
          onClick={onErase}
          aria-label={t.erase}
          title={t.erase}
        >
          <EraserIcon />
          <span>{t.erase}</span>
        </button>

        <button
          type="button"
          id="sdk-tool-pencil"
          className={`sdk-tool-btn ${pencilMode ? 'sdk-tool-btn--active' : ''}`}
          onClick={onTogglePencil}
          aria-label={t.pencil}
          title={t.pencil}
        >
          <PencilIcon />
          <span>{t.pencil}</span>
        </button>
      </div>

      {/* 1-9 Number Row */}
      <div className="sdk-numbers-row">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            type="button"
            id={`sdk-num-${num}`}
            className="sdk-num-btn"
            onClick={() => onNumber(num)}
            aria-label={`Digit ${num}`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  )
})
