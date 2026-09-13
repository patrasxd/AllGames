# Responsive Layout & Viewport Allocation in AllGames

## Viewport Allocation Principles

Active games must intelligently use the full available viewport across:
- **Mobile Portrait** (< 600px width, tall viewport)
- **Mobile Landscape** (< 900px width, short viewport < 500px)
- **Tablet** (600px - 1024px)
- **Desktop** (1024px - 1440px)
- **Large Desktop** (> 1440px)

## Critical Anti-Patterns to Eliminate

1. **Arbitrary Board Clamping**:
   - Discovered bug: Chess and Checkers hardcoding `width: min(390px, min(92vw, calc(100vh - 280px)))`.
   - On a desktop display, this leaves over 70% of screen space wasted.
   - On a mobile landscape display (e.g. 400px viewport height), `calc(100vh - 280px)` crushes the board to ~120px!
2. **Page Scrolling during Gameplay**:
   - The game board and primary controls must fit inside the viewport without page scrollbars.
   - Layout calculations must account for the shell header height (~56px).
3. **Touch Targets**:
   - DPad buttons, cell touch targets, and action buttons must have minimum physical hit target of 44x44px (`min-width: 44px; min-height: 44px`).
4. **Swipe Gestures vs Browser Navigation**:
   - Swipeable boards (2048, Snake) MUST declare `touch-action: none` on the board container, never `manipulation` (which allows browser pull-to-refresh to intercept vertical swipes).

## Reusable Templates
Rather than calculating custom `min(..., ...)` formulas in each game's CSS, games should use standard layout templates (SquareBoardTemplate, CanvasGameTemplate, DeckBoardTemplate).
