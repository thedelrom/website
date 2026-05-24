import { useTranslation } from 'react-i18next'
import { REVIEW_PLATFORMS } from '@/config.js'

export default function ReviewPlatformButtons() {
  const { t } = useTranslation()

  const active = REVIEW_PLATFORMS.filter((p) => p.active)

  if (active.length === 0) {
    return (
      <p className="font-sans font-light text-taupe text-sm text-center">
        {t('review.noPlatforms')}
      </p>
    )
  }

  return (
    <nav aria-label="Review platforms">
      <ul className="flex flex-col gap-4 w-full list-none p-0 m-0">
        {active.map((platform) => {
          const name = t(`review.platforms.${platform.id}`)
          return (
            <li key={platform.id} className="flex justify-center">
              <a
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('review.platformAria', { platform: name })}
                className="btn-review-outline"
              >
                {name}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
