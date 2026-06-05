import { useEffect, useRef, useState, useMemo } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { useTranslation } from 'react-i18next'
import maplibregl from 'maplibre-gl'
import {
  X, Phone, Globe, LocateFixed,
  LayoutGrid, UtensilsCrossed, Waves, ShoppingBag, Landmark, Music2, Star,
  ShieldAlert, Train, Film, Trophy, Ticket, Package, Trees, Frame,
  MapPin, Droplet, Pill, Fuel, Plane, HeartPulse, ShieldCheck, Flame, Banknote, Bus,
} from 'lucide-react'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MAP_CENTER, MAPS_OPEN_URL, NEARBY_LOCATIONS, TREN_URBANO_STATIONS } from '@/config.js'
import delromMarkRaw from '@/assets/logos/delrom-mark-only.svg?raw'

const CATEGORY_COLORS = {
  dining:      '#C17A5A',
  beaches:     '#4A90B8',
  shopping:    '#8C6A2F',
  attractions: '#4A7A4A',
  nightlife:   '#6B5AAB',
  emergency:   '#C94040',
  transit:     '#3D6FA5',
  property:    '#2C2520',
}

// Override category color for specific location types
const TYPE_COLORS = {
  airport: '#3D6FA5',
}

const PROPERTY_LOCATION = {
  id: 'property',
  name: 'DelRom',
  category: 'property',
  type: 'property',
  featured: false,
  lat: MAP_CENTER.lat,
  lng: MAP_CENTER.lng,
  distance: '0 m',
  photo: null,
  hours: null,
  phone: null,
  website: 'https://thedelrom.com',
  googleMapsUrl: MAPS_OPEN_URL,
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

// Map location types/subtypes to Lucide icon components
const TYPE_ICON_MAP = {
  // Dining
  dining: UtensilsCrossed,
  // Beaches
  beach: Waves,
  // Shopping
  shopping: ShoppingBag,
  gas: Fuel,
  pharmacy: Pill,
  bank: Banknote,
  postal: ShoppingBag,
  // Attractions
  attraction: Landmark,
  park: Trees,
  museum: Frame,
  cinema: Film,
  stadium: Trophy,
  venue: Ticket,
  market: Package,
  landmark: Landmark,
  'historical-site': MapPin,
  'botanical-garden': Trees,
  'water-park': Droplet,
  sports: Trophy,
  // Nightlife
  nightlife: Music2,
  // Emergency
  hospital: HeartPulse,
  police: ShieldCheck,
  'fire-station': Flame,
  // Transit
  'train-station': Train,
  'bus-stop': Bus,
  airport: Plane,
}

const _iconSvgCache = new Map()
function getLucideIconSvg(IconComponent) {
  if (_iconSvgCache.has(IconComponent)) return _iconSvgCache.get(IconComponent)
  try {
    const markup = renderToStaticMarkup(<IconComponent size={24} strokeWidth={1.5} color="white" />)
    const inner = markup.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')
    _iconSvgCache.set(IconComponent, inner)
    return inner
  } catch (e) {
    console.warn('getLucideIconSvg error:', e)
    return ''
  }
}
// Height of the card strip — used to push the info card above it on mobile
const DRAWER_HEIGHT = 220 // mobile bottom drawer height

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
  const [hoveredId,        setHoveredId]        = useState(null)
  const rowRefsRef    = useRef({})
  const hoverFromPin  = useRef(false)
  const userLabelRef  = useRef(null)
  // Increments each time a new map instance finishes loading.
  // Using a counter (not a boolean) ensures the markers effect always re-runs
  // even in React Strict Mode, where effects are intentionally run twice and
  // state is not reset between invocations.
  const [mapLoadCount,     setMapLoadCount]     = useState(0)

  const panelVisible = true // desktop panel always visible
  const drawerVisible = (selectedCategory !== 'all' || searchQuery !== '') && !activeLocation // hide drawer when info card is open
  const stripVisible = drawerVisible

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

  const pickedLocations = useMemo(() => filteredLocations.filter(l => l.featured), [filteredLocations])
  const otherLocations  = useMemo(() => filteredLocations.filter(l => !l.featured), [filteredLocations])

  // Clear active location when switching category
  useEffect(() => {
    setActiveLocation(null)
  }, [selectedCategory])

  // Keep "You are here" label in sync with current language
  useEffect(() => {
    if (userLabelRef.current) {
      userLabelRef.current.textContent = t('explore.youAreHere')
    }
  }, [t])

  // Scroll panel to hovered row when hover originates from a pin
  useEffect(() => {
    if (hoveredId !== null && hoverFromPin.current) {
      rowRefsRef.current[hoveredId]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [hoveredId])

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
    const isMobile = window.innerWidth < 768
    const padding = isMobile
      ? { top: 80, bottom: 340, left: 24, right: 24 }   // above info card
      : { top: 40, bottom: 60, left: 300, right: 360 }  // clear of side panel + info card
    map.current?.flyTo({ center: [loc.lng, loc.lat], zoom: 16, duration: 600, padding })
  }

  const handleMyLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setUserLocation({ lat: latitude, lng: longitude })
        userMarkerRef.current?.remove()

        const el = document.createElement('div')
        el.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px'

        // "You are here" label — stored in ref so language updates can retranslate it
        const label = document.createElement('div')
        label.textContent = t('explore.youAreHere')
        userLabelRef.current = label
        label.style.cssText = [
          'background:white',
          'border:1px solid #C4B5A0',
          'padding:3px 8px',
          'font-size:9px',
          'letter-spacing:0.12em',
          'text-transform:uppercase',
          'font-family:Jost,sans-serif',
          'color:#2C2520',
          'white-space:nowrap',
          'box-shadow:0 1px 6px rgba(0,0,0,0.12)',
        ].join(';')

        // Dot container
        const dotWrap = document.createElement('div')
        dotWrap.style.cssText = 'position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center'

        // Pulse ring — clip-path overrides the global border-radius:0 !important
        const ring = document.createElement('div')
        ring.className = 'location-ring'
        ring.style.cssText = 'position:absolute;width:28px;height:28px;background:rgba(59,130,246,0.35);clip-path:circle(50%)'

        // Core dot — white wrapper gives the border, inner is the blue fill
        const dot = document.createElement('div')
        dot.style.cssText = [
          'width:22px', 'height:22px',
          'background:white',
          'clip-path:circle(50%)',
          'display:flex', 'align-items:center', 'justify-content:center',
          'position:relative', 'z-index:1',
          'filter:drop-shadow(0 2px 8px rgba(59,130,246,0.55))',
        ].join(';')
        const dotInner = document.createElement('div')
        dotInner.style.cssText = 'width:16px;height:16px;background:#3B82F6;clip-path:circle(50%)'
        dot.appendChild(dotInner)

        dotWrap.appendChild(ring)
        dotWrap.appendChild(dot)
        el.appendChild(label)
        el.appendChild(dotWrap)

        userMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'bottom' })
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
      propEl.style.cssText = 'cursor:pointer;line-height:0'

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

      propEl.addEventListener('click', () => setActiveLocation(PROPERTY_LOCATION))

      new maplibregl.Marker({ element: propEl, anchor: 'bottom' })
        .setLngLat([MAP_CENTER.lng, MAP_CENTER.lat])
        .addTo(map.current)

      setMapLoadCount(c => c + 1)
      onMapLoaded()

      // Close info card when tapping empty map space — pins stop propagation so they won't trigger this
      map.current.on('click', () => setActiveLocation(null))
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
      const color = TYPE_COLORS[loc.subtype] ?? TYPE_COLORS[loc.type] ?? CATEGORY_COLORS[loc.category]

      // Airport — special landmark marker, styled like the DelRom pin
      if (loc.type === 'airport') {
        const airportColor = TYPE_COLORS['airport']
        const iconSvg = getLucideIconSvg(Plane)

        const el = document.createElement('div')
        el.style.cssText = 'cursor:pointer;line-height:0'

        const pinEl = document.createElement('div')
        pinEl.className = 'delrom-badge'
        pinEl.style.cssText = 'display:flex;flex-direction:column;align-items:center;transition:filter 0.15s,transform 0.15s'

        const circle = document.createElement('div')
        circle.style.cssText = [
          'width:48px', 'height:48px',
          `background:${airportColor}`,
          'clip-path:circle(50%)',
          'display:flex', 'align-items:center', 'justify-content:center',
        ].join(';')
        circle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</svg>`

        const tip = document.createElement('div')
        tip.style.cssText = [
          'width:0', 'height:0',
          'border-left:7px solid transparent',
          'border-right:7px solid transparent',
          `border-top:9px solid ${airportColor}`,
          'margin-top:-1px',
        ].join(';')

        pinEl.appendChild(circle)
        pinEl.appendChild(tip)
        el.appendChild(pinEl)

        el.addEventListener('mouseenter', () => {
          if (chipElsRef.current[loc.id]?.active) return
          pinEl.style.transform = 'translateY(-3px) scale(1.1)'
        })
        el.addEventListener('mouseleave', () => {
          if (chipElsRef.current[loc.id]?.active) return
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
        chipElsRef.current[loc.id] = { pinEl, color: airportColor, active: false }
        return
      }

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
      const IconComponent = TYPE_ICON_MAP[loc.subtype] ?? TYPE_ICON_MAP[loc.type] ?? Landmark
      const iconSvg   = getLucideIconSvg(IconComponent)

      const el = document.createElement('div')
      el.style.cssText = 'cursor:pointer;display:flex;align-items:flex-start'

      const pinEl = document.createElement('div')
      pinEl.style.cssText = [
        'line-height:0',
        'filter:drop-shadow(0 2px 4px rgba(0,0,0,0.28))',
        'transition:filter 0.15s,transform 0.15s',
      ].join(';')

      const isTransit = loc.category === 'transit'

      if (isTransit) {
        // Circle marker for transit stops — no teardrop tip
        const r = loc.featured ? 16 : 13
        const size = r * 2
        const iSize = r * 0.75
        const iScale = iSize / 24
        const iOff = r - iSize / 2
        const iStroke = (1.5 / iScale).toFixed(1)
        const starBadge = loc.featured ? `
          <circle cx="${size - 2}" cy="2" r="7" fill="#C17A5A" stroke="white" stroke-width="1.5"/>
          <text x="${size - 2}" y="6" text-anchor="middle" font-size="9" fill="white" font-family="sans-serif">★</text>
        ` : ''
        pinEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" overflow="visible">
          <circle cx="${r}" cy="${r}" r="${r - 1}" fill="${color}" stroke="white" stroke-width="1.5"/>
          <g transform="translate(${iOff},${iOff}) scale(${iScale})"
             stroke="white" fill="none" stroke-width="${iStroke}"
             stroke-linecap="round" stroke-linejoin="round">
            ${iconSvg}
          </g>
          ${starBadge}
        </svg>`
      } else {
        // Teardrop marker for all other POIs
        const starBadge = loc.featured ? `
          <circle cx="${w - 1}" cy="4" r="8" fill="#C17A5A" stroke="white" stroke-width="1.5"/>
          <text x="${w - 1}" y="8" text-anchor="middle" font-size="11" fill="white" font-family="sans-serif">★</text>
        ` : ''
        pinEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" overflow="visible">
          <path d="${path}" fill="${color}" stroke="white" stroke-width="1.5"/>
          <g transform="translate(${iconOff},${iconOff}) scale(${iconScale})"
             stroke="white" fill="none" stroke-width="${strokeW}"
             stroke-linecap="round" stroke-linejoin="round">
            ${iconSvg}
          </g>
          ${starBadge}
        </svg>`
      }

      el.appendChild(pinEl)

      el.addEventListener('mouseenter', () => {
        if (chipElsRef.current[loc.id]?.active) return
        pinEl.style.filter    = 'drop-shadow(0 4px 8px rgba(0,0,0,0.38))'
        pinEl.style.transform = 'translateY(-3px) scale(1.15)'
        hoverFromPin.current = true
        setHoveredId(loc.id)
      })
      el.addEventListener('mouseleave', () => {
        if (chipElsRef.current[loc.id]?.active) return
        pinEl.style.filter    = 'drop-shadow(0 2px 4px rgba(0,0,0,0.28))'
        pinEl.style.transform = 'translateY(0) scale(1)'
        hoverFromPin.current = false
        setHoveredId(null)
      })
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        handleSelectLocation(loc)
      })

      const anchor = isTransit ? 'center' : 'bottom'
      const marker = new maplibregl.Marker({ element: el, anchor })
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
      {/* Filter strip — collapses on mobile when info card is open */}
      <div
        className={`bg-warmWhite/95 backdrop-blur border-b border-taupe/40 z-30 overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          activeLocation ? 'max-h-0 md:max-h-56' : 'max-h-56'
        }`}
      >
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


        {/* My Location button */}
        <button
          onClick={handleMyLocation}
          className="absolute right-3 z-20 w-9 h-9 bg-warmWhite border border-taupe/40 flex items-center justify-center hover:bg-terracotta hover:text-warmWhite hover:border-terracotta transition-colors shadow-sm"
          style={{ bottom: drawerVisible ? `${DRAWER_HEIGHT + 12}px` : '2rem' }}
          aria-label={t('explore.myLocation')}
        >
          <LocateFixed size={16} strokeWidth={1.5} />
        </button>

        {/* Info card */}
        {activeLocation && (() => {
          const openStatus = getOpenStatus(activeLocation.hours)
          return (
            <>
              <div
                className="absolute left-0 right-0 md:left-auto md:right-4 md:w-80 bg-warmWhite border border-taupe/40 shadow-lg z-20 overflow-hidden"
                style={{ bottom: drawerVisible ? `${DRAWER_HEIGHT}px` : '0' }}
              >
                {activeLocation.category === 'property' ? (
                  <div className="w-full h-36 flex items-center justify-center" style={{ backgroundColor: PROPERTY_COLOR }}>
                    <div dangerouslySetInnerHTML={{ __html: delromMarkRaw.replace('<svg', '<svg width="72" height="72"') }} />
                  </div>
                ) : activeLocation.photo && (
                  (() => {
                    const isPlaceholder = activeLocation.photo.includes('picsum')
                    const color = CATEGORY_COLORS[activeLocation.category]

                    return isPlaceholder ? (
                      <div className="w-full h-36 flex items-center justify-center" style={{ backgroundColor: color }}>
                        {(() => {
                          const IconComponent = TYPE_ICON_MAP[activeLocation.subtype] ?? TYPE_ICON_MAP[activeLocation.type] ?? Landmark
                          return <IconComponent size={48} strokeWidth={1.5} color="white" />
                        })()}
                      </div>
                    ) : (
                      <img
                        src={activeLocation.photo}
                        alt={activeLocation.name}
                        className="w-full h-36 object-cover"
                      />
                    )
                  })()
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
                        {activeLocation.category === 'property'
                          ? 'Río Piedras · San Juan, PR'
                          : `${t(`explore.categories.${activeLocation.category}`)} · ${activeLocation.distance}`}
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
            </>
          )
        })()}

        {/* Desktop side panel — always visible */}
        <div
          className="hidden md:flex flex-col absolute left-0 top-0 bottom-0 z-20 w-72 backdrop-blur-md border-r border-taupe/40"
          style={{ background: 'rgba(250, 248, 244, 0.94)' }}
        >
          {/* Panel header */}
          <div className="px-5 pt-4 pb-3 border-b border-taupe/20 flex items-center justify-between flex-shrink-0">
            <p className="font-sans font-light text-xs tracking-widest uppercase text-terracotta">
              {selectedCategory !== 'all' ? t(`explore.categories.${selectedCategory}`) : t('explore.categories.all')}
              <span className="text-taupe ml-2">{filteredLocations.length}</span>
            </p>
            {(selectedCategory !== 'all' || searchQuery !== '') && (
              <button onClick={() => { setSelectedCategory('all'); setSearchQuery('') }} className="text-taupe hover:text-espresso transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {/* DelRom Picks section */}
            {pickedLocations.length > 0 && (
              <>
                <div className="px-5 pt-3.5 pb-2 flex items-center gap-1.5">
                  <Star size={9} className="text-terracotta flex-shrink-0" fill="currentColor" />
                  <p className="font-sans font-light text-[10px] tracking-widest uppercase text-terracotta">
                    {t('explore.delromPicks')}
                  </p>
                </div>
                {pickedLocations.map(loc => {
                  const openStatus = getOpenStatus(loc.hours)
                  const isActive   = activeLocation?.id === loc.id
                  const isHovered  = hoveredId === loc.id
                  return (
                    <button key={loc.id} ref={(el) => { rowRefsRef.current[loc.id] = el }}
                      onClick={() => handleSelectLocation(loc)}
                      onMouseEnter={() => { hoverFromPin.current = false; setHoveredId(loc.id); const e = chipElsRef.current[loc.id]; if (e && !e.active) { e.pinEl.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.38))'; e.pinEl.style.transform = 'translateY(-3px) scale(1.15)' } }}
                      onMouseLeave={() => { setHoveredId(null); const e = chipElsRef.current[loc.id]; if (e && !e.active) { e.pinEl.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.28))'; e.pinEl.style.transform = 'translateY(0) scale(1)' } }}
                      className={`w-full text-left px-5 py-3.5 border-b border-taupe/15 flex items-start gap-3 transition-colors ${isActive ? 'bg-sand border-l-2 border-l-terracotta' : isHovered ? 'bg-sand border-l-2 border-l-taupe' : 'bg-sand/30'}`}
                    >
                      <div className="w-1.5 h-1.5 mt-1.5 flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[loc.category], clipPath: 'circle(50%)' }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-sans font-light text-sm text-espresso leading-snug flex-1 min-w-0 truncate">{loc.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-sans font-light text-xs text-taupe">{loc.distance}</span>
                          {openStatus && <span className={`text-[9px] tracking-widest uppercase font-sans px-1 py-0.5 ${openStatus.open ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{openStatus.open ? t('explore.openNow') : t('explore.closed')}</span>}
                        </div>
                      </div>
                    </button>
                  )
                })}
                {otherLocations.length > 0 && (
                  <div className="px-5 pt-3.5 pb-2 flex items-center gap-1.5 border-t border-taupe/20">
                    <p className="font-sans font-light text-[10px] tracking-widest uppercase text-taupe">
                      {t('explore.categories.all')} · {otherLocations.length}
                    </p>
                  </div>
                )}
              </>
            )}
            {/* Regular locations */}
            {otherLocations.map((loc) => {
              const openStatus = getOpenStatus(loc.hours)
              const isActive   = activeLocation?.id === loc.id
              const isHovered  = hoveredId === loc.id
              return (
                <button
                  key={loc.id}
                  ref={(el) => { rowRefsRef.current[loc.id] = el }}
                  onClick={() => handleSelectLocation(loc)}
                  onMouseEnter={() => { hoverFromPin.current = false; setHoveredId(loc.id); const e = chipElsRef.current[loc.id]; if (e && !e.active) { e.pinEl.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.38))'; e.pinEl.style.transform = 'translateY(-3px) scale(1.15)' } }}
                  onMouseLeave={() => { setHoveredId(null); const e = chipElsRef.current[loc.id]; if (e && !e.active) { e.pinEl.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.28))'; e.pinEl.style.transform = 'translateY(0) scale(1)' } }}
                  className={`w-full text-left px-5 py-3.5 border-b border-taupe/15 flex items-start gap-3 transition-colors ${isActive ? 'bg-sand border-l-2 border-l-terracotta' : isHovered ? 'bg-sand border-l-2 border-l-taupe' : ''}`}
                >
                  <div className="w-1.5 h-1.5 mt-1.5 flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[loc.category], clipPath: 'circle(50%)' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-sans font-light text-sm text-espresso leading-snug flex-1 min-w-0 truncate">{loc.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-sans font-light text-xs text-taupe">{loc.distance}</span>
                      {openStatus && <span className={`text-[9px] tracking-widest uppercase font-sans px-1 py-0.5 ${openStatus.open ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{openStatus.open ? t('explore.openNow') : t('explore.closed')}</span>}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Mobile bottom drawer */}
        <div
          className="md:hidden absolute bottom-0 left-0 right-0 z-30 backdrop-blur-md border-t border-taupe/40 flex flex-col"
          style={{
            background: 'rgba(250, 248, 244, 0.94)',
            height: `${DRAWER_HEIGHT}px`,
            transform: drawerVisible ? 'translateY(0)' : 'translateY(110%)',
            transition: 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          {/* Drawer header */}
          <div className="px-4 pt-3 pb-2 border-b border-taupe/20 flex items-center justify-between flex-shrink-0">
            <p className="font-sans font-light text-xs tracking-widest uppercase text-terracotta">
              {selectedCategory !== 'all' ? t(`explore.categories.${selectedCategory}`) : t('explore.categories.all')}
              <span className="text-taupe ml-2">{filteredLocations.length}</span>
            </p>
            <button onClick={() => { setSelectedCategory('all'); setSearchQuery('') }} className="text-taupe hover:text-espresso transition-colors">
              <X size={14} />
            </button>
          </div>
          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {pickedLocations.length > 0 && (
              <>
                <div className="px-4 pt-2.5 pb-1.5 flex items-center gap-1.5">
                  <Star size={8} className="text-terracotta flex-shrink-0" fill="currentColor" />
                  <p className="font-sans font-light text-[9px] tracking-widest uppercase text-terracotta">{t('explore.delromPicks')}</p>
                </div>
                {pickedLocations.map(loc => {
                  const openStatus = getOpenStatus(loc.hours)
                  const isActive = activeLocation?.id === loc.id
                  return (
                    <button key={loc.id} onClick={() => handleSelectLocation(loc)}
                      className={`w-full text-left px-4 py-2.5 border-b border-taupe/15 flex items-center gap-3 transition-colors ${isActive ? 'bg-sand border-l-2 border-l-terracotta' : 'bg-sand/30'}`}
                    >
                      <div className="w-1.5 h-1.5 flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[loc.category], clipPath: 'circle(50%)' }} />
                      <span className="font-sans font-light text-sm text-espresso flex-1 min-w-0 truncate">{loc.name}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-sans font-light text-xs text-taupe">{loc.distance}</span>
                        {openStatus && <span className={`text-[9px] tracking-widest uppercase font-sans px-1 py-0.5 ${openStatus.open ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{openStatus.open ? t('explore.openNow') : t('explore.closed')}</span>}
                      </div>
                    </button>
                  )
                })}
                {otherLocations.length > 0 && <div className="border-t border-taupe/20" />}
              </>
            )}
            {otherLocations.map((loc) => {
              const openStatus = getOpenStatus(loc.hours)
              const isActive   = activeLocation?.id === loc.id
              const isHovered  = hoveredId === loc.id
              return (
                <button
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc)}
                  onMouseEnter={() => { hoverFromPin.current = false; setHoveredId(loc.id); const e = chipElsRef.current[loc.id]; if (e && !e.active) { e.pinEl.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.38))'; e.pinEl.style.transform = 'translateY(-3px) scale(1.15)' } }}
                  onMouseLeave={() => { setHoveredId(null); const e = chipElsRef.current[loc.id]; if (e && !e.active) { e.pinEl.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.28))'; e.pinEl.style.transform = 'translateY(0) scale(1)' } }}
                  className={`w-full text-left px-4 py-3 border-b border-taupe/15 flex items-center gap-3 transition-colors ${isActive ? 'bg-sand border-l-2 border-l-terracotta' : isHovered ? 'bg-sand border-l-2 border-l-taupe' : ''}`}
                >
                  <div className="w-1.5 h-1.5 flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[loc.category], clipPath: 'circle(50%)' }} />
                  <span className="font-sans font-light text-sm text-espresso flex-1 min-w-0 truncate">{loc.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-sans font-light text-xs text-taupe">{loc.distance}</span>
                    {openStatus && <span className={`text-[9px] tracking-widest uppercase font-sans px-1 py-0.5 ${openStatus.open ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{openStatus.open ? t('explore.openNow') : t('explore.closed')}</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
