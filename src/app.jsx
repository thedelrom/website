import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Home from '@/pages/home.jsx'
import Review from '@/pages/review.jsx'
import Book from '@/pages/book.jsx'
import Explore from '@/pages/explore.jsx'

import { trackPageView } from '@/analytics.js'

function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    trackPageView(pathname + search)
  }, [pathname, search])
  return null
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div key={location.pathname} className="animate-page-enter">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<Book />} />
        <Route path="/review" element={<Review />} />
        <Route path="/explore" element={<Explore />} />
      </Routes>
    </div>
  )
}

export default function App() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const lang = i18n.resolvedLanguage ?? i18n.language
    if (lang) document.documentElement.lang = lang
    const onLang = (lng) => {
      document.documentElement.lang = lng
    }
    i18n.on('languageChanged', onLang)
    return () => {
      i18n.off('languageChanged', onLang)
    }
  }, [i18n])

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
