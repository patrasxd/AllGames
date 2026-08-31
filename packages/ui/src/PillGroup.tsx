export interface PillOption<T = string> {
  value: T
  label: string
  id?: string
}

export interface PillGroupProps<T = string> {
  label?: string
  options: PillOption<T>[]
  value: T
  onChange: (val: T) => void
}

export function PillGroup<T = string>({
  label,
  options,
  value,
  onChange,
}: PillGroupProps<T>) {
  return (
    <div className="game-pill-group" role="group" aria-label={label}>
      {options.map(opt => {
        const isActive = opt.value === value
        return (
          <button
            key={String(opt.value)}
            type="button"
            id={opt.id || `pill-btn-${String(opt.value)}`}
            className={`game-pill-btn ${isActive ? 'game-pill-btn--active' : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
