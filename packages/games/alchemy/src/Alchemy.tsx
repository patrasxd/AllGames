import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence } from 'framer-motion'
import { BoardLayout, Button, ConfirmDialog, ControlsBar, StatsHeader } from '@all/ui'
import { GameResultOverlay, GameStartOverlay } from '@allgames/ui'
import { BASE_IDS } from './elements'
import { useAlchemy } from './hooks/useAlchemy'
import { useListDrag } from './hooks/useListDrag'
import { ITEM_SIZE } from './geometry'
import { Workspace } from './components/Workspace'
import { Inventory } from './components/Inventory'
import { alchemyTranslations } from './i18n'
import { elementEmoji, elementName } from './logic'
import type { ElementId, GameComponentProps } from './types'
import './styles/alchemy.css'

export function Alchemy({ setHeader, locale = 'en', isEink = false }: GameComponentProps) {
  const t = alchemyTranslations[locale] || alchemyTranslations.en

  const game = useAlchemy()
  const { discovered, items, mixes, total, addElement } = game

  const workspaceRef = useRef<HTMLDivElement>(null)
  const inventoryRef = useRef<HTMLElement>(null)
  const [trashActive, setTrashActive] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [introSeen, setIntroSeen] = useState(false)
  const [completionSeen, setCompletionSeen] = useState(false)

  useEffect(() => {
    if (!setHeader) return
    setHeader(
      <StatsHeader
        label={t.gameTitle}
        items={[
          { key: 'found', label: t.found, value: `${discovered.length}/${total}` },
          { key: 'mixes', label: t.mixes, value: mixes },
        ]}
      />,
    )
  }, [setHeader, t, discovered.length, total, mixes])

  useEffect(() => {
    return () => setHeader?.(null)
  }, [setHeader])

  // Tapping an element in the list puts a copy on the table, near the middle with a little jitter
  // so several copies do not stack exactly on top of each other.
  const spawn = useCallback(
    (id: ElementId) => {
      const rect = workspaceRef.current?.getBoundingClientRect()
      const w = rect?.width || 240
      const h = rect?.height || 200
      const jitter = () => (Math.random() - 0.5) * Math.min(160, w * 0.4)
      const x = Math.max(0, Math.min(w - ITEM_SIZE, (w - ITEM_SIZE) / 2 + jitter()))
      const y = Math.max(0, Math.min(h - ITEM_SIZE, (h - ITEM_SIZE) / 2 + jitter() * 0.6))
      addElement(id, x, y)
    },
    [addElement],
  )

  // Dragging an element out of the list and onto the table.
  const itemsRef = useRef(items)
  useEffect(() => {
    itemsRef.current = items
  }, [items])
  const listDrag = useListDrag({
    workspaceRef,
    getItems: () => itemsRef.current,
    onDrop: game.dropNewElement,
  })
  const handleAdd = (id: ElementId) => {
    // A drag ends with a click on the element it started from; that click must not add a second copy.
    if (!listDrag.wasDragging()) spawn(id)
  }

  const showIntro = !introSeen && discovered.length === BASE_IDS.length && items.length === 0 && mixes === 0
  const showCompletion = game.isComplete && !completionSeen

  const hintText = game.hint
    ? t.tryHint(elementName(game.hint.a, locale), elementName(game.hint.b, locale))
    : game.noHint
      ? t.noHint
      : null

  return (
    <>
      <BoardLayout
        variant="wide"
        board={
          <div className={`al-root ${isEink ? 'al-root--eink' : ''}`}>
            <div className="al-stage">
              <Workspace
                items={items}
                locale={locale}
                workspaceRef={workspaceRef}
                trashRef={inventoryRef}
                selectedUid={game.selectedUid}
                feedback={game.feedback}
                dropActive={listDrag.drag?.overWorkspace ?? false}
                highlightUid={listDrag.drag?.targetUid ?? null}
                emptyText={t.emptyTable}
                label={t.workspaceLabel}
                onMove={game.moveItem}
                onDrop={game.dropItem}
                onTap={game.tapItem}
                onRemove={game.removeItem}
                onTrashHover={setTrashActive}
              />
              <div className="al-banner-slot" aria-live="polite">
                {game.toast ? (
                  <div key={game.toast.key} className="al-banner al-banner--new">
                    <span aria-hidden="true">{elementEmoji(game.toast.id)}</span>
                    <span>
                      {t.newElement} {elementName(game.toast.id, locale)}
                    </span>
                  </div>
                ) : hintText ? (
                  <div className="al-banner">{hintText}</div>
                ) : null}
              </div>
            </div>
            <Inventory
              ref={inventoryRef}
              discovered={discovered}
              locale={locale}
              t={t}
              trashActive={trashActive}
              draggingId={listDrag.drag?.id ?? null}
              onAdd={handleAdd}
              onPointerDownElement={listDrag.begin}
            />
          </div>
        }
        controls={
          <ControlsBar className="al-controls-bar">
            <Button id="alchemy-hint-btn" variant="secondary" size="sm" onClick={game.showHint}>
              {t.hint}
            </Button>
            <Button
              id="alchemy-clear-btn"
              variant="secondary"
              size="sm"
              disabled={items.length === 0}
              onClick={game.clearWorkspace}
            >
              {t.clear}
            </Button>
            <Button id="alchemy-reset-btn" variant="secondary" size="sm" onClick={() => setConfirmReset(true)}>
              {t.reset}
            </Button>
          </ControlsBar>
        }
        overlay={
          <AnimatePresence>
            {showIntro && (
              <GameStartOverlay
                title={t.howToPlayTitle}
                subtitle={t.howToPlayBody}
                startText={t.startGame}
                onStart={() => setIntroSeen(true)}
                startId="alchemy-start-btn"
                isEink={isEink}
              />
            )}
            {showCompletion && (
              <GameResultOverlay
                status="won"
                title={t.wonTitle}
                subtitle={t.wonSub(total)}
                isEink={isEink}
                playAgainText={t.keepPlaying}
                onPlayAgain={() => setCompletionSeen(true)}
                playAgainId="alchemy-keep-playing-btn"
                secondaryAction={{
                  label: t.resetProgress,
                  onClick: () => {
                    setCompletionSeen(true)
                    setConfirmReset(true)
                  },
                  id: 'alchemy-won-reset-btn',
                }}
                stats={[
                  { label: t.found, value: `${discovered.length}/${total}` },
                  { label: t.mixes, value: mixes },
                ]}
              />
            )}
          </AnimatePresence>
        }
      />

      {listDrag.drag &&
        createPortal(
          <div
            className={`al-ghost ${isEink ? 'al-ghost--eink' : ''}`}
            style={{ left: listDrag.drag.x, top: listDrag.drag.y }}
          >
            <div className="al-item-card">
              <span className="al-item-emoji" aria-hidden="true">
                {elementEmoji(listDrag.drag.id)}
              </span>
              <span className="al-item-name">{elementName(listDrag.drag.id, locale)}</span>
            </div>
          </div>,
          document.body,
        )}

      <ConfirmDialog
        open={confirmReset}
        title={t.confirmTitle}
        description={t.confirmDesc}
        confirmLabel={t.confirmBtn}
        cancelLabel={t.cancelBtn}
        confirmVariant="danger"
        confirmId="alchemy-confirm-reset-btn"
        cancelId="alchemy-cancel-reset-btn"
        onConfirm={() => {
          setConfirmReset(false)
          setCompletionSeen(false)
          game.resetProgress()
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </>
  )
}

export default Alchemy
