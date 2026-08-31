import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import type { Locale } from '../types/game'

const STORAGE_KEY = 'allgames:language'

function detectInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'pl') return saved

    // Auto-detect from browser locale
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('pl')) return 'pl'
    return 'en'
  } catch {
    return 'en'
  }
}

export interface TranslationDictionary {
  backToHomeAria: string
  preferences: string
  language: string
  theme: string
  darkMode: string
  lightMode: string
  einkMode: string
  einkOn: string
  einkOff: string
  einkDesc: string
  menuToggleAria: string
  closeMenuAria: string
  heroEyebrow: string
  heroTitle: string
  heroDescription: string
  gameCount: (n: number) => string
  play: string
  playAria: (name: string) => string
  gameTagsAria: string
  backToGames: string
  backToGamesAria: string
  loading: string
  notFound: string
  returnToGames: string
  pageNotFound: string
  installApp: string
  installedApp: string
  allFilter: string
  filterLabel: string
  noFilteredGames: string
  clearFilter: string
}

export const translations: Record<Locale, TranslationDictionary> = {
  en: {
    backToHomeAria: 'AllGames — return to home',
    preferences: 'Preferences',
    language: 'Language',
    theme: 'Theme',
    darkMode: 'Dark',
    lightMode: 'Light',
    einkMode: 'E-reader mode (E-ink)',
    einkOn: 'On',
    einkOff: 'Off',
    einkDesc: 'Optimized for E-ink screens: zero animations, ultra high contrast.',
    menuToggleAria: 'Open preferences menu',
    closeMenuAria: 'Close preferences menu',
    heroEyebrow: 'Game collection',
    heroTitle: 'All\nGames',
    heroDescription: 'Simple browser games. No registration, no ads. Your progress stays on this device.',
    gameCount: (n: number) => (n === 1 ? '1 game' : `${n} games`),
    play: 'Play',
    playAria: (name: string) => `Play ${name}`,
    gameTagsAria: 'Game tags',
    backToGames: 'All games',
    backToGamesAria: 'Back to games list',
    loading: 'Loading…',
    notFound: 'Game not found:',
    returnToGames: 'Return to games list →',
    pageNotFound: '404 — Page not found',
    installApp: 'Install app',
    installedApp: 'Installed',
    allFilter: 'All',
    filterLabel: 'Filter by category',
    noFilteredGames: 'No games found in this category.',
    clearFilter: 'Show all games',
  },
  pl: {
    backToHomeAria: 'AllGames — wróć do strony głównej',
    preferences: 'Preferencje',
    language: 'Język',
    theme: 'Motyw',
    darkMode: 'Ciemny',
    lightMode: 'Jasny',
    einkMode: 'Tryb czytnika (E-ink)',
    einkOn: 'Włączony',
    einkOff: 'Wyłączony',
    einkDesc: 'Optymalizacja pod ekrany E-ink: brak animacji, wysoki kontrast.',
    menuToggleAria: 'Otwórz menu preferencji',
    closeMenuAria: 'Zamknij menu preferencji',
    heroEyebrow: 'Kolekcja gier',
    heroTitle: 'All\nGames',
    heroDescription: 'Proste gry w przeglądarce. Bez rejestracji, bez reklam. Twój postęp zostaje na tym urządzeniu.',
    gameCount: (n: number) => (n === 1 ? '1 gra' : n >= 2 && n <= 4 ? `${n} gry` : `${n} gier`),
    play: 'Graj',
    playAria: (name: string) => `Zagraj w ${name}`,
    gameTagsAria: 'Tagi gry',
    backToGames: 'Wszystkie gry',
    backToGamesAria: 'Wróć do listy gier',
    loading: 'Ładowanie…',
    notFound: 'Nie znaleziono gry:',
    returnToGames: 'Wróć do listy gier →',
    pageNotFound: '404 — Strona nie istnieje',
    installApp: 'Zainstaluj aplikację',
    installedApp: 'Zainstalowano',
    allFilter: 'Wszystkie',
    filterLabel: 'Filtruj według kategorii',
    noFilteredGames: 'Brak gier w tej kategorii.',
    clearFilter: 'Pokaż wszystkie gry',
  },
}

interface I18nContextValue {
  locale: Locale
  setLocale: (loc: Locale) => void
  t: TranslationDictionary
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectInitialLocale)

  const setLocale = (loc: Locale) => {
    setLocaleState(loc)
    try {
      localStorage.setItem(STORAGE_KEY, loc)
    } catch {
      // Storage unavailable
    }
  }

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: translations[locale],
    }),
    [locale]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return ctx
}
