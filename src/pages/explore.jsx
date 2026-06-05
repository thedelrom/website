import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Logo from '@/components/logo.jsx'
import ExploreMap from '@/components/explore-map.jsx'
import { trackPageView } from '@/analytics.js'

export default function Explore() {
  const { t, i18n } = useTranslation()
  const resolved = i18n.resolvedLanguage ?? i18n.language
  const [showOverlay, setShowOverlay] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const mountTime = useRef(Date.now())

  useEffect(() => {
    trackPageView('/explore')
    document.title = t('explore.pageTitle')
  }, [t])

  const handleMapLoaded = useCallback(() => {
    const elapsed = Date.now() - mountTime.current
    const remaining = Math.max(0, 1800 - elapsed)
    setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => setShowOverlay(false), 700)
    }, remaining)
  }, [])

  return (
    <div className="h-dvh bg-warmWhite text-espresso flex flex-col overflow-hidden">
      {/* Loading overlay */}
      {showOverlay && (
        <div
          className={`fixed inset-0 bg-warmWhite z-50 flex items-center justify-center ${
            fadeOut ? 'animate-explore-fade-out' : ''
          }`}
        >
          <div className="flex flex-col items-center gap-6">
            <div className="animate-fade-up">
              <Logo showWordmark showTagline size="large" />
            </div>
            <div className="flex gap-1.5 animate-fade-up-delay">
              <span className="w-1 h-1 bg-taupe rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 bg-taupe rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 bg-taupe rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 h-14 bg-warmWhite/90 backdrop-blur border-b border-taupe/40 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Logo showWordmark showTagline={false} size="default" />
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="font-sans font-light text-xs tracking-widest uppercase text-taupe hover:text-espresso transition-colors hidden sm:block"
            >
              {t('explore.backHome')}
            </Link>
            <button
              onClick={() => {
                const newLang = resolved === 'es' ? 'en' : 'es'
                i18n.changeLanguage(newLang)
              }}
              className="font-sans font-light text-xs tracking-widest uppercase text-terracotta hover:text-espresso transition-colors"
              aria-label={t('explore.langToggleAria')}
            >
              {resolved === 'es' ? 'EN' : 'ES'}
            </button>
          </div>
        </div>
      </header>

      {/* Main map area */}
      <main className="flex-1 relative">
        <ExploreMap onMapLoaded={handleMapLoaded} />
      </main>
    </div>
  )
}
