/** Size (px) of an element card lying on the table. */
export const ITEM_SIZE = 72
/** Two cards combine when their top-left corners are closer than this (px) on release. */
export const COMBINE_DISTANCE = 56

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

/** The item closest to (x, y) within combining distance, ignoring `ignoreUid`. */
export function findCombineTarget<T extends { uid: number; x: number; y: number }>(
  items: readonly T[],
  x: number,
  y: number,
  ignoreUid?: number,
): T | null {
  let best: T | null = null
  let bestDist = COMBINE_DISTANCE
  for (const other of items) {
    if (other.uid === ignoreUid) continue
    const dist = Math.hypot(other.x - x, other.y - y)
    if (dist < bestDist) {
      best = other
      bestDist = dist
    }
  }
  return best
}

/**
 * Converts a pointer position (viewport coordinates) into the top-left corner of a card centred on it,
 * relative to the workspace and kept inside it. `inside` tells whether the pointer is over the workspace.
 */
export function toWorkspacePoint(
  rect: { left: number; top: number; width: number; height: number },
  clientX: number,
  clientY: number,
): { x: number; y: number; inside: boolean } {
  const inside =
    rect.width > 0 &&
    rect.height > 0 &&
    clientX >= rect.left &&
    clientX <= rect.left + rect.width &&
    clientY >= rect.top &&
    clientY <= rect.top + rect.height
  return {
    inside,
    x: clamp(clientX - rect.left - ITEM_SIZE / 2, 0, Math.max(0, rect.width - ITEM_SIZE)),
    y: clamp(clientY - rect.top - ITEM_SIZE / 2, 0, Math.max(0, rect.height - ITEM_SIZE)),
  }
}
