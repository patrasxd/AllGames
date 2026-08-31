import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useI18n } from '../i18n'
import { getLocalizedText, getLocalizedTags } from '../types/game'
import type { GameMetadata } from '../types/game'
import { Badge } from '@allgames/ui'

interface GameCardProps {
  metadata: GameMetadata
  index: number
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
}

export function GameCard({ metadata, index }: GameCardProps) {
  const navigate = useNavigate()
  const { locale, t } = useI18n()

  const name = getLocalizedText(metadata.name, locale)
  const description = getLocalizedText(metadata.description, locale)
  const tags = getLocalizedTags(metadata.tags, locale)

  const handleClick = () => navigate(`/games/${metadata.slug}`)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <motion.article
      className="game-card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={t.playAria(name)}
      id={`game-card-${metadata.slug}`}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/*
        Animated sketch border: SVG rect with stroke-dashoffset animation.
        viewBox="0 0 300 220" matches the rendered card proportions.
        Perimeter = 2*(298+218) = 1032 — used as stroke-dasharray.
      */}
      <svg
        className="game-card-sketch-border"
        viewBox="0 0 300 220"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="298" height="218" rx="3" />
      </svg>

      <div>
        <span className="game-card-icon" aria-hidden="true">
          {metadata.icon}
        </span>
        <h2 className="game-card-name">{name}</h2>
        <p className="game-card-description">{description}</p>
      </div>

      <div className="game-card-footer">
        <div className="game-card-tags" aria-label={t.gameTagsAria}>
          {tags.map(tag => (
            <Badge key={tag} size="sm">{tag}</Badge>
          ))}
        </div>
        <span className="game-card-play" aria-hidden="true">
          {t.play}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 6h8M6 2l4 4-4 4" />
          </svg>
        </span>
      </div>
    </motion.article>
  )
}
