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
   - Do NOT hardcode arbitrary max constraints like `width: min(390px, ...)`.
   - On desktop, boards must scale up to fill their container comfortably without giant empty dead zones.
   - On mobile, boards must not shrink to tiny stamps; use fluid clamping (e.g. `clamp(...)` matching available column/row units) so boards remain readable and touchable.
2. **Page Scrolling during Gameplay**:
   - The game board, HUD, and primary controls must fit inside the viewport without page-level scrollbars.
   - Internal scrolling is permitted only inside specific multi-board lists or score history where content genuinely exceeds mobile viewport height.
3. **Touch Targets**:
   - Cell touch targets, D-Pad buttons, and action buttons must have a minimum physical hit target of 44x44px (`min-width: 44px; min-height: 44px`) or comfortable touch-action manipulation.
4. **Swipe Gestures vs Browser Navigation**:
   - Swipeable boards (2048, Snake) MUST declare `touch-action: none` on the board container, never `manipulation` (which allows browser pull-to-refresh to intercept vertical swipes).

## Shared Responsive Templates (`@all/ui`)

Rather than calculating viewport layout from scratch in each game, games must use the shared templates from `@all/ui`:

### 1. `BoardLayout`
The primary template for turn-based, board, grid, and card games.
- **Props**:
  - `variant`:
    - `'square'`: 1:1 aspect ratio board, automatically constrained to available width/height without scrolling (Chess, Checkers, Tic-Tac-Toe, 2048, Snake, Crystal Match, Memory).
    - `'wide'` / `'fluid'`: Flexible width stage for dual-boards, wide layouts, or variable dimensions (Battleship, Sudoku, Solitaire, Minesweeper).
    - `'stacked'`: Stacked orientation.
  - `align`: `'center'` (default for square boards) or `'top'` (default for wide/fluid).
  - `hud`: Top HUD bar (status, turn indicators, scores).
  - `board` (or children): Main board or interactive workspace.
  - `controls`: Bottom controls bar (`<ControlsBar>...</ControlsBar>`).
  - `dpad`: Optional on-screen D-Pad for directional games (Snake, 2048).
  - `overlay`: Modal overlays (e.g. `<GameResultOverlay>` or `<GameStartOverlay>`).
  - `sidePanel`: Optional desktop side panel for move logs, captured pieces, or inventory.

### 2. `FullBleedLayout`
For real-time canvas, physics, and arcade games (Wing Rush):
- **Props**:
  - `stage`: Full-bleed canvas element filling the entire viewport.
  - `hud`: Floating top HUD overlay.
  - `controls`: Floating bottom controls bar.
  - `overlay`: Floating modal overlays for game start and game over states.
