import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests',
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4181/AllGames/',
    locale: 'en-US',
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
  },
  webServer: {
    command: 'npm run dev -w @allgames/shell -- --host 127.0.0.1 --port 4181',
    url: 'http://127.0.0.1:4181/AllGames/',
    reuseExistingServer: !process.env.CI,
  },
})
