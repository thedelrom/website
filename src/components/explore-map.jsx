import { useEffect, useRef, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import maplibregl from 'maplibre-gl'
import {
  X, Phone, Globe, LocateFixed,
  LayoutGrid, UtensilsCrossed, Waves, ShoppingBag, Landmark, Music2, Star,
  ShieldAlert, Train,
} from 'lucide-react'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MAP_CENTER, NEARBY_LOCATIONS, TREN_URBANO_STATIONS } from '@/config.js'
import delromMarkRaw from '@/assets/logos/delrom-mark-only.svg?raw'

const CATEGORY_COLORS = {
  dining:      '#C17A5A',
  beaches:     '#4A90B8',
  shopping:    '#8C6A2F',
  attractions: '#4A7A4A',
  nightlife:   '#6B5AAB',
  emergency:   '#C94040',
  transit:     '#3D6FA5',
}

const CATEGORY_ICONS = {
  all:         LayoutGrid,
  dining:      UtensilsCrossed,
  beaches:     Waves,
  shopping:    ShoppingBag,
  attractions: Landmark,
  nightlife:   Music2,
  emergency:   ShieldAlert,
  transit:     Train,
}

const PROPERTY_COLOR = '#2C2520'
const CATEGORIES = ['all', 'dining', 'beaches', 'shopping', 'attractions', 'nightlife', 'emergency', 'transit']

// Raw Lucide icon nodes per category (extracted from lucide-react v1.7.0)
const CATEGORY_ICON_NODES = {
  dining: [
    ['path', { d: 'm16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8' }],
    ['path', { d: 'M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7' }],
    ['path', { d: 'm2.1 21.8 6.4-6.3' }],
    ['path', { d: 'm19 5-7 7' }],
  ],
  beaches: [
    ['path', { d: 'M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1' }],
    ['path', { d: 'M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1' }],
    ['path', { d: 'M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1' }],
  ],
  shopping: [
    ['path', { d: 'M16 10a4 4 0 0 1-8 0' }],
    ['path', { d: 'M3.103 6.034h17.794' }],
    ['path', { d: 'M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z' }],
  ],
  attractions: [
    ['path', { d: 'M10 18v-7' }],
    ['path', { d: 'M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z' }],
    ['path', { d: 'M14 18v-7' }],
    ['path', { d: 'M18 18v-7' }],
    ['path', { d: 'M3 22h18' }],
    ['path', { d: 'M6 18v-7' }],
  ],
  nightlife: [
    ['circle', { cx: '8', cy: '18', r: '4' }],
    ['path', { d: 'M12 18V2l7 4' }],
  ],
  emergency: [
    ['path', { d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z' }],
    ['path', { d: 'M12 8v4' }],
    ['path', { d: 'M12 16h.01' }],
  ],
  transit: [
    ['rect', { width: '16', height: '16', x: '4', y: '3', rx: '2' }],
    ['path', { d: 'M4 11h16' }],
    ['path', { d: 'M12 3v8' }],
    ['path', { d: 'm8 19-2 3' }],
    ['path', { d: 'm18 22-2-3' }],
    ['path', { d: 'M8 15h.01' }],
    ['path', { d: 'M16 15h.01' }],
  ],
}

function iconNodesToSvg(nodes) {
  return nodes.map(([tag, attrs]) => {
    const attrStr = Object.entries(attrs)
      .filter(([k]) => k !== 'key')
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ')
    return `<${tag} ${attrStr}/>`
  }).join('')
}
// Height of the card strip — used to push the info card above it on mobile
const STRIP_HEIGHT = 116

function getOpenStatus(hours) {
  if (!hours) return null
  const lower = hours.toLowerCase()
  if (lower === 'always open') return { open: true, label: null }

  const timeMatch = hours.match(/(\d+(?::\d+)?\s*(?:am|pm))\s*[–-]\s*(\d+(?::\d+)?\s*(?:am|pm))/i)
  if (!timeMatch) return null

  const parseMinutes = (str) => {
    const clean = str.trim().toLowerCase()
    const isPM = clean.includes('pm')
    const isAM = clean.includes('am')
    const num = parseInt(clean)
    let h = num
    if (isPM && num !== 12) h += 12
    if (isAM && num === 12) h = 0
    return h * 60
  }

  const openMin  = parseMinutes(timeMatch[1])
  const closeMin = parseMinutes(timeMatch[2])
  const now      = new Date()
  const curMin   = now.getHours() * 60 + now.getMinutes()
  const open     = closeMin > openMin
    ? curMin >= openMin && curMin < closeMin
    : curMin >= openMin || curMin < closeMin

  return { open, label: open ? `Closes ${timeMatch[2].trim()}` : `Opens ${timeMatch[1].trim()}` }
}

export default function ExploreMap({ onMapLoaded }) {
  const { t } = useTranslation()
  const mapContainer  = useRef(null)
  const map           = useRef(null)
  const markersRef    = useRef({})
  const chipElsRef    = useRef({})  // DOM refs for chip elements so we can sync active state
  const userMarkerRef = useRef(null)
  const hoverPopup    = useRef(null)
  const prevCategory  = useRef('all')

  const [activeLocation,   setActiveLocation]   = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery,      setSearchQuery]      = useState('')
  const [userLocation,     setUserLocation]     = useState(null)
  // Increments each time a new map instance finishes loading.
  // Using a counter (not a boolean) ensures the markers effect always re-runs
  // even in React Strict Mode, where effects are intentionally run twice and
  // state is not reset between invocations.
  const [mapLoadCount,     setMapLoadCount]     = useState(0)

  const stripVisible = selectedCategory !== 'all'

  const categoryCounts = useMemo(() => {
    const counts = {}
    CATEGORIES.forEach((cat) => {
      counts[cat] = cat === 'all'
        ? NEARBY_LOCATIONS.length
        : NEARBY_LOCATIONS.filter((l) => l.category === cat).length
    })
    return counts
  }, [])

  const filteredLocations = useMemo(() => {
    return NEARBY_LOCATIONS.filter((loc) => {
      const matchCat    = selectedCategory === 'all' || loc.category === selectedCategory
      const matchSearch = searchQuery === '' ||
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.category.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSearch
    })
  }, [selectedCategory, searchQuery])

  // Clear active location when switching category
  useEffect(() => {
    setActiveLocation(null)
  }, [selectedCategory])

  // Sync pin active state — always on pinEl, never on the root el MapLibre owns
  useEffect(() => {
    Object.entries(chipElsRef.current).forEach(([id, entry]) => {
      const isActive = activeLocation?.id === +id
      entry.active = isActive
      entry.pinEl.style.filter    = isActive ? 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.28))'
      entry.pinEl.style.transform = isActive ? 'translateY(-4px) scale(1.2)' : 'translateY(0) scale(1)'
    })
  }, [activeLocation])

  const calcDistance = (lat1, lng1, lat2, lng2) => {
    const R    = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a    = Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`
  }

  const handleSelectLocation = (loc) => {
    hoverPopup.current?.remove()
    const dist = userLocation
      ? calcDistance(userLocation.lat, userLocation.lng, loc.lat, loc.lng)
      : loc.distance
    setActiveLocation({ ...loc, distance: dist })
    map.current?.flyTo({ center: [loc.lng, loc.lat], zoom: 16, duration: 600 })
  }

  const handleMyLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setUserLocation({ lat: latitude, lng: longitude })
        userMarkerRef.current?.remove()
        const el = document.createElement('div')
        el.style.cssText = 'width:12px;height:12px;background:#3B82F6;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3)'
        userMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .addTo(map.current)
        const bounds = new maplibregl.LngLatBounds()
        bounds.extend([MAP_CENTER.lng, MAP_CENTER.lat])
        bounds.extend([longitude, latitude])
        map.current.fitBounds(bounds, { padding: 80, duration: 1000 })
      },
      (err) => console.warn('Geolocation error:', err)
    )
  }

  // Init map
  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [MAP_CENTER.lng, MAP_CENTER.lat],
      zoom: 14,
      minZoom: 11,
      maxZoom: 18,
      maxBounds: [
        [-66.22, 18.30], // SW — covers Old San Juan + south Río Piedras
        [-65.92, 18.55], // NE — covers Isla Verde + northern coast
      ],
      attributionControl: false,
    })
    map.current.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-left'
    )

    map.current.on('load', () => {
      try {
        // Land background — slightly warmer/darker than before so roads have contrast to stand against
        map.current.setPaintProperty('background', 'background-color', '#F0EBE3')

        // Water — cool blue tint so guests immediately recognise coast/rivers
        map.current.getStyle().layers
          .filter((l) => l.type === 'fill' && l['source-layer'] === 'water')
          .forEach((l) => map.current.setPaintProperty(l.id, 'fill-color', '#C8D8E0'))

        // Roads — light hierarchy, present but not dominant
        map.current.getStyle().layers
          .filter((l) => l.type === 'line' && l.id.includes('road'))
          .forEach((l) => {
            const id = l.id.toLowerCase()
            const color = id.includes('highway') || id.includes('motorway') || id.includes('trunk')
              ? '#B8A895'   // highways — visible but warm/muted
              : id.includes('primary') || id.includes('secondary')
              ? '#CCBCAC'   // primary roads — subtle mid tone
              : '#D8CEC4'   // minor streets — barely there, just enough to see the grid
            map.current.setPaintProperty(l.id, 'line-color', color)
          })

        // Labels — only neighbourhood/district/place names for orientation.
        // Street-level labels are hidden (too cluttered). Highway shields stay.
        map.current.getStyle().layers
          .filter((l) => l.type === 'symbol')
          .forEach((l) => {
            const id = l.id.toLowerCase()
            // Only show: place names, water names, highway refs
            const show = id.includes('place') || id.includes('water') ||
                         id.includes('ref') || id.includes('suburb') ||
                         id.includes('neighbourhood') || id.includes('city') ||
                         id.includes('town') || id.includes('village')
            map.current.setLayoutProperty(l.id, 'visibility', show ? 'visible' : 'none')
            if (show) {
              try {
                map.current.setPaintProperty(l.id, 'text-color', '#8A7A6A')
                map.current.setPaintProperty(l.id, 'text-halo-color', '#F0EBE3')
                map.current.setPaintProperty(l.id, 'text-halo-width', 1.5)
              } catch (_) {}
            }
          })
      } catch (e) {
        console.warn('Map styling:', e)
      }

      // ── Tren Urbano ──────────────────────────────────────────────────────────
      // Added before the mask so the line only renders inside San Juan.
      const routeCoords = TREN_URBANO_STATIONS.map((s) => [s.lng, s.lat])
      const transitColor = '#3D6FA5'

      map.current.addSource('tren-urbano', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            // Route line
            {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: routeCoords },
            },
            // Station points
            ...TREN_URBANO_STATIONS.map((s) => ({
              type: 'Feature',
              properties: { name: s.name, nearDelRom: s.nearDelRom },
              geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
            })),
          ],
        },
      })

      // White backing gives the classic double-stroke metro line look
      map.current.addLayer({
        id: 'tren-urbano-bg',
        type: 'line',
        source: 'tren-urbano',
        filter: ['==', '$type', 'LineString'],
        paint: { 'line-color': '#ffffff', 'line-width': 5, 'line-opacity': 0.9 },
      })

      // Coloured front line
      map.current.addLayer({
        id: 'tren-urbano-line',
        type: 'line',
        source: 'tren-urbano',
        filter: ['==', '$type', 'LineString'],
        paint: { 'line-color': transitColor, 'line-width': 3, 'line-opacity': 0.95 },
      })

      // Station dots — nearDelRom stations slightly larger
      map.current.addLayer({
        id: 'tren-urbano-stations',
        type: 'circle',
        source: 'tren-urbano',
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius':       ['case', ['get', 'nearDelRom'], 6, 4],
          'circle-color':        '#ffffff',
          'circle-stroke-color': transitColor,
          'circle-stroke-width': ['case', ['get', 'nearDelRom'], 2.5, 1.8],
          'circle-opacity':      1,
        },
      })
      // ─────────────────────────────────────────────────────────────────────────

      // Hide everything outside San Juan Municipality.
      // GeoJSON requires: exterior ring = CCW, interior hole = CW.
      map.current.addSource('sj-mask', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              // Exterior ring — CCW (SW → NW → NE → SE → SW)
              [[-180,-90],[-180,90],[180,90],[180,-90],[-180,-90]],
              // Interior hole — CW (SW → SE → NE → NW → SW) = San Juan Municipality
              [[-66.22,18.30],[-65.92,18.30],[-65.92,18.55],[-66.22,18.55],[-66.22,18.30]],
            ],
          },
        },
      })
      map.current.addLayer({
        id: 'sj-mask',
        type: 'fill',
        source: 'sj-mask',
        paint: {
          'fill-color': '#F0EBE3',
          'fill-opacity': 1,
        },
      })

      // DelRom property marker — logo mark in a white circle with pointer
      // propEl: root, MapLibre positions this — we never touch its transform
      const propEl = document.createElement('div')
      propEl.style.cssText = 'cursor:default;line-height:0'

      // propPin: inner element we fully control
      const propPin = document.createElement('div')
      propPin.className = 'delrom-badge'
      propPin.style.cssText = 'display:flex;flex-direction:column;align-items:center'

      // Logo circle — espresso background, the mark's circle strokes lightened for dark bg
      const logoCircle = document.createElement('div')
      logoCircle.style.cssText = [
        'width:54px', 'height:54px',
        `background:${PROPERTY_COLOR}`,
        'clip-path:circle(50%)',
        'display:flex', 'align-items:center', 'justify-content:center',
      ].join(';')

      // Lighten the ring strokes so they're visible on the dark background
      const lightMark = delromMarkRaw
        .replace('stroke="#C4B5A0" stroke-width="3"',       'stroke="rgba(255,255,255,0.3)" stroke-width="3"')
        .replace('stroke="#C4B5A0" stroke-opacity="0.5"',   'stroke="rgba(255,255,255,0.15)" stroke-opacity="1"')

      const svgWrap = document.createElement('div')
      svgWrap.innerHTML = lightMark
      const svgEl = svgWrap.querySelector('svg')
      svgEl.setAttribute('width', '54')
      svgEl.setAttribute('height', '54')
      logoCircle.appendChild(svgEl)

      // Pointer triangle — same espresso colour
      const tip = document.createElement('div')
      tip.style.cssText = [
        'width:0', 'height:0',
        'border-left:7px solid transparent',
        'border-right:7px solid transparent',
        `border-top:9px solid ${PROPERTY_COLOR}`,
        'margin-top:-1px',
      ].join(';')

      propPin.appendChild(logoCircle)
      propPin.appendChild(tip)
      propEl.appendChild(propPin)

      new maplibregl.Marker({ element: propEl, anchor: 'bottom' })
        .setLngLat([MAP_CENTER.lng, MAP_CENTER.lat])
        .addTo(map.current)

      setMapLoadCount(c => c + 1)
      onMapLoaded()
    })

    return () => {
      hoverPopup.current?.remove()
      markersRef.current = {}
      chipElsRef.current = {}
      map.current?.remove()
    }
  }, [onMapLoaded])

  // Sync markers + fit bounds on category change
  useEffect(() => {
    if (mapLoadCount === 0) return

    Object.keys(markersRef.current).forEach((id) => {
      if (!filteredLocations.find((l) => l.id === +id)) {
        markersRef.current[id].remove()
        delete markersRef.current[id]
        delete chipElsRef.current[id]
      }
    })

    filteredLocations.forEach((loc) => {
      if (markersRef.current[loc.id]) return
      const color = CATEGORY_COLORS[loc.category]
      const w  = loc.featured ? 32 : 28
      const h  = loc.featured ? 44 : 38
      const cx = w / 2
      const cy = w / 2

      // Teardrop path
      const path = [
        `M${cx} 0`,
        `C${cx*0.45} 0 0 ${cy*0.45} 0 ${cy}`,
        `C0 ${cy+cx} ${cx} ${h} ${cx} ${h}`,
        `C${cx} ${h} ${w} ${cy+cx} ${w} ${cy}`,
        `C${w} ${cy*0.45} ${cx+cx*0.55} 0 ${cx} 0`,
        'Z',
      ].join(' ')

      // Icon centered in the circular top portion, white on category color
      const iconSize  = loc.featured ? 14 : 12
      const iconScale = iconSize / 24
      const iconOff   = cx - iconSize / 2
      // Compensate stroke-width for scale so lines stay ~1.5px visually
      const strokeW   = (1.5 / iconScale).toFixed(1)
      const iconSvg   = iconNodesToSvg(CATEGORY_ICON_NODES[loc.category] ?? [])

      // el: root — MapLibre owns the transform on this, never touch it
      const el = document.createElement('div')
      el.style.cssText = 'cursor:pointer;display:flex;align-items:flex-start'

      // pinEl: inner — safe for filter/transform transitions
      const pinEl = document.createElement('div')
      pinEl.style.cssText = [
        'line-height:0',
        'filter:drop-shadow(0 2px 4px rgba(0,0,0,0.28))',
        'transition:filter 0.15s,transform 0.15s',
      ].join(';')
      pinEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
          <path d="${path}" fill="${color}" stroke="white" stroke-width="1.5"/>
          <g transform="translate(${iconOff},${iconOff}) scale(${iconScale})"
             stroke="white" fill="none" stroke-width="${strokeW}"
             stroke-linecap="round" stroke-linejoin="round">
            ${iconSvg}
          </g>
        </svg>`
      el.appendChild(pinEl)

      el.addEventListener('mouseenter', () => {
        if (chipElsRef.current[loc.id]?.active) return
        pinEl.style.filter    = 'drop-shadow(0 4px 8px rgba(0,0,0,0.38))'
        pinEl.style.transform = 'translateY(-3px) scale(1.15)'
      })
      el.addEventListener('mouseleave', () => {
        if (chipElsRef.current[loc.id]?.active) return
        pinEl.style.filter    = 'drop-shadow(0 2px 4px rgba(0,0,0,0.28))'
        pinEl.style.transform = 'translateY(0) scale(1)'
      })
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        handleSelectLocation(loc)
      })

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([loc.lng, loc.lat])
        .addTo(map.current)
      markersRef.current[loc.id] = marker
      chipElsRef.current[loc.id] = { pinEl, color, active: false }
    })

    const categoryChanged = selectedCategory !== prevCategory.current
    prevCategory.current = selectedCategory
    if (categoryChanged && selectedCategory !== 'all' && filteredLocations.length > 0) {
      const bounds = new maplibregl.LngLatBounds()
      filteredLocations.forEach((l) => bounds.extend([l.lng, l.lat]))
      map.current.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 800 })
    }
  }, [filteredLocations, mapLoadCount, selectedCategory]) // eslint-disable-line

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Filter strip */}
      <div className="bg-warmWhite/95 backdrop-blur border-b border-taupe/40 z-30">
        {/* Category buttons — single scrollable row on all screen sizes */}
        <div
          className="flex gap-1.5 px-4 pt-3 pb-2 overflow-x-auto"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {CATEGORIES.map((cat) => {
            const Icon   = CATEGORY_ICONS[cat]
            const active = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-widest uppercase font-sans font-light transition-colors ${
                  active
                    ? 'bg-terracotta text-warmWhite'
                    : 'bg-warmWhite text-espresso border border-taupe/40 hover:border-terracotta'
                }`}
              >
                <Icon size={12} strokeWidth={1.5} />
                {t(`explore.categories.${cat}`)}
                <span className={`text-[10px] ${active ? 'opacity-70' : 'text-taupe'}`}>
                  {categoryCounts[cat]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search — below the category row */}
        <div className="px-4 pb-3">
          <input
            type="text"
            placeholder={t('explore.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 text-xs font-sans font-light bg-white border border-taupe/40 focus:outline-none focus:border-terracotta"
          />
        </div>
      </div>

      {/* Map container */}
      <div className="flex-1 relative min-h-0">
        <div ref={mapContainer} className="absolute inset-0" />


        {/* My Location button — sits above the card strip when visible */}
        <button
          onClick={handleMyLocation}
          className="absolute right-3 z-20 w-9 h-9 bg-warmWhite border border-taupe/40 flex items-center justify-center hover:bg-terracotta hover:text-warmWhite hover:border-terracotta transition-colors shadow-sm"
          style={{ bottom: stripVisible ? `${STRIP_HEIGHT + 12}px` : '2rem' }}
          aria-label={t('explore.myLocation')}
        >
          <LocateFixed size={16} strokeWidth={1.5} />
        </button>

        {/* Info card — floats above the card strip on mobile */}
        {activeLocation && (() => {
          const openStatus = getOpenStatus(activeLocation.hours)
          return (
            <>
              <div
                className="absolute left-0 right-0 sm:left-auto sm:right-4 sm:w-72 bg-warmWhite border border-taupe/40 shadow-lg z-20 overflow-hidden"
                style={{ bottom: stripVisible ? `${STRIP_HEIGHT}px` : '0' }}
              >
                {activeLocation.photo && (
                  <img
                    src={activeLocation.photo}
                    alt={activeLocation.name}
                    className="w-full h-36 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="font-serif font-light text-espresso text-lg leading-tight">
                          {activeLocation.name}
                        </p>
                        {activeLocation.featured && (
                          <span className="flex-shrink-0 bg-terracotta text-warmWhite text-[9px] tracking-widest uppercase font-sans px-1.5 py-0.5">
                            {t('explore.hostPick')}
                          </span>
                        )}
                      </div>
                      <p className="font-sans font-light text-xs tracking-widest uppercase text-terracotta">
                        {t(`explore.categories.${activeLocation.category}`)} · {activeLocation.distance}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveLocation(null)}
                      className="text-taupe hover:text-espresso transition-colors flex-shrink-0"
                      aria-label="Close"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {activeLocation.hours && (
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-sans font-light text-xs text-mid">{activeLocation.hours}</p>
                      {openStatus && (
                        <span className={`text-[10px] tracking-widest uppercase font-sans font-light px-1.5 py-0.5 ${
                          openStatus.open ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                        }`}>
                          {openStatus.open
                            ? (openStatus.label ?? t('explore.openNow'))
                            : (openStatus.label ?? t('explore.closed'))}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <a
                      href={activeLocation.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-terracotta text-warmWhite px-3 py-2 text-xs tracking-widest uppercase font-sans font-light text-center hover:bg-espresso transition-colors"
                    >
                      {t('explore.getDirections')}
                    </a>
                    {activeLocation.phone && (
                      <a href={`tel:${activeLocation.phone}`}
                        className="bg-sand text-espresso px-3 py-2 flex items-center justify-center hover:bg-taupe hover:text-warmWhite transition-colors"
                        aria-label={t('explore.callLabel')}
                      >
                        <Phone size={14} />
                      </a>
                    )}
                    {activeLocation.website && (
                      <a href={activeLocation.website} target="_blank" rel="noopener noreferrer"
                        className="bg-sand text-espresso px-3 py-2 flex items-center justify-center hover:bg-taupe hover:text-warmWhite transition-colors"
                        aria-label={t('explore.websiteLabel')}
                      >
                        <Globe size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              {/* Tap backdrop to close info card */}
              <div className="absolute inset-0 z-10" onClick={() => setActiveLocation(null)} aria-hidden />
            </>
          )
        })()}

        {/* Horizontal swipeable card strip */}
        <div
          className="absolute bottom-0 left-0 right-0 z-30 bg-warmWhite/95 backdrop-blur border-t border-taupe/40"
          style={{
            height: `${STRIP_HEIGHT}px`,
            transform: stripVisible ? 'translateY(0)' : 'translateY(110%)',
            transition: 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          <div
            className="flex gap-3 h-full items-center px-4 overflow-x-auto"
            style={{
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {filteredLocations.map((loc) => {
              const openStatus = getOpenStatus(loc.hours)
              const isActive   = activeLocation?.id === loc.id
              return (
                <button
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc)}
                  className={`flex-shrink-0 w-44 h-24 text-left border transition-colors flex overflow-hidden ${
                    isActive
                      ? 'border-terracotta'
                      : 'border-taupe/40 hover:border-terracotta'
                  }`}
                  style={{ scrollSnapAlign: 'start' }}
                >
                  {/* Thumbnail */}
                  {loc.photo ? (
                    <img
                      src={loc.photo}
                      alt={loc.name}
                      className="w-16 h-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-16 h-full flex-shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[loc.category] + '33' }}
                    />
                  )}

                  {/* Content */}
                  <div className={`flex-1 min-w-0 p-2 flex flex-col justify-between ${isActive ? 'bg-sand' : 'bg-warmWhite'}`}>
                    <div className="flex items-start gap-1 min-w-0">
                      <span className="font-sans font-light text-xs text-espresso leading-tight line-clamp-2 flex-1 min-w-0">
                        {loc.name}
                      </span>
                      {loc.featured && (
                        <Star size={9} className="text-terracotta flex-shrink-0 mt-0.5" fill="currentColor" />
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-sans font-light text-[10px] text-taupe">{loc.distance}</span>
                      {openStatus && (
                        <span className={`text-[9px] tracking-widest uppercase font-sans px-1 py-0.5 flex-shrink-0 ${
                          openStatus.open ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                        }`}>
                          {openStatus.open ? t('explore.openNow') : t('explore.closed')}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
            {/* Trailing padding card so last item has breathing room */}
            <div className="flex-shrink-0 w-1" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  )
}
