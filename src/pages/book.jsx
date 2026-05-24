import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from '@/components/logo.jsx'
import PlatformButtons from '@/components/platform-buttons.jsx'
import { BOOKING_PLATFORMS } from '@/config.js'

const DEFAULT_TITLE = 'DelRom — Curated Stays · Puerto Rico'

export default function Book() {
  const { t, i18n } = useTranslation()

  const resolved = i18n.resolvedLanguage ?? i18n.language
  const isSpanish = resolved.startsWith('es')

  const toggleLanguage = () => {
    i18n.changeLanguage(isSpanish ? 'en' : 'es')
  }

  useEffect(() => {
    document.title = t('book.pageTitle')
    return () => {
      document.title = DEFAULT_TITLE
    }
  }, [t])

  const year = new Date().getFullYear()

  return (
    <div className="min-h-dvh bg-warmWhite text-espresso flex flex-col">
      {/* Header — centered column, same width as main content */}
      <header className="max-w-lg mx-auto w-full px-6 pt-8 pb-4 flex flex-col items-center gap-4">
        <div className="flex items-center justify-between w-full">
          <Link
            to="/"
            className="font-sans font-light text-xs tracking-widest uppercase text-espresso border border-taupe/60 px-3 py-1.5 hover:border-terracotta hover:text-terracotta transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta flex items-center gap-1.5"
            aria-label={t('book.backHome')}
          >
            <span aria-hidden="true">←</span>
            {t('book.backHomeLabel')}
          </Link>
          <button
            type="button"
            onClick={toggleLanguage}
            className="font-sans font-light text-xs tracking-widest uppercase text-espresso border border-taupe/60 px-3 py-1.5 hover:border-terracotta hover:text-terracotta transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
            aria-label={isSpanish ? 'Switch to English' : t('book.langToggleAria')}
          >
            {isSpanish ? 'EN' : 'ES'}
          </button>
        </div>
        <Logo showWordmark={false} size="large" />
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
        <h1 className="font-serif font-light italic text-espresso text-3xl md:text-4xl text-center leading-snug mb-3">
          {t('book.heading')}
        </h1>

        {/* Second divider */}
        <div className="w-full border-t border-taupe/40 my-8" role="presentation" />

        {/* Body copy */}
        <p className="font-sans font-light text-mid text-base text-center leading-relaxed mb-3 max-w-sm">
          {t('book.body')}
        </p>

        {/* Terracotta divider */}
        <div className="w-16 border-t border-terracotta my-8" role="presentation" />

        {/* Question */}
        <p className="section-label text-center mb-8">
          {t('book.question')}
        </p>

        {/* Platform buttons */}
        <div className="w-full flex justify-center">
          <PlatformButtons
            platforms={BOOKING_PLATFORMS}
            i18nPrefix="book"
            buttonClassName="btn-book-outline"
            navAriaLabel={t('book.question')}
          />
        </div>
      </main>

      {/* Minimal footer */}
      <footer
        className="flex items-center justify-center px-6 py-6"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <p className="font-sans font-light text-xs tracking-widest uppercase text-mid">
          {t('book.footerCopy')} · © {year}
        </p>
      </footer>
    </div>
  )
}
