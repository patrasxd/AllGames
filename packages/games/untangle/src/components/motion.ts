/** How long a freed rope takes to unravel and vanish. */
export const VANISH_MS = 850

/** Whether animations may run: not on e-ink, not with reduced motion, and never where matchMedia is missing (tests). */
export function motionAllowed(isEink = false): boolean {
  if (isEink || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  if (typeof requestAnimationFrame !== 'function') return false
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
