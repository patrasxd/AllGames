import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GAMES } from '../games/registry'
import { GameCard } from '../components/GameCard'
import { useI18n } from '../i18n'
import { getLocalizedTags } from '../types/game'

const heroVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}

const lineVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
}

export function HomePage() {
  const { locale, t } = useI18n()
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Extract all unique tags in current locale, sorted descending by game count
  const allTags = useMemo(() => {
    const tagCountMap = new Map<string, number>()
    GAMES.forEach(game => {
      const tags = getLocalizedTags(game.metadata.tags, locale)
      const uniqueGameTags = new Set(tags.map(t => t.trim().toLowerCase()))
      uniqueGameTags.forEach(tag => {
        tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1)
      })
    })

    return Array.from(tagCountMap.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag]) => tag)
  }, [locale])

  // Filter games based on selected tag
  const filteredGames = useMemo(() => {
    if (!selectedTag) return GAMES
    const normalizedSelected = selectedTag.trim().toLowerCase()
    return GAMES.filter(game => {
      const tags = getLocalizedTags(game.metadata.tags, locale).map(t => t.trim().toLowerCase())
      return tags.includes(normalizedSelected)
    })
  }, [selectedTag, locale])

  return (
    <div className="home-page">
      <div className="container">
        {/* Hero Section */}
        <motion.section
          className="home-hero"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
          aria-labelledby="home-title"
        >
          <motion.p className="home-eyebrow" variants={lineVariants}>
            {t.heroEyebrow}
          </motion.p>
          <motion.h1 className="home-title" id="home-title" variants={lineVariants}>
            All<br />Games
          </motion.h1>
          <motion.p className="home-description" variants={lineVariants}>
            {t.heroDescription}
          </motion.p>
        </motion.section>

        {/* Filter Bar & Games List */}
        <section aria-labelledby="games-section-label">
          <div className="home-section-header">
            <motion.p
              className="home-games-label"
              id="games-section-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {t.gameCount(filteredGames.length)}
            </motion.p>

            {/* Filter chips */}
            {allTags.length > 0 && (
              <motion.div
                className="home-filters"
                role="group"
                aria-label={t.filterLabel}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
              >
                <button
                  type="button"
                  id="filter-all-btn"
                  className={`home-filter-chip ${selectedTag === null ? 'home-filter-chip--active' : ''}`}
                  onClick={() => setSelectedTag(null)}
                >
                  {selectedTag === null && (
                    <motion.span
                      className="home-filter-indicator"
                      layoutId="activeFilterIndicator"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="home-filter-text">{t.allFilter}</span>
                  <span className="home-filter-count">{GAMES.length}</span>
                </button>

                {allTags.map(tag => {
                  const isSelected = selectedTag === tag
                  const count = GAMES.filter(g =>
                    getLocalizedTags(g.metadata.tags, locale).some(t => t.trim().toLowerCase() === tag)
                  ).length

                  return (
                    <button
                      key={tag}
                      type="button"
                      id={`filter-tag-${tag.replace(/\s+/g, '-').toLowerCase()}`}
                      className={`home-filter-chip ${isSelected ? 'home-filter-chip--active' : ''}`}
                      onClick={() => setSelectedTag(isSelected ? null : tag)}
                    >
                      {isSelected && (
                        <motion.span
                          className="home-filter-indicator"
                          layoutId="activeFilterIndicator"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <span className="home-filter-text">{tag}</span>
                      <span className="home-filter-count">{count}</span>
                    </button>
                  )
                })}
              </motion.div>
            )}
          </div>

          {/* Animated Games Grid */}
          <motion.div className="games-grid" role="list" layout>
            <AnimatePresence mode="popLayout">
              {filteredGames.length > 0 ? (
                filteredGames.map((game, i) => (
                  <motion.div
                    key={game.metadata.slug}
                    role="listitem"
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <GameCard metadata={game.metadata} index={i} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  className="home-no-games"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                >
                  <p>{t.noFilteredGames}</p>
                  <button
                    type="button"
                    className="home-filter-reset-btn"
                    onClick={() => setSelectedTag(null)}
                  >
                    {t.clearFilter}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>
      </div>
    </div>
  )
}
