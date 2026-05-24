import { useTranslation } from 'react-i18next'
import {
  Building2,
  Bus,
  Plane,
  ShoppingBag,
  UtensilsCrossed,
  Waves,
} from 'lucide-react'
import {
  getMapEmbedSrc,
  getStaticMapSrc,
  MAPS_OPEN_URL,
} from '@/config.js'

const iconClass =
  'w-6 h-6 text-taupe shrink-0 mt-0.5'

const highlights = [
  { Icon: ShoppingBag, labelKey: 'location.highlights.shopping', detailKey: 'location.highlights.shoppingDetail' },
  { Icon: Waves, labelKey: 'location.highlights.beaches', detailKey: 'location.highlights.beachesDetail' },
  { Icon: UtensilsCrossed, labelKey: 'location.highlights.dining', detailKey: 'location.highlights.diningDetail' },
  { Icon: Building2, labelKey: 'location.highlights.business', detailKey: 'location.highlights.businessDetail' },
  { Icon: Bus, labelKey: 'location.highlights.transit', detailKey: 'location.highlights.transitDetail' },
  { Icon: Plane, labelKey: 'location.highlights.airport', detailKey: 'location.highlights.airportDetail' },
]

export default function Location() {
  const { t } = useTranslation()
  const staticMapSrc = getStaticMapSrc()
  const embedSrc = getMapEmbedSrc()
  const hasMap = Boolean(staticMapSrc || embedSrc)

  return (
    <section id="location" className="bg-warmWhite py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left */}
          <div>
            <p className="section-label mb-6">{t('location.label')}</p>
            <h2 className="font-serif font-light text-espresso text-4xl md:text-5xl leading-snug mb-6">
              {t('location.headline')} <br />
              <em className="italic text-mid">{t('location.headlineItalic')}</em>
            </h2>
            <p className="font-sans font-light text-mid text-base leading-relaxed mb-10">
              {t('location.description')}
            </p>

            <div className="flex flex-col gap-5">
              {highlights.map(({ Icon, labelKey, detailKey }) => (
                <div key={labelKey} className="flex items-start gap-4 border-b border-taupe/30 pb-5 last:border-0 last:pb-0">
                  <Icon className={iconClass} strokeWidth={1.25} aria-hidden />
                  <div>
                    <p className="font-sans font-light text-xs tracking-widest uppercase text-terracotta mb-1">{t(labelKey)}</p>
                    <p className="font-sans font-light text-mid text-sm">{t(detailKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — map */}
          <div>
            <div className="w-full aspect-[4/3] overflow-hidden border border-taupe/40 bg-sand">
              {staticMapSrc ? (
                <a
                  href={MAPS_OPEN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                  aria-label={t('location.mapOpenAria')}
                >
                  <img
                    src={staticMapSrc}
                    alt={t('location.mapTitle')}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </a>
              ) : embedSrc ? (
                <iframe
                  title={t('location.mapTitle')}
                  src={embedSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="font-sans font-light text-mid text-xs tracking-widest uppercase">
                    {t('location.mapPlaceholder')}
                  </p>
                </div>
              )}
            </div>

            {hasMap && (
              <a
                href={MAPS_OPEN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 font-sans font-light text-xs tracking-widest uppercase text-taupe hover:text-terracotta transition-colors duration-300"
              >
                {t('location.mapOpenLink')}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
