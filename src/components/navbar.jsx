import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Logo from '@/components/logo.jsx'
import { BOOKING_URL } from '@/config.js'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { label: t('nav.about'),     href: '#about'     },
    { label: t('nav.gallery'),   href: '#gallery'   },
    { label: t('nav.amenities'), href: '#amenities' },
    { label: t('nav.location'),  href: '#location'  },
    { label: t('nav.contact'),   href: '#contact'   },
  ]

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 40)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrolled_classes = scrolled
    ? 'bg-warmWhite shadow-sm'
    : 'bg-transparent'

  const linkColor = scrolled ? 'text-mid hover:text-espresso' : 'text-warmWhite/80 hover:text-warmWhite'
  const langColor = scrolled ? 'text-mid hover:text-espresso' : 'text-warmWhite/80 hover:text-warmWhite'

  const resolved = i18n.resolvedLanguage ?? i18n.language
  const isSpanish = resolved.startsWith('es')

  const toggleLanguage = () => {
    i18n.changeLanguage(isSpanish ? 'en' : 'es')
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled_classes}`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16">
        <a href="#" aria-label="DelRom home">
          <Logo showWordmark showTagline={false} light={!scrolled} />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {links.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className={`font-sans font-light text-xs tracking-widest uppercase transition-colors duration-300 ${linkColor}`}
            >
              {label}
            </a>
          ))}
          <button
            type="button"
            onClick={toggleLanguage}
            className={`font-sans font-light text-xs tracking-widest uppercase min-w-[1.75rem] text-center transition-all duration-300 ease-out active:scale-[0.96] ${langColor}`}
            aria-label={isSpanish ? 'Switch to English' : 'Switch to Spanish'}
          >
            {isSpanish ? 'EN' : 'ES'}
          </button>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs"
          >
            {t('nav.bookNow')}
          </a>
        </nav>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-3">
          <button
            type="button"
            onClick={toggleLanguage}
            className={`font-sans font-light text-xs tracking-widest uppercase min-w-[1.75rem] text-center transition-all duration-300 ease-out active:scale-[0.96] ${scrolled ? 'text-mid hover:text-espresso' : 'text-warmWhite/80 hover:text-warmWhite'}`}
            aria-label={isSpanish ? 'Switch to English' : 'Switch to Spanish'}
          >
            {isSpanish ? 'EN' : 'ES'}
          </button>

          {/* Hamburger */}
          <button
            type="button"
            className={`flex flex-col gap-1.5 p-2 ${scrolled ? 'text-espresso' : 'text-warmWhite'}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span className={`block w-6 h-px bg-current transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-px bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-px bg-current transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 bg-warmWhite ${menuOpen ? 'max-h-96' : 'max-h-0'}`}
        aria-hidden={!menuOpen}
      >
        <nav className="flex flex-col px-6 py-6 gap-5" aria-label="Mobile navigation">
          {links.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="font-sans font-light text-xs tracking-widest uppercase text-mid hover:text-espresso transition-colors"
            >
              {label}
            </a>
          ))}
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="btn-primary text-xs self-start"
          >
            {t('nav.bookNow')}
          </a>
        </nav>
      </div>
    </header>
  )
}
