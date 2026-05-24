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
// For a map that looks like Google Maps, use either A or B (A takes priority).
//
// A) Maps Embed API (recommended — same UI as Google Maps, pin + styling):
//    1. Google Cloud Console → create/select project → APIs & Services → Enable API
//       → enable "Maps Embed API" (no charge for standard embed usage; key is still required).
//    2. Credentials → Create credentials → API key → restrict key (HTTP referrers: your domain).
//    3. Paste the key into GOOGLE_MAPS_EMBED_API_KEY below. MAPS_PLACE_QUERY should match your address.
//
// B) No API key: open Google Maps at your property → Share → "Embed a map" → Copy HTML.
//    Paste only the iframe src URL into MAPS_EMBED_SRC (replace the OpenStreetMap URL).
//    Leave GOOGLE_MAPS_EMBED_API_KEY empty.
//
// Fallback: if the API key is empty, MAPS_EMBED_SRC is used (OpenStreetMap below).

export const GOOGLE_MAPS_EMBED_API_KEY = ''

/** Address or place name for Embed API (used only when GOOGLE_MAPS_EMBED_API_KEY is set). */
export const MAPS_PLACE_QUERY = ''

/** Used when GOOGLE_MAPS_EMBED_API_KEY is empty (OSM, or paste Google Share → Embed src here). */
export const MAPS_EMBED_SRC =
  'https://www.openstreetmap.org/export/embed.html?bbox=-66.0385%2C18.3955%2C-66.0345%2C18.3985&layer=mapnik&marker=18.3969988%2C-66.0364954'

/**
 * @returns {string} iframe src — Google Embed API when key is set, otherwise MAPS_EMBED_SRC
 */
export function getMapEmbedSrc() {
  const key = GOOGLE_MAPS_EMBED_API_KEY.trim()
  const q = MAPS_PLACE_QUERY.trim()
  if (key && q) {
    const params = new URLSearchParams({ key, q, zoom: '17' })
    return `https://www.google.com/maps/embed/v1/place?${params.toString()}`
  }
  return MAPS_EMBED_SRC.trim()
}
