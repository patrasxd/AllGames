import type { ReactNode } from 'react'

export interface ModeOption<T = string> {
  id: T
  title: string
  desc: string
  icon: ReactNode
  ariaLabel?: string
}

export interface ModeSelectProps<T = string> {
  label?: string
  options: ModeOption<T>[]
  onSelect: (mode: T) => void
}

export function ModeSelect<T = string>({
  label = 'Choose game mode',
  options,
  onSelect,
}: ModeSelectProps<T>) {
  return (
    <div className="game-mode-select">
      {label && <p className="game-mode-label">{label}</p>}
      <div className="game-mode-options">
        {options.map(opt => (
          <button
            key={String(opt.id)}
            type="button"
            id={`mode-opt-${String(opt.id)}`}
            className="game-mode-card"
            onClick={() => onSelect(opt.id)}
            aria-label={opt.ariaLabel || opt.title}
          >
            <span className="game-mode-icon" aria-hidden="true">
              {opt.icon}
            </span>
            <span className="game-mode-title">{opt.title}</span>
            <span className="game-mode-desc">{opt.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
