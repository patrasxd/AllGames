import { useNavigate } from 'react-router-dom'
import { CatalogCard, setLastActiveCardId } from '@all/ui'
import { useI18n } from '../i18n'
import { getLocalizedText, getLocalizedTags } from '../types/game'
import type { GameMetadata } from '../types/game'

export function GameCard({
  metadata,
  index,
  isReturning = false,
}: {
  metadata: GameMetadata
  index: number
  isReturning?: boolean
}) {
  const navigate = useNavigate()
  const { locale, t } = useI18n()
  const name = getLocalizedText(metadata.name, locale)
  const tags = getLocalizedTags(metadata.tags, locale).filter(
    (tag) => !['1 player', '1 gracz', '1-player', '1-gracz', '1player', '1gracz'].includes(tag.trim().toLowerCase()),
  )
  return (
    <CatalogCard
      id={`game-card-${metadata.slug}`}
      className="game-card"
      title={name}
      description={getLocalizedText(metadata.description, locale)}
      icon={metadata.icon}
      tags={tags}
      tagsLabel={t.gameTagsAria}
      actionLabel={t.play}
      ariaLabel={t.playAria(name)}
      index={index}
      isReturning={isReturning}
      onActivate={() => {
        setLastActiveCardId(`game-card-${metadata.slug}`)
        navigate(`/games/${metadata.slug}`)
      }}
    />
  )
}
