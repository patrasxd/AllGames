import type { CategoryId, Locale } from './types'

export interface CategoryInfo {
  id: CategoryId
  emoji: string
  name: Record<Locale, string>
}

/** Display order of the collection's categories. */
export const CATEGORIES: CategoryInfo[] = [
  { id: 'basic', emoji: '✨', name: { en: 'Basics', pl: 'Podstawy' } },
  { id: 'nature', emoji: '🏞️', name: { en: 'Nature', pl: 'Przyroda' } },
  { id: 'weather', emoji: '⛅', name: { en: 'Weather', pl: 'Pogoda' } },
  { id: 'space', emoji: '🪐', name: { en: 'Space', pl: 'Kosmos' } },
  { id: 'materials', emoji: '🪨', name: { en: 'Materials', pl: 'Materiały' } },
  { id: 'plants', emoji: '🌱', name: { en: 'Plants', pl: 'Rośliny' } },
  { id: 'animals', emoji: '🐾', name: { en: 'Animals', pl: 'Zwierzęta' } },
  { id: 'food', emoji: '🍎', name: { en: 'Food', pl: 'Jedzenie' } },
  { id: 'people', emoji: '🧑', name: { en: 'People', pl: 'Ludzie' } },
  { id: 'places', emoji: '🏠', name: { en: 'Places', pl: 'Miejsca' } },
  { id: 'transport', emoji: '🚗', name: { en: 'Transport', pl: 'Transport' } },
  { id: 'tech', emoji: '💡', name: { en: 'Tech', pl: 'Technika' } },
  { id: 'culture', emoji: '🎵', name: { en: 'Culture', pl: 'Kultura' } },
  { id: 'myth', emoji: '🐉', name: { en: 'Myth', pl: 'Mity' } },
]
