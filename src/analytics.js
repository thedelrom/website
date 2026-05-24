import { GA_MEASUREMENT_ID } from '@/config.js'

function gtagAvailable() {
  return GA_MEASUREMENT_ID && typeof window.gtag === 'function'
}

export function trackPageView(pagePath) {
  if (!gtagAvailable()) return
  window.gtag('config', GA_MEASUREMENT_ID, { page_path: pagePath })
}

/** Fires when a user taps a book or review platform button. */
export function trackPlatformClick(intent, platformId) {
  if (!gtagAvailable()) return
  window.gtag('event', 'platform_click', {
    intent,
    platform: platformId,
  })
}
