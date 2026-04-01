// Replace these before going live.
// These values are safe to commit — they are public-facing URLs, not secrets.

export const BOOKING_URL     = 'https://www.booking.com/hotel/pr/delrom-4-beds-entire-apartment.html?chal_t=1775071525958&force_referer=https%3A%2F%2Fwww.google.com%2F'
export const EMAIL           = 'info@delrom.com'

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
