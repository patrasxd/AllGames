import { memo } from 'react'
import type { Locale } from '../types'
import { sudokuTranslations } from '../i18n'
import { Button, UndoIcon } from '@all/ui'
import { PencilIcon, EraserIcon } from '@allgames/ui'

interface NumpadProps {
  pencilMode: boolean
  canUndo?: boolean
  locale: Locale
  onNumber: (num: number) => void
  onErase: () => void
  onTogglePencil: () => void
  onUndo: () => void
}

export const Numpad = memo(function Numpad({
  pencilMode,
  canUndo = false,
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
        <Button
          id="sdk-tool-undo"
          variant="secondary"
          size="sm"
          disabled={!canUndo}
          icon={<UndoIcon />}
          onClick={onUndo}
          aria-label={t.undo}
          title={t.undo}
        >
          {t.undo}
        </Button>

        <Button
          id="sdk-tool-erase"
          variant="secondary"
          size="sm"
          icon={<EraserIcon />}
          onClick={onErase}
          aria-label={t.erase}
          title={t.erase}
        >
          {t.erase}
        </Button>

        <Button
          id="sdk-tool-pencil"
          variant={pencilMode ? 'primary' : 'secondary'}
          size="sm"
          icon={<PencilIcon />}
          onClick={onTogglePencil}
          aria-label={t.pencil}
          title={t.pencil}
          aria-pressed={pencilMode}
        >
          {t.pencil}
        </Button>
      </div>

      {/* 1-9 Number Row / Grid */}
      <div className="sdk-numbers-row">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
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
