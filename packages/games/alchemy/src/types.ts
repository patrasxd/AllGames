import type React from 'react'

export type Locale = 'en' | 'pl'

export type GameComponentProps = {
  setHeader?: (content: React.ReactNode) => void
  setIsActive?: (active: boolean) => void
  locale?: Locale
  isEink?: boolean
}

export type ElementId = string

export type CategoryId =
  | 'basic'
  | 'nature'
  | 'weather'
  | 'space'
  | 'materials'
  | 'plants'
  | 'animals'
  | 'food'
  | 'people'
  | 'places'
  | 'transport'
  | 'tech'
  | 'culture'
  | 'myth'

export interface AlchemyElement {
  id: ElementId
  category: CategoryId
  emoji: string
  name: Record<Locale, string>
  /** Every pair of ingredients that makes this element. Absent for the four basic elements. */
  recipes?: [ElementId, ElementId][]
}

/** One element lying on the table. Position is in px, relative to the workspace's top-left corner. */
export interface WorkItem {
  uid: number
  id: ElementId
  x: number
  y: number
}

/** Marks the cards that were just created by a successful mix, so they can play the "discovered" animation. */
export interface Feedback {
  key: number
  uids: number[]
}
