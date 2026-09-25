import type { PieceType, PieceColor, Locale } from '../types'
import { ChessPiece } from './ChessPiece'
import { chessTranslations } from '../i18n'
import { Dialog } from '@all/ui'

interface PromotionModalProps {
  color: PieceColor
  locale?: Locale
  isEink?: boolean
  onSelect: (type: PieceType) => void
}

export function PromotionModal({ color, locale = 'en', isEink = false, onSelect }: PromotionModalProps) {
  const t = chessTranslations[locale] || chessTranslations.en
  const promoOptions: { type: PieceType; label: string }[] = [
    { type: 'queen', label: t.queen },
    { type: 'rook', label: t.rook },
    { type: 'bishop', label: t.bishop },
    { type: 'knight', label: t.knight },
  ]

  return (
    <Dialog isOpen={true} onClose={() => onSelect('queen')} title={t.promotePawn} maxWidth="sm">
      <div className="chess-promo-options">
        {promoOptions.map((opt) => (
          <button
            key={opt.type}
            type="button"
            id={`chess-promo-${opt.type}`}
            className="chess-promo-btn"
            onClick={() => onSelect(opt.type)}
          >
            <div
              style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChessPiece piece={{ id: `promo_${opt.type}`, type: opt.type, color }} isEink={isEink} />
            </div>
            <span className="chess-promo-label">{opt.label}</span>
          </button>
        ))}
      </div>
    </Dialog>
  )
}
