import { useTranslation } from 'react-i18next'
import { BOOKING_URL } from '@/config.js'

export default function Hero() {
  const { t } = useTranslation()

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: "url('/images/hero.jpeg')" }}
        aria-hidden="true"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-espresso/55" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <p className="section-label text-warmWhite/60 animate-fade-up mb-6">
          {t('hero.label')}
        </p>

        <h1 className="font-serif font-light text-warmWhite text-5xl md:text-7xl leading-tight animate-fade-up-delay mb-6">
          {t('hero.headline')} <br />
          <em className="italic text-taupe">{t('hero.headlineItalic')}</em>
        </h1>

        <p className="font-sans font-light text-warmWhite/70 text-base md:text-lg max-w-lg mx-auto animate-fade-up-delay-2 mb-10">
          {t('hero.description')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up-delay-2">
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            {t('hero.cta1')}
          </a>
          <a
            href="#about"
            className="btn-outline text-warmWhite"
          >
            {t('hero.cta2')}
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M7 10l5 5 5-5"
            stroke="white"
            strokeOpacity="0.65"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  )
}
