import { memo } from 'react'

interface GameModalProps {
  title: string
  description?: string
  cancelText?: string
  confirmText?: string
  cancelId?: string
  confirmId?: string
  onCancel: () => void
  onConfirm: () => void
}

export const GameModal = memo(function GameModal({
  title,
  description,
  cancelText = 'Cancel',
  confirmText = 'Continue',
  cancelId,
  confirmId,
  onCancel,
  onConfirm,
}: GameModalProps) {
  return (
    <div className="game-modal-overlay" role="dialog" aria-modal="true">
      <div className="game-modal">
        <h3 className="game-modal-title">{title}</h3>
        {description && <p className="game-modal-desc">{description}</p>}
        <div className="game-modal-actions">
          <button
            type="button"
            id={cancelId}
            className="game-modal-btn"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            id={confirmId}
            className="game-modal-btn game-modal-btn--primary"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
})
