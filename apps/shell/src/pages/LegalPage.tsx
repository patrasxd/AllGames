import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LegalNotice, BackLink } from '@all/ui'
import { useI18n } from '../i18n'

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
}

export function LegalPage() {
  const navigate = useNavigate()
  const { locale, t } = useI18n()

  return (
    <motion.div
      className="container"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        paddingTop: '1.5rem',
        paddingBottom: '3rem',
        maxWidth: '720px',
        margin: '0 auto',
      }}
    >
      <div style={{ marginBottom: '1.25rem' }}>
        <BackLink
          label={t.backToGames}
          ariaLabel={t.backToGamesAria}
          onClick={() => navigate('/')}
        />
      </div>

      <LegalNotice appName="AllGames" locale={locale} />
    </motion.div>
  )
}

export default LegalPage
