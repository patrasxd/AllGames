import { describe, it, expect } from 'vitest'
import {
  DIFFICULTY_CONFIGS,
  MAX_AIM_ANGLE,
  cellExists,
  createShotBubble,
  findFloatingCells,
  findLandingCell,
  generateInitialGrid,
  insertRowAtTop,
  isBoardCleared,
  isGameOver,
  launchShotBubble,
  randomColor,
  activeColors,
  settleBubble,
  stepShotBubble,
} from '../logic/engine'
import type { Difficulty } from '../types'

/** Plays random games end-to-end on the real engine and checks board invariants after every move. */
describe('Bubble Shooter simulation', () => {
  it.each<Difficulty>(['easy', 'normal', 'hard'])('never leaves a floating or misplaced bubble (%s)', (difficulty) => {
    const config = DIFFICULTY_CONFIGS[difficulty]

    for (let game = 0; game < 60; game++) {
      let grid = generateInitialGrid(config.initialRows, config.colorCount)
      let parity = 0
      let shotsLeft = config.shotsPerNewRow

      for (let move = 0; move < 80 && !isGameOver(grid) && !isBoardCleared(grid); move++) {
        const angle = (Math.random() * 2 - 1) * MAX_AIM_ANGLE
        let bubble = launchShotBubble(createShotBubble(randomColor(activeColors(grid))), angle, config.shotSpeed)

        let landing = null
        for (let step = 0; step < 4000 && !landing; step++) {
          bubble = stepShotBubble(bubble, 0.5)
          landing = findLandingCell(bubble, grid, parity)
        }
        expect(landing).not.toBeNull()
        expect(cellExists(landing!.row, landing!.col, parity)).toBe(true)
        expect(grid[landing!.row][landing!.col]).toBeNull()

        grid = settleBubble(grid, landing!.row, landing!.col, bubble.color, parity).grid
        expect(findFloatingCells(grid, parity).size).toBe(0)

        if (--shotsLeft <= 0) {
          const inserted = insertRowAtTop(grid, config.colorCount, parity)
          grid = inserted.grid
          parity = inserted.parity
          shotsLeft = config.shotsPerNewRow
          expect(findFloatingCells(grid, parity).size).toBe(0)
        }

        // Every stored bubble must sit in a slot that exists for the current parity.
        grid.forEach((row, r) =>
          row.forEach((cell, c) => {
            if (cell) expect(cellExists(r, c, parity)).toBe(true)
          }),
        )
      }
    }
  })
})
