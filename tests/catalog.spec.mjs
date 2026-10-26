import { test, expect } from '@playwright/test'
import { registerCatalogTests } from '../AllUI/browser-tests/catalog.mjs'
registerCatalogTests(test, expect, {
  appName: 'AllGames',
  cardSelector: '.game-card',
  count: 18,
  representative: { card: '#game-card-2048', path: '/games/2048' },
})
