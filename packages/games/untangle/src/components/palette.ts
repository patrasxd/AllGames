/** Rope colours (themes only change the board around them). E-ink themes ignore these and use patterns. */
export const ROPE_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#06b6d4', '#f97316']

/** Dash patterns that tell ropes apart on monochrome screens. */
export const ROPE_DASHES = ['0.8 2', '3 2.4', '1.2 1.2', '5 1.6 1 1.6', '2 4', '0.4 1.6', '4 4', '6 1.4']

export function ropeColor(id: number): string {
  return ROPE_COLORS[id % ROPE_COLORS.length]
}

export function ropeDash(id: number): string {
  return ROPE_DASHES[id % ROPE_DASHES.length]
}
