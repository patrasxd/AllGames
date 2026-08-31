import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

export interface GameButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  children?: ReactNode
}

export const GameButton = forwardRef<HTMLButtonElement, GameButtonProps>(function GameButton(
  {
    variant = 'secondary',
    size = 'md',
    icon,
    children,
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  const variantClass = variant === 'primary' ? 'game-btn--primary' : variant === 'ghost' ? 'game-btn--ghost' : ''
  const sizeClass = size === 'sm' ? 'game-btn--sm' : size === 'lg' ? 'game-btn--lg' : ''

  return (
    <button
      ref={ref}
      type={type}
      className={`game-btn ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {icon && <span className="game-btn-icon" aria-hidden="true">{icon}</span>}
      {children && <span className="game-btn-text">{children}</span>}
    </button>
  )
})
