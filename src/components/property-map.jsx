import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MAP_CENTER, MAPS_OPEN_URL } from '@/config.js'
import delromMarkRaw from '@/assets/logos/delrom-mark-only.svg?raw'

const PROPERTY_COLOR = '#2C2520'

export default function PropertyMap() {
  const mapContainer = useRef(null)
  const map          = useRef(null)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new maplibregl.Map({
      container:        mapContainer.current,
      style:            'https://tiles.openfreemap.org/styles/liberty',
      center:           [MAP_CENTER.lng, MAP_CENTER.lat],
      zoom:             15.5,
      scrollZoom:       false, // prevent interference with page scroll
      attributionControl: false,
    })

    map.current.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-left'
    )

    map.current.on('load', () => {
      try {
        map.current.setPaintProperty('background', 'background-color', '#F0EBE3')

        map.current.getStyle().layers
          .filter((l) => l.type === 'fill' && l['source-layer'] === 'water')
          .forEach((l) => map.current.setPaintProperty(l.id, 'fill-color', '#C8D8E0'))

        map.current.getStyle().layers
          .filter((l) => l.type === 'line' && l.id.includes('road'))
          .forEach((l) => {
            const id    = l.id.toLowerCase()
            const color = id.includes('highway') || id.includes('motorway') || id.includes('trunk')
              ? '#B8A895'
              : id.includes('primary') || id.includes('secondary')
              ? '#CCBCAC'
              : '#D8CEC4'
            map.current.setPaintProperty(l.id, 'line-color', color)
          })

        map.current.getStyle().layers
          .filter((l) => l.type === 'symbol')
          .forEach((l) => {
            const id   = l.id.toLowerCase()
            const show = id.includes('place') || id.includes('water') ||
                         id.includes('ref')   || id.includes('suburb') ||
                         id.includes('neighbourhood') || id.includes('city') ||
                         id.includes('town')  || id.includes('village')
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
        console.warn('PropertyMap styling:', e)
      }

      // DelRom badge marker — identical to explore-map
      const propEl = document.createElement('div')
      propEl.style.cssText = 'cursor:pointer;line-height:0'

      const propPin = document.createElement('div')
      propPin.className    = 'delrom-badge'
      propPin.style.cssText = 'display:flex;flex-direction:column;align-items:center'

      const logoCircle = document.createElement('div')
      logoCircle.style.cssText = [
        'width:54px', 'height:54px',
        `background:${PROPERTY_COLOR}`,
        'clip-path:circle(50%)',
        'display:flex', 'align-items:center', 'justify-content:center',
      ].join(';')

      const lightMark = delromMarkRaw
        .replace('stroke="#C4B5A0" stroke-width="3"',     'stroke="rgba(255,255,255,0.3)" stroke-width="3"')
        .replace('stroke="#C4B5A0" stroke-opacity="0.5"', 'stroke="rgba(255,255,255,0.15)" stroke-opacity="1"')

      const svgWrap = document.createElement('div')
      svgWrap.innerHTML = lightMark
      const svgEl = svgWrap.querySelector('svg')
      svgEl.setAttribute('width',  '54')
      svgEl.setAttribute('height', '54')
      logoCircle.appendChild(svgEl)

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

      propEl.addEventListener('click', () => {
        window.open(MAPS_OPEN_URL, '_blank', 'noopener,noreferrer')
      })

      new maplibregl.Marker({ element: propEl, anchor: 'bottom' })
        .setLngLat([MAP_CENTER.lng, MAP_CENTER.lat])
        .addTo(map.current)
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  return <div ref={mapContainer} className="absolute inset-0" />
}
