import { useTranslation } from 'react-i18next'

const stats = [
  { value: 'stats.rating', label: 'stats.ratingLabel' },
  { value: 'stats.pr', label: 'stats.prLabel' },
  { value: 'stats.support', label: 'stats.supportLabel' },
]

export default function About() {
  const { t } = useTranslation()

  return (
    <section id="about" className="bg-warmWhite py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left column */}
          <div>
            <p className="section-label mb-6">{t('about.label')}</p>

            <h2 className="font-serif font-light text-espresso text-4xl md:text-5xl leading-snug mb-8">
              {t('about.headline')} <br />
              <em className="italic text-mid">{t('about.headlineItalic')}</em>
              <br />
              {t('about.headlineEnd')}
            </h2>

            <p className="font-sans font-light text-mid text-base leading-relaxed mb-12">
              {t('about.description')}
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-6 border-t border-taupe pt-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-serif font-light text-terracotta text-3xl mb-1">{t(`about.${stat.value}`)}</p>
                  <p className="font-sans font-light text-xs tracking-widest uppercase text-mid">{t(`about.${stat.label}`)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — photo */}
          <div className="overflow-hidden aspect-[4/5] relative">
            <img
              src="/images/photo-about.jpeg"
              alt={t('gallery.photo1Alt')}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
