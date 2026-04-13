import fullLogoSvg from '@/assets/logos/delrom-logo-full.svg?raw'
import nameOnlySvg from '@/assets/logos/delrom-logo-full-name-only.svg?raw'
import markOnlySvg from '@/assets/logos/delrom-mark-only.svg?raw'

const FILL_ON_LIGHT_BG = '#2C2520'
const FILL_ON_DARK_BG = '#FAF8F4'

function themeForLightBackgrounds(svg, light) {
  if (!light) return svg
  return svg.replaceAll(FILL_ON_LIGHT_BG, FILL_ON_DARK_BG)
}

function prepareSvg(svg, rootClass) {
  return svg.replace(/<svg\b([^>]*)>/, (_, attrs) => {
    const cleaned = attrs
      .replace(/\s+width="[^"]*"/g, '')
      .replace(/\s+height="[^"]*"/g, '')
      .trim()
    const spacer = cleaned ? ' ' : ''
    return `<svg class="${rootClass}" aria-hidden="true" focusable="false"${spacer}${cleaned}>`
  })
}

export default function Logo({ showWordmark = true, showTagline = false, light = false, size = 'default' }) {
  let raw = markOnlySvg
  if (showWordmark && showTagline) raw = fullLogoSvg
  else if (showWordmark) raw = nameOnlySvg

  let rootClass
  if (showWordmark) {
    if (size === 'large') {
      rootClass =
        'block h-24 w-auto max-h-24 max-w-[min(100%,22rem)] md:h-28 md:max-h-28 md:max-w-none'
    } else if (size === 'medium') {
      rootClass = showTagline
        ? 'block h-16 w-auto max-h-16 max-w-[min(100%,20rem)] md:h-20 md:max-h-20 md:max-w-none'
        : 'block h-12 w-auto max-h-12 md:h-14 md:max-h-14'
    } else {
      rootClass = 'block h-10 w-auto max-h-10'
    }
  } else if (size === 'large') {
    rootClass =
      'block h-24 w-24 max-h-24 max-w-24 shrink-0 md:h-28 md:w-28 md:max-h-28 md:max-w-28'
  } else if (size === 'medium') {
    rootClass =
      'block h-14 w-14 max-h-14 max-w-14 shrink-0 md:h-16 md:w-16 md:max-h-16 md:max-w-16'
  } else {
    rootClass = 'block h-10 w-10 max-h-10 max-w-10 shrink-0'
  }

  const html = prepareSvg(themeForLightBackgrounds(raw, light), rootClass)

  return <div className="flex items-center" dangerouslySetInnerHTML={{ __html: html }} />
}
