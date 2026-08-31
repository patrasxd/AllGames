import { motion } from 'framer-motion'
import type { GameMode } from '../logic'
import { gameTranslations, type Locale } from '../i18n'

interface ModeSelectProps {
  locale?: Locale
  onSelect: (mode: GameMode) => void
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

export function ModeSelect({ locale = 'en', onSelect }: ModeSelectProps) {
  const t = gameTranslations[locale] || gameTranslations.en

  return (
    <motion.div
      className="ttt-mode-select"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.p className="ttt-mode-label" variants={itemVariants}>
        {t.chooseMode}
      </motion.p>

      <div className="ttt-mode-options">
        <motion.button
          className="ttt-mode-btn"
          id="mode-2p-btn"
          onClick={() => onSelect('2p')}
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          aria-label={t.twoPlayersAria}
        >
          <span className="ttt-mode-btn-icon" aria-hidden="true">
            {/* Two players icon */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="9" r="4" />
              <path d="M2 26c0-4.4 3.6-8 8-8" />
              <circle cx="22" cy="9" r="4" />
              <path d="M30 26c0-4.4-3.6-8-8-8" />
              <path d="M16 18c-2.2 0-4 1.8-4 4v4h8v-4c0-2.2-1.8-4-4-4z" />
            </svg>
          </span>
          <span className="ttt-mode-btn-title">{t.twoPlayers}</span>
          <span className="ttt-mode-btn-desc">{t.twoPlayersDesc}</span>
        </motion.button>

        <motion.button
          className="ttt-mode-btn"
          id="mode-ai-btn"
          onClick={() => onSelect('ai')}
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          aria-label={t.vsComputerAria}
        >
          <span className="ttt-mode-btn-icon" aria-hidden="true">
            {/* Computer/CPU icon */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="8" y="8" width="16" height="16" rx="2" />
              <rect x="12" y="12" width="8" height="8" rx="1" />
              <line x1="12" y1="4" x2="12" y2="8" />
              <line x1="16" y1="4" x2="16" y2="8" />
              <line x1="20" y1="4" x2="20" y2="8" />
              <line x1="12" y1="24" x2="12" y2="28" />
              <line x1="16" y1="24" x2="16" y2="28" />
              <line x1="20" y1="24" x2="20" y2="28" />
              <line x1="4" y1="12" x2="8" y2="12" />
              <line x1="4" y1="16" x2="8" y2="16" />
              <line x1="4" y1="20" x2="8" y2="20" />
              <line x1="24" y1="12" x2="28" y2="12" />
              <line x1="24" y1="16" x2="28" y2="16" />
              <line x1="24" y1="20" x2="28" y2="20" />
            </svg>
          </span>
          <span className="ttt-mode-btn-title">{t.vsComputer}</span>
          <span className="ttt-mode-btn-desc">{t.vsComputerDesc}</span>
        </motion.button>
      </div>
    </motion.div>
  )
}
