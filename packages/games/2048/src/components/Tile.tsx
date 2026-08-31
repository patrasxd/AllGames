import { memo } from 'react'
import { motion } from 'framer-motion'
import type { TileData, GridSize } from '../types'

interface TileProps {
  tile: TileData
  size: GridSize
  isEink: boolean
}

export const Tile = memo(function Tile({ tile, size, isEink }: TileProps) {
  // Tile dimensions and positioning percentages
  const cellSize = 100 / size
  const top = `${tile.row * cellSize}%`
  const left = `${tile.col * cellSize}%`

  const val = tile.value
  const digits = String(val).length

  let fontSize = '1.625rem'
  if (size === 5) {
    if (digits >= 5) fontSize = '0.75rem'
    else if (digits === 4) fontSize = '0.9rem'
    else if (digits === 3) fontSize = '1.1rem'
    else fontSize = '1.3rem'
  } else if (size === 4) {
    if (digits >= 5) fontSize = '0.85rem'
    else if (digits === 4) fontSize = '1.1rem'
    else if (digits === 3) fontSize = '1.35rem'
    else fontSize = '1.625rem'
  } else {
    // size === 3
    if (digits >= 5) fontSize = '1.1rem'
    else if (digits === 4) fontSize = '1.4rem'
    else if (digits === 3) fontSize = '1.75rem'
    else fontSize = '2.2rem'
  }

  return (
    <motion.div
      layout={!isEink}
      className={`tile-2048 tile-2048--v${val}`}
      style={{
        width: `${cellSize}%`,
        height: `${cellSize}%`,
        top,
        left,
        fontSize,
      }}
      initial={!isEink && tile.isNew ? { scale: 0, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: isEink ? 0 : 0.12 }}
    >
      <div className="tile-2048-inner">{val}</div>
    </motion.div>
  )
})
