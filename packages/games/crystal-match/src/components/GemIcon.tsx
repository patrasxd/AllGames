import { memo } from 'react'
import type { GemType, SpecialType } from '../types'

interface GemIconProps {
  gem: GemType
  special?: SpecialType
  isEink?: boolean
  size?: number | string
}

export const GemIcon = memo(function GemIcon({
  gem,
  special = 'none',
  isEink = false,
  size = '100%',
}: GemIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`cm-gem-svg cm-gem-svg--${gem} ${special !== 'none' ? `cm-gem-svg--${special}` : ''}`}
      aria-hidden="true"
    >
      <defs>
        {/* Ruby Gradient */}
        <linearGradient id="ruby-grad" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f87171" />
          <stop offset="0.5" stopColor="#dc2626" />
          <stop offset="1" stopColor="#991b1b" />
        </linearGradient>

        {/* Sapphire Gradient */}
        <linearGradient id="sapphire-grad" x1="12" y1="6" x2="36" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60a5fa" />
          <stop offset="0.5" stopColor="#2563eb" />
          <stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>

        {/* Emerald Gradient */}
        <linearGradient id="emerald-grad" x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" />
          <stop offset="0.5" stopColor="#059669" />
          <stop offset="1" stopColor="#064e3b" />
        </linearGradient>

        {/* Topaz Gradient */}
        <linearGradient id="topaz-grad" x1="24" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" />
          <stop offset="0.5" stopColor="#d97706" />
          <stop offset="1" stopColor="#92400e" />
        </linearGradient>

        {/* Amethyst Gradient */}
        <linearGradient id="amethyst-grad" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c084fc" />
          <stop offset="0.5" stopColor="#9333ea" />
          <stop offset="1" stopColor="#581c87" />
        </linearGradient>

        {/* Amber Gradient */}
        <linearGradient id="amber-grad" x1="12" y1="10" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fb923c" />
          <stop offset="0.5" stopColor="#ea580c" />
          <stop offset="1" stopColor="#7c2d12" />
        </linearGradient>
      </defs>

      {/* Gem Shapes */}
      {gem === 'ruby' && (
        // Hexagon Crystal
        <g>
          <polygon
            points="24,6 39,15 39,33 24,42 9,33 9,15"
            fill={isEink ? 'var(--surface-2)' : 'url(#ruby-grad)'}
            stroke={isEink ? 'var(--text)' : '#fee2e2'}
            strokeWidth="1.5"
          />
          <polygon points="24,14 33,19 33,29 24,34 15,29 15,19" fill={isEink ? 'none' : 'rgba(255,255,255,0.25)'} />
          <line x1="24" y1="6" x2="24" y2="14" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" />
          <line x1="39" y1="15" x2="33" y2="19" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" />
          <line x1="39" y1="33" x2="33" y2="29" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" />
          <line x1="24" y1="42" x2="24" y2="34" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" />
          <line x1="9" y1="33" x2="15" y2="29" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" />
          <line x1="9" y1="15" x2="15" y2="19" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" />
        </g>
      )}

      {gem === 'sapphire' && (
        // Brilliant Diamond Cut
        <g>
          <polygon
            points="24,6 42,24 24,42 6,24"
            fill={isEink ? 'var(--surface-2)' : 'url(#sapphire-grad)'}
            stroke={isEink ? 'var(--text)' : '#dbeafe'}
            strokeWidth="1.5"
          />
          <polygon points="24,16 32,24 24,32 16,24" fill={isEink ? 'none' : 'rgba(255,255,255,0.3)'} />
          <line x1="24" y1="6" x2="24" y2="16" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" />
          <line x1="42" y1="24" x2="32" y2="24" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" />
          <line x1="24" y1="42" x2="24" y2="32" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" />
          <line x1="6" y1="24" x2="16" y2="24" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" />
        </g>
      )}

      {gem === 'emerald' && (
        // Octagonal Emerald Cut
        <g>
          <polygon
            points="14,8 34,8 40,14 40,34 34,40 14,40 8,34 8,14"
            fill={isEink ? 'var(--surface-2)' : 'url(#emerald-grad)'}
            stroke={isEink ? 'var(--text)' : '#d1fae5'}
            strokeWidth="1.5"
          />
          <rect x="15" y="15" width="18" height="18" fill={isEink ? 'none' : 'rgba(255,255,255,0.25)'} />
          <line x1="14" y1="8" x2="15" y2="15" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
          <line x1="34" y1="8" x2="33" y2="15" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
          <line x1="40" y1="34" x2="33" y2="33" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
          <line x1="14" y1="40" x2="15" y2="33" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
        </g>
      )}

      {gem === 'topaz' && (
        // Trilliant Triangle Cut
        <g>
          <polygon
            points="24,7 41,39 7,39"
            fill={isEink ? 'var(--surface-2)' : 'url(#topaz-grad)'}
            stroke={isEink ? 'var(--text)' : '#fef3c7'}
            strokeWidth="1.5"
          />
          <polygon points="24,20 33,34 15,34" fill={isEink ? 'none' : 'rgba(255,255,255,0.3)'} />
          <line x1="24" y1="7" x2="24" y2="20" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" />
          <line x1="41" y1="39" x2="33" y2="34" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" />
          <line x1="7" y1="39" x2="15" y2="34" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" />
        </g>
      )}

      {gem === 'amethyst' && (
        // Marquise Teardrop Oval
        <g>
          <path
            d="M24,6 C36,16 38,32 24,42 C10,32 12,16 24,6 Z"
            fill={isEink ? 'var(--surface-2)' : 'url(#amethyst-grad)'}
            stroke={isEink ? 'var(--text)' : '#f3e8ff'}
            strokeWidth="1.5"
          />
          <path d="M24,15 C30,22 30,30 24,35 C18,30 18,22 24,15 Z" fill={isEink ? 'none' : 'rgba(255,255,255,0.28)'} />
          <line x1="24" y1="6" x2="24" y2="15" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
          <line x1="24" y1="42" x2="24" y2="35" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
        </g>
      )}

      {gem === 'amber' && (
        // 8-Point Star / Radiant Cut
        <g>
          <polygon
            points="24,6 29,15 39,15 32,24 37,34 26,31 24,42 19,33 9,33 16,24 11,15 22,18"
            fill={isEink ? 'var(--surface-2)' : 'url(#amber-grad)'}
            stroke={isEink ? 'var(--text)' : '#ffedd5'}
            strokeWidth="1.5"
          />
          <circle cx="24" cy="24" r="5" fill={isEink ? 'none' : 'rgba(255,255,255,0.35)'} />
        </g>
      )}

      {/* Special Power Overlays */}
      {special === 'line-h' && (
        <g className="cm-special-beam">
          <line x1="2" y1="24" x2="46" y2="24" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
          <polygon points="4,24 10,20 10,28" fill="#ffffff" />
          <polygon points="44,24 38,20 38,28" fill="#ffffff" />
        </g>
      )}

      {special === 'line-v' && (
        <g className="cm-special-beam">
          <line x1="24" y1="2" x2="24" y2="46" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
          <polygon points="24,4 20,10 28,10" fill="#ffffff" />
          <polygon points="24,44 20,38 28,38" fill="#ffffff" />
        </g>
      )}

      {special === 'bomb' && (
        <g className="cm-special-bomb">
          <circle cx="24" cy="24" r="9" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeDasharray="3 3" />
          <circle cx="24" cy="24" r="4" fill="#ffffff" />
        </g>
      )}

      {special === 'prism' && (
        <g className="cm-special-prism">
          <circle cx="24" cy="24" r="16" stroke="url(#sapphire-grad)" strokeWidth="2" fill="none" />
          <polygon points="24,4 29,19 44,24 29,29 24,44 19,29 4,24 19,19" fill="#ffffff" />
          <circle cx="24" cy="24" r="5" fill="#f59e0b" />
        </g>
      )}
    </svg>
  )
})
