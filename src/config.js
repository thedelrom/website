// These values are safe to commit — they are public-facing URLs, not secrets.

// All booking/review platforms in one place.
// To add a platform: append one object below and set active: true when ready.
// bookingUrl → listing page (/book page); reviewUrl → review-request link (/review page).
export const PLATFORMS = [
  {
    id: 'airbnb',
    bookingUrl: 'https://www.airbnb.com/rooms/1653978699227724936',
    reviewUrl:  'https://www.airbnb.com/rooms/1653978699227724936/reviews',
    active: true,
  },
  {
    id: 'booking',
    bookingUrl: 'https://www.booking.com/hotel/pr/delrom-4-beds-entire-apartment.html',
    reviewUrl:  'https://www.booking.com/hotel/pr/delrom-4-beds-entire-apartment.html',
    active: true,
  },
  // { id: 'vrbo', bookingUrl: 'YOUR_VRBO_LISTING_LINK', reviewUrl: 'YOUR_VRBO_REVIEW_LINK', active: false },
]

// Derived arrays — shape matches what platform-buttons.jsx expects. No need to edit these.
export const BOOKING_PLATFORMS = PLATFORMS.map((p) => ({ id: p.id, url: p.bookingUrl, active: p.active }))
export const REVIEW_PLATFORMS  = PLATFORMS.map((p) => ({ id: p.id, url: p.reviewUrl,  active: p.active }))

/**
 * Returns where "Book Now" CTAs should send the guest.
 * - One active platform → direct external link (no extra tap).
 * - Two or more → route to /book hub so the guest can choose.
 * @returns {{ type: 'external', url: string } | { type: 'hub' }}
 */
export function getBookingDestination() {
  const active = BOOKING_PLATFORMS.filter((p) => p.active)
  if (active.length === 1) return { type: 'external', url: active[0].url }
  return { type: 'hub' }
}

export const EMAIL = 'info@thedelrom.com'

// --- Map (Location section) -------------------------------------------------
// DelRom map: minimal, no street labels, brand colors (warmWhite / sand / terracotta pin).
//
// A) Google Static Maps (recommended — clean, no labels):
//    1. Google Cloud Console → enable "Maps Static API" (+ "Maps Embed API" optional).
//    2. Paste API key into GOOGLE_MAPS_EMBED_API_KEY below.
//    3. Set MAP_CENTER to your property. Static styled map is used automatically.
//
// B) No API key: paste Google Share → Embed src into MAPS_EMBED_SRC (standard Google Maps UI).

export const GOOGLE_MAPS_EMBED_API_KEY = ''

/** @deprecated — use MAP_CENTER + static map when API key is set */
export const MAPS_PLACE_QUERY = ''

/** Property coordinates for static map pin */
export const MAP_CENTER = { lat: 18.397004, lng: -66.03907 }

/** Opens full Google Maps when guest taps the map */
export const MAPS_OPEN_URL =
  'https://www.google.com/maps/place/425+C.+Soldado+Alcides+Reyes+de+Jes%C3%BAs,+San+Juan,+00923'

/** Used when GOOGLE_MAPS_EMBED_API_KEY is empty (Google Share → Embed src) */
export const MAPS_EMBED_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4234.499495619105!2d-66.0390703244256!3d18.397003872936352!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c03662d092733ff%3A0xb680b135e055a2e5!2s425%20C.%20Soldado%20Alcides%20Reyes%20de%20Jes%C3%BAs%2C%20San%20Juan%2C%2000923!5e1!3m2!1sen!2spr!4v1779658491443!5m2!1sen!2spr'

const STATIC_MAP_STYLES = [
  'feature:all|element:labels|visibility:off',
  'feature:landscape|color:0xFAF8F4',
  'feature:water|color:0xE8DDD0',
  'feature:road|color:0xE8DDD0',
  'feature:road.highway|color:0xC4B5A0',
  'feature:poi|visibility:off',
  'feature:transit|visibility:off',
]

/**
 * Styled static map — no labels, DelRom palette. Requires Maps Static API + key.
 * @returns {string} image URL, or '' when no API key
 */
export function getStaticMapSrc(width = 640, height = 480) {
  const key = GOOGLE_MAPS_EMBED_API_KEY.trim()
  if (!key) return ''

  const { lat, lng } = MAP_CENTER
  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: '16',
    size: `${width}x${height}`,
    scale: '2',
    key,
    markers: `color:0xC17A5A|${lat},${lng}`,
  })
  STATIC_MAP_STYLES.forEach((style) => params.append('style', style))
  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`
}

/** @returns {string} iframe src for embed fallback when static map unavailable */
export function getMapEmbedSrc() {
  return MAPS_EMBED_SRC.trim()
}
