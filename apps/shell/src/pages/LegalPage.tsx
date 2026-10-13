import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LegalNotice, BackLink, DocumentPage } from '@all/ui'
import { useI18n } from '../i18n'

export function LegalPage() {
  const navigate = useNavigate()
  const { locale, t } = useI18n()

  return (
    <DocumentPage back={<BackLink label={t.backToGames} ariaLabel={t.backToGamesAria} onClick={() => navigate('/')} />}>
      {' '}
      <LegalNotice appName="AllGames" locale={locale} />{' '}
    </DocumentPage>
  )
}

export default LegalPage
