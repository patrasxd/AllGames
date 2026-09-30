import type { BallColor } from '../types'

export function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    >
      <path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17.8l-6.1 3.2 1.5-6.8-5.2-4.7 6.9-.7z" />
    </svg>
  )
}

export function LockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </svg>
  )
}

// Colour-blind-safe palette: same hue+lightness reasoning as Bubble Shooter's, extended with two
// lightness-extreme colors (charcoal, cream) which stay distinguishable under any color vision type.
export const BALL_HEX: Record<BallColor, string> = {
  red: '#C25400', // vermilion
  blue: '#1F79B8', // deep blue
  green: '#12A57C', // bluish green
  yellow: '#E3D62A', // yellow
  purple: '#EBA7CB', // light pink
  orange: '#3B9BD6', // sky blue
  charcoal: '#2B2B2B',
  cream: '#F2EDE1',
}

const GLYPH_ORDER: BallColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'charcoal', 'cream']

/** Every color has its own symbol so the game never relies on hue alone to tell colors apart. */
export function BallGlyph({
  color,
  size = 12,
  ink = '#ffffff',
  outline = 'rgba(0,0,0,0.55)',
}: {
  color: BallColor
  size?: number
  ink?: string
  outline?: string
}) {
  const idx = GLYPH_ORDER.indexOf(color)
  const s = size
  const common = {
    stroke: ink,
    strokeWidth: s * 0.16,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  }
  const outlineCommon = { ...common, stroke: outline, strokeWidth: s * 0.3 }

  const shape = (props: typeof common) => {
    switch (idx) {
      case 0: // dot
        return <circle cx={0} cy={0} r={s * 0.22} fill={props.stroke} stroke="none" />
      case 1: // ring
        return <circle cx={0} cy={0} r={s * 0.32} {...props} />
      case 2: // plus
        return (
          <g {...props}>
            <path d={`M${-s * 0.34} 0H${s * 0.34}`} />
            <path d={`M0 ${-s * 0.34}V${s * 0.34}`} />
          </g>
        )
      case 3: // cross
        return (
          <g {...props}>
            <path d={`M${-s * 0.3} ${-s * 0.3}L${s * 0.3} ${s * 0.3}`} />
            <path d={`M${s * 0.3} ${-s * 0.3}L${-s * 0.3} ${s * 0.3}`} />
          </g>
        )
      case 4: // triangle
        return <path d={`M0 ${-s * 0.35}L${s * 0.34} ${s * 0.25}H${-s * 0.34}Z`} {...props} />
      case 5: // two bars
        return (
          <g {...props}>
            <path d={`M${-s * 0.32} ${-s * 0.15}H${s * 0.32}`} />
            <path d={`M${-s * 0.32} ${s * 0.15}H${s * 0.32}`} />
          </g>
        )
      case 6: // square
        return <rect x={-s * 0.26} y={-s * 0.26} width={s * 0.52} height={s * 0.52} {...props} />
      default: // diamond
        return <path d={`M0 ${-s * 0.34}L${s * 0.34} 0L0 ${s * 0.34}L${-s * 0.34} 0Z`} {...props} />
    }
  }

  return (
    <svg width={s} height={s} viewBox={`${-s / 2} ${-s / 2} ${s} ${s}`} aria-hidden="true">
      {shape(outlineCommon)}
      {shape(common)}
    </svg>
  )
}

export function HelpIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}
