import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Logo from '@/components/logo.jsx'
import ReviewPlatformButtons from '@/components/review-platform-buttons.jsx'

const DEFAULT_TITLE = 'DelRom — Curated Stays · Puerto Rico'

export default function Review() {
  const { t, i18n } = useTranslation()

  const resolved = i18n.resolvedLanguage ?? i18n.language
  const isSpanish = resolved.startsWith('es')

  const toggleLanguage = () => {
    i18n.changeLanguage(isSpanish ? 'en' : 'es')
  }

  useEffect(() => {
    document.title = t('review.pageTitle')

    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    meta.setAttribute('data-review-meta', 'true')
    document.head.appendChild(meta)

    return () => {
      document.title = DEFAULT_TITLE
      document.head.querySelector('meta[data-review-meta]')?.remove()
    }
  }, [t])

  const year = new Date().getFullYear()

  return (
    <div className="min-h-dvh bg-espresso text-warmWhite flex flex-col">
      {/* Header: logo + language toggle */}
      <header className="flex items-center justify-between px-6 pt-8 pb-4">
        <div className="flex-1" aria-hidden="true" />
        <div className="flex justify-center flex-1">
          <Logo showWordmark={false} light size="large" />
        </div>
        <div className="flex-1 flex justify-end">
          <button
            type="button"
            onClick={toggleLanguage}
            className="font-sans font-light text-xs tracking-widest uppercase text-warmWhite border border-taupe/60 px-3 py-1.5 hover:border-terracotta hover:text-terracotta transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
            aria-label={isSpanish ? 'Switch to English' : t('review.langToggleAria')}
          >
            {isSpanish ? 'EN' : 'ES'}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main
        key={i18n.language}
        className="flex-1 flex flex-col items-center px-6 pb-12 md:pb-16 max-w-lg mx-auto w-full animate-i18n-swap"
        style={{ animationPlayState: 'running' }}
      >
        {/* Top divider */}
        <div className="w-full border-t border-taupe/40 mt-4 mb-8" role="presentation" />

        {/* Heading */}
        <h1 className="font-serif font-light italic text-warmWhite text-3xl md:text-4xl text-center leading-snug mb-3">
          {t('review.heading')}
        </h1>

        {/* Second divider */}
        <div className="w-full border-t border-taupe/40 my-8" role="presentation" />

        {/* Body copy */}
        <p className="font-sans font-light text-warmWhite text-base text-center leading-relaxed mb-3 max-w-sm">
          {t('review.body')}
        </p>

        {/* Terracotta divider */}
        <div className="w-16 border-t border-terracotta my-8" role="presentation" />

        {/* Question */}
        <p className="section-label text-taupe text-center mb-8">
          {t('review.question')}
        </p>

        {/* Platform buttons */}
        <div className="w-full flex justify-center">
          <ReviewPlatformButtons />
        </div>
      </main>

      {/* Minimal footer */}
      <footer
        className="flex items-center justify-center px-6 py-6"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <p className="font-sans font-light text-xs tracking-widest uppercase text-mid">
          {t('review.footerCopy')} · © {year}
        </p>
      </footer>
    </div>
  )
}
