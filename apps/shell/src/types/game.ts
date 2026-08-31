export type Locale = 'en' | 'pl';

export type LocalizedText = string | Record<Locale, string>;
export type LocalizedTags = string[] | Record<Locale, string[]>;

export interface GameMetadata {
  /** Unique identifier used in URL: /games/:slug */
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  /** Emoji or SVG icon */
  icon: string | React.ReactNode;
  tags: LocalizedTags;
  minPlayers: 1 | 2;
  maxPlayers: 1 | 2;
}

export interface GameComponentProps {
  /** Current active locale ('en' | 'pl') */
  locale: Locale;
  /** Whether E-reader (E-ink) mode is currently active */
  isEink?: boolean;
  /** Called by the game when it wants to save data */
  onSave?: (data: unknown) => void;
  /**
   * Game can call this to inject content (e.g. stats scoreboard) into the page header.
   * Call with null to clear. Cleared automatically when game unmounts.
   */
  setHeader?: (content: React.ReactNode) => void;
}

export interface GameModule {
  metadata: GameMetadata;
  GameComponent: React.ComponentType<GameComponentProps>;
}

/** Helper to resolve LocalizedText to current locale */
export function getLocalizedText(text: LocalizedText, locale: Locale): string {
  if (typeof text === 'string') return text;
  return text[locale] || text.en || '';
}

/** Helper to resolve LocalizedTags to current locale */
export function getLocalizedTags(tags: LocalizedTags, locale: Locale): string[] {
  if (Array.isArray(tags)) return tags;
  return tags[locale] || tags.en || [];
}
