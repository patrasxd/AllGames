# Testing & Gating Rules for AllGames

## Per-Module Testing Attachment

Testing is NOT an isolated one-time project phase. Instead, every migration or creation of a game module must satisfy the following testing requirements in the same task:

1. **Tooling Verification**:
   - Check if unit test tooling (Vitest + React Testing Library) and visual regression/e2e tooling (Playwright) exist.
   - If not installed, set it up lazily as the first step of the module's skill.
2. **Unit Tests for Pure Logic**:
   - Every game must have unit tests covering non-visual logic (`logic.ts`, reducer rules, minimax move calculation, win/loss evaluation, board state transitions).
3. **Visual Regression Baselines**:
   - Capture screenshot baselines per theme (Light, Dark, E-Ink Light, E-Ink Dark) and key viewports (mobile portrait 390x844, desktop 1280x800).
   - Ensure pixel diff threshold does not exceed acceptable limits.
4. **Golden-Path E2E Flow**:
   - Verify representative interaction: game loads, user can trigger move/turn, score updates, reset modal works.

## Gating Rule

No game migration may be marked complete unless:
1. `npm run test` (Vitest) passes.
2. Production build (`npm run build`) passes without bundle bloat warnings.
3. Responsive viewport fit is verified across mobile portrait, mobile landscape, and desktop.
