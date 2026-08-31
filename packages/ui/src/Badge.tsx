import { memo, type ReactNode, type CSSProperties } from 'react'

export interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'accent' | 'warning' | 'success' | 'danger'
  size?: 'sm' | 'md'
  className?: string
  style?: CSSProperties
}

export const Badge = memo(function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  style,
}: BadgeProps) {
  return (
    <span
      className={`game-badge game-badge--${variant} game-badge--${size} ${className}`.trim()}
      style={style}
    >
      {children}
    </span>
  )
})
