import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Home from '@/pages/home.jsx'
import Review from '@/pages/review.jsx'

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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/review" element={<Review />} />
      </Routes>
    </BrowserRouter>
  )
}
