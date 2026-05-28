import { useTranslation } from 'react-i18next'
import { TESTIMONIALS } from '@/config.js'

function PlatformLabel({ platform }) {
  const labels = {
    booking: 'Booking.com',
    airbnb: 'Airbnb',
  }
  return (
    <p className="font-sans font-light text-xs tracking-widest uppercase text-terracotta">
      {labels[platform] || platform}
    </p>
  )
}

export default function Testimonials() {
  const { t } = useTranslation()

  if (!TESTIMONIALS || TESTIMONIALS.length === 0) return null

  return (
    <section id="testimonials" className="bg-warmWhite py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="mb-14">
          <p className="section-label mb-6">{t('testimonials.label')}</p>
          <h2 className="font-serif font-light text-espresso text-4xl md:text-5xl leading-snug">
            {t('testimonials.headline')}<br />
            <em className="italic text-mid">{t('testimonials.headlineItalic')}</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              className="border border-taupe/30 p-8 flex flex-col gap-4 hover:border-terracotta transition-colors duration-300"
            >
              {/* Platform label */}
              <PlatformLabel platform={testimonial.platform} />

              {/* Review text */}
              <p className="font-sans font-light text-mid text-base leading-relaxed flex-1">
                "{t(testimonial.text)}"
              </p>

              {/* Author info */}
              <div className="border-t border-taupe/20 pt-4">
                <p className="font-serif font-light text-espresso text-sm">{testimonial.author}</p>
                {testimonial.location && (
                  <p className="font-sans font-light text-taupe text-xs">{testimonial.location}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
