import { useTranslation } from 'react-i18next'
import { BOOKING_URL, EMAIL } from '@/config.js'

export default function Contact() {
  const { t } = useTranslation()

  return (
    <section id="contact" className="bg-sand py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
        <p className="section-label mb-6">{t('contact.label')}</p>

        <h2 className="font-serif font-light text-espresso text-4xl md:text-5xl leading-snug mb-6 max-w-2xl mx-auto">
          {t('contact.headline')} <em className="italic text-mid">{t('contact.headlineItalic')}</em>
        </h2>

        <p className="font-sans font-light text-mid text-base max-w-lg mx-auto mb-12">
          {t('contact.description')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            {t('contact.cta1')}
          </a>
        </div>

        <a
          href={`mailto:${EMAIL}`}
          className="font-sans font-light text-sm text-mid hover:text-terracotta transition-colors tracking-wide"
        >
          {EMAIL}
        </a>
      </div>
    </section>
  )
}
