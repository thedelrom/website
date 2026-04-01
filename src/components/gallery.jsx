import { useTranslation } from 'react-i18next'

const photos = [
  { src: '/images/photo1.jpeg', altKey: 'gallery.photo1Alt' },
  { src: '/images/photo2.jpeg', altKey: 'gallery.photo2Alt' },
  { src: '/images/photo3.jpeg', altKey: 'gallery.photo3Alt' },
  { src: '/images/photo4.jpeg', altKey: 'gallery.photo4Alt' },
]

export default function Gallery() {
  const { t } = useTranslation()

  return (
    <section id="gallery" className="bg-sand py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="section-label mb-4">{t('gallery.label')}</p>
            <h2 className="font-serif font-light text-espresso text-4xl md:text-5xl leading-snug">
              {t('gallery.headline')} <em className="italic text-mid">{t('gallery.headlineItalic')}</em>
            </h2>
          </div>
          <p className="font-sans font-light text-mid text-sm max-w-xs">
            {t('gallery.description')}
          </p>
        </div>

        {/* Wide hero photo */}
        <div className="overflow-hidden w-full aspect-[16/7] mb-3">
          <img
            src="/images/hero.jpeg"
            alt={t('gallery.heroAlt')}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
        </div>

        {/* 2 × 2 grid */}
        <div className="grid grid-cols-2 gap-3">
          {photos.map(({ src, altKey }) => (
            <div key={src} className="overflow-hidden aspect-[4/3]">
              <img
                src={src}
                alt={t(altKey)}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
