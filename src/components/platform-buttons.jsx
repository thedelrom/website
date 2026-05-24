import { useTranslation } from 'react-i18next'
import { trackPlatformClick } from '@/analytics.js'

/**
 * Generic data-driven platform link list.
 *
 * @param {{ id: string, url: string, active: boolean }[]} platforms
 * @param {string} i18nPrefix  - 'book' or 'review' — resolves display name, aria, and empty state
 * @param {string} buttonClassName - CSS utility class for the anchor
 * @param {string} navAriaLabel - accessible label for the wrapping <nav>
 */
export default function PlatformButtons({ platforms, i18nPrefix, buttonClassName, navAriaLabel }) {
  const { t } = useTranslation()

  const active = platforms.filter((p) => p.active)

  if (active.length === 0) {
    return (
      <p className="font-sans font-light text-sm text-center opacity-60">
        {t(`${i18nPrefix}.noPlatforms`)}
      </p>
    )
  }

  return (
    <nav aria-label={navAriaLabel}>
      <ul className="flex flex-col gap-4 w-full list-none p-0 m-0">
        {active.map((platform) => {
          const name = t(`${i18nPrefix}.platforms.${platform.id}`)
          return (
            <li key={platform.id} className="flex justify-center">
              <a
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t(`${i18nPrefix}.platformAria`, { platform: name })}
                className={buttonClassName}
                onClick={() => trackPlatformClick(i18nPrefix, platform.id)}
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
