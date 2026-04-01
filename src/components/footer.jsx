import { useTranslation } from 'react-i18next'
import Logo from '@/components/logo.jsx'

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  const links = [
    { label: t('nav.about'),     href: '#about'     },
    { label: t('nav.gallery'),   href: '#gallery'   },
    { label: t('nav.amenities'), href: '#amenities' },
    { label: t('nav.location'),  href: '#location'  },
    { label: t('nav.contact'),   href: '#contact'   },
  ]

  return (
    <footer className="bg-espresso py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

          {/* Logo */}
          <a href="#" aria-label="DelRom home">
            <Logo showWordmark showTagline light />
          </a>

          {/* Nav links */}
          <nav className="flex flex-wrap items-center justify-center gap-6" aria-label="Footer navigation">
            {links.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="font-sans font-light text-xs tracking-widest uppercase text-taupe hover:text-warmWhite transition-colors duration-300"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Copyright */}
          <p className="font-sans font-light text-xs text-mid tracking-wide">
            © {year} DelRom. {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
