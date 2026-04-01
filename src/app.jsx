import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Navbar from '@/components/navbar.jsx'
import Hero from '@/components/hero.jsx'
import About from '@/components/about.jsx'
import Gallery from '@/components/gallery.jsx'
import Amenities from '@/components/amenities.jsx'
import Location from '@/components/location.jsx'
import Contact from '@/components/contact.jsx'
import Footer from '@/components/footer.jsx'

export default function App() {
  const { i18n } = useTranslation()
  const skipContentLangAnim = useRef(true)

  useEffect(() => {
    skipContentLangAnim.current = false
  }, [])

  return (
    <>
      <Navbar />
      <div
        key={i18n.language}
        className={skipContentLangAnim.current ? '' : 'animate-i18n-swap'}
      >
        <main>
          <Hero />
          <About />
          <Gallery />
          <Amenities />
          <Location />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  )
}
