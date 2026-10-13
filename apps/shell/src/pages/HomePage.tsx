import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AppFooter,
  DirectoryHero,
  CatalogSectionHeader,
  CatalogGrid,
  FilterGroup,
  useCardScrollRestoration,
  isReturningFromCard,
  useMotion,
} from '@all/ui'
import { GAMES } from '../games/registry'
import { GameCard } from '../components/GameCard'
import { useI18n } from '../i18n'
import { getLocalizedTags, getLocalizedText } from '../types/game'

export function HomePage() {
  const navigate = useNavigate()
  const { locale, t } = useI18n()
  const { isMotionEnabled } = useMotion()
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Extract all unique tags in current locale, sorted descending by game count
  const allTags = useMemo(() => {
    const tagCountMap = new Map<string, number>()
    const ignoredTags = new Set(['1 player', '1 gracz', '1-player', '1-gracz', '1player', '1gracz'])
    GAMES.forEach((game) => {
      const tags = getLocalizedTags(game.metadata.tags, locale)
      const uniqueGameTags = new Set(tags.map((t) => t.trim().toLowerCase()))
      uniqueGameTags.forEach((tag) => {
        if (!ignoredTags.has(tag)) {
          tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1)
        }
      })
    })

    return Array.from(tagCountMap.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag]) => tag)
  }, [locale])

  // Filter games based on selected tag
  const filteredGames = useMemo(() => {
    const matchingGames = selectedTag
      ? GAMES.filter((game) => {
          const normalizedSelected = selectedTag.trim().toLowerCase()
          const tags = getLocalizedTags(game.metadata.tags, locale).map((t) => t.trim().toLowerCase())
          return tags.includes(normalizedSelected)
        })
      : GAMES

    return [...matchingGames].sort((a, b) =>
      getLocalizedText(a.metadata.name, locale).localeCompare(getLocalizedText(b.metadata.name, locale), locale, {
        sensitivity: 'base',
      }),
    )
  }, [selectedTag, locale])

  // Capture whether we are returning from a game via Back button on mount
  const isReturning = useRef(isReturningFromCard()).current

  // Restore scroll position to the last active game card when returning from a game
  useCardScrollRestoration({ dependencies: [filteredGames.length] })

  return (
    <div className="home-page">
      <div className="container">
        {/* Hero Section */}
        <DirectoryHero
          title={
            <>
              All
              <br />
              Games
            </>
          }
          eyebrow={t.heroEyebrow}
          description={t.heroDescription}
          isReturning={isReturning}
        />

        {/* Filter Bar & Games List */}
        <section aria-labelledby="games-section-label">
          <CatalogSectionHeader
            label={t.gameCount(filteredGames.length)}
            labelId="games-section-label"
            filters={
              <>
                {/* Shared category filters */}
                {allTags.length > 0 && (
                  <FilterGroup<string | null>
                    label={t.filterLabel}
                    value={selectedTag}
                    onChange={(tag) => setSelectedTag(tag === selectedTag ? null : tag)}
                    options={[
                      { id: 'all', value: null, label: t.allFilter, count: GAMES.length, buttonId: 'filter-all-btn' },
                      ...allTags.map((tag) => ({
                        id: tag,
                        value: tag,
                        label: tag,
                        count: GAMES.filter((g) =>
                          getLocalizedTags(g.metadata.tags, locale).some((t) => t.trim().toLowerCase() === tag),
                        ).length,
                        buttonId: `filter-tag-${tag.replace(/\s+/g, '-').toLowerCase()}`,
                      })),
                    ]}
                  />
                )}
              </>
            }
          />

          {/* Animated Games Grid */}
          <CatalogGrid className="games-grid">
            <AnimatePresence mode="popLayout">
              {filteredGames.length > 0 ? (
                filteredGames.map((game, i) => (
                  <motion.div
                    key={game.metadata.slug}
                    role="listitem"
                    layout={isMotionEnabled}
                    initial={
                      isMotionEnabled ? (isReturning ? { opacity: 0, y: 8 } : { opacity: 0, scale: 0.95 }) : false
                    }
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={isMotionEnabled ? { opacity: 0, scale: 0.95 } : undefined}
                    transition={
                      isMotionEnabled
                        ? { duration: isReturning ? 0.2 : 0.35, ease: [0.16, 1, 0.3, 1] }
                        : { duration: 0 }
                    }
                  >
                    <GameCard metadata={game.metadata} index={i} isReturning={isReturning} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  className="home-no-games"
                  initial={isMotionEnabled ? { opacity: 0, y: 16 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={isMotionEnabled ? { opacity: 0, y: -16 } : undefined}
                  transition={{ duration: 0.3 }}
                >
                  <p>{t.noFilteredGames}</p>
                  <button type="button" className="home-filter-reset-btn" onClick={() => setSelectedTag(null)}>
                    {t.clearFilter}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </CatalogGrid>
        </section>

        <AppFooter
          legalLabel={t.legalNotice}
          onLegalClick={() => navigate('/legal')}
          copyright="AllGames © 2026. Free & Open Source."
          links={[
            {
              label: 'AllTools',
              href: 'https://patrasxd.github.io/AllTools/',
              external: true,
            },
            {
              label: 'AllLinks',
              href: 'https://patrasxd.github.io/AllLinks/',
              external: true,
            },
            {
              label: 'GitHub',
              href: 'https://github.com/patrasxd',
              external: true,
            },
            {
              label: 'LinkedIn',
              href: 'https://www.linkedin.com/in/patryk-popio%C5%82ek-615048201/',
              external: true,
            },
          ]}
        />
      </div>
    </div>
  )
}
