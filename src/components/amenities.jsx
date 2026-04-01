import { useTranslation } from 'react-i18next'

const amenities = [
  {
    labelKey: 'amenities.items.wifi',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6">
        <path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="2" />
      </svg>
    ),
  },
  {
    labelKey: 'amenities.items.ac',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6">
        <path d="M8 16a5 5 0 0 1 1-3" /><path d="M7.5 8C9 6.5 11 6 12 6s3 .5 4.5 2" />
        <rect x="3" y="11" width="18" height="5" /><path d="M7 16v3m5-3v3m5-3v3" />
      </svg>
    ),
  },
  {
    labelKey: 'amenities.items.kitchen',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
      </svg>
    ),
  },
  {
    labelKey: 'amenities.items.tv',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6">
        <rect x="2" y="4" width="20" height="14" /><path d="M8 20h8" /><line x1="12" y1="18" x2="12" y2="20" />
      </svg>
    ),
  },
  {
    labelKey: 'amenities.items.checkin',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6">
        <rect x="3" y="11" width="18" height="11" rx="0" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        <circle cx="12" cy="16" r="1" />
      </svg>
    ),
  },
  {
    labelKey: 'amenities.items.linens',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6">
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
        <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
      </svg>
    ),
  },
  {
    labelKey: 'amenities.items.laundry',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6">
        <rect x="2" y="2" width="20" height="20" />
        <circle cx="12" cy="13" r="5" /><path d="M7 7h.01M12 7h.01" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    labelKey: 'amenities.items.parking',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6">
        <rect x="1" y="3" width="15" height="13" />
        <path d="M16 8h4l3 5v3h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
]

export default function Amenities() {
  const { t } = useTranslation()

  return (
    <section id="amenities" className="bg-espresso py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="mb-14">
          <p className="section-label text-taupe mb-6">{t('amenities.label')}</p>
          <h2 className="font-serif font-light text-warmWhite text-4xl md:text-5xl leading-snug">
            {t('amenities.headline')}<br />
            <em className="italic text-taupe">{t('amenities.headlineItalic')}</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {amenities.map(({ labelKey, icon }) => (
            <div
              key={labelKey}
              className="border border-mid/30 px-6 py-8 flex flex-col gap-4 hover:border-taupe transition-colors duration-300"
            >
              <div className="text-taupe">{icon}</div>
              <p className="font-sans font-light text-warmWhite/80 text-sm tracking-wide">{t(labelKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
