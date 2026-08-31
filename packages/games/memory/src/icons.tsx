import React from 'react'

export const MEMORY_SYMBOLS = [
  'star',
  'moon',
  'sun',
  'heart',
  'lightning',
  'crown',
  'diamond',
  'key',
  'anchor',
  'flame',
  'feather',
  'tree',
] as const

export type MemorySymbolId = (typeof MEMORY_SYMBOLS)[number]

export function renderMemorySymbol(id: string) {
  const props = {
    width: '32',
    height: '32',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (id) {
    case 'star':
      return (
        <svg {...props}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    case 'moon':
      return (
        <svg {...props}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )
    case 'sun':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )
    case 'heart':
      return (
        <svg {...props}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )
    case 'lightning':
      return (
        <svg {...props}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      )
    case 'crown':
      return (
        <svg {...props}>
          <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5v-2z" />
        </svg>
      )
    case 'diamond':
      return (
        <svg {...props}>
          <polygon points="6 3 18 3 22 9 12 22 2 9" />
          <line x1="2" y1="9" x2="22" y2="9" />
          <line x1="12" y1="22" x2="8" y2="9" />
          <line x1="12" y1="22" x2="16" y2="9" />
          <line x1="6" y1="3" x2="8" y2="9" />
          <line x1="18" y1="3" x2="16" y2="9" />
        </svg>
      )
    case 'key':
      return (
        <svg {...props}>
          <circle cx="7.5" cy="15.5" r="5.5" />
          <path d="M11.4 11.6L21 2M15.5 7.5L18 10M18 5L20.5 7.5" />
        </svg>
      )
    case 'anchor':
      return (
        <svg {...props}>
          <circle cx="12" cy="5" r="3" />
          <line x1="12" y1="22" x2="12" y2="8" />
          <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
        </svg>
      )
    case 'flame':
      return (
        <svg {...props}>
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      )
    case 'feather':
      return (
        <svg {...props}>
          <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
          <line x1="16" y1="8" x2="2" y2="22" />
          <line x1="17.5" y1="15" x2="9" y2="15" />
        </svg>
      )
    case 'tree':
      return (
        <svg {...props}>
          <polygon points="12 2 4 10 8 10 3 17 9 17 9 22 15 22 15 17 21 17 16 10 20 10 12 2" />
        </svg>
      )
    default:
      return null
  }
}
