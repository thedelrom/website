import { useTranslation } from 'react-i18next'
import { REVIEW_PLATFORMS } from '@/config.js'
import PlatformButtons from '@/components/platform-buttons.jsx'

export default function ReviewPlatformButtons() {
  const { t } = useTranslation()

  return (
    <PlatformButtons
      platforms={REVIEW_PLATFORMS}
      i18nPrefix="review"
      buttonClassName="btn-review-outline"
      navAriaLabel={t('review.question')}
    />
  )
}
