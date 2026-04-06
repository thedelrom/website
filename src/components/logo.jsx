export default function Logo({ showWordmark = true, showTagline = false, light = false }) {
  const textColor = '#C17A5A'
  const ringColor = '#C4B5A0'
  const wordmarkColor = light ? '#FAF8F4' : '#2C2520'

  return (
    <div className="flex items-center gap-3">
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        {/* Outer ring */}
        <circle cx="22" cy="22" r="20" stroke={ringColor} strokeWidth="1" fill="none" />
        {/* Inner ring at 84% radius = 16.8 */}
        <circle cx="22" cy="22" r="16.8" stroke={ringColor} strokeWidth="0.5" strokeOpacity="0.5" fill="none" />
        {/* DR monogram */}
        <text
          x="22"
          y="27"
          textAnchor="middle"
          fontFamily="Cormorant Garamond, Georgia, serif"
          fontWeight="300"
          fontSize="14"
          fill={textColor}
          letterSpacing="1"
        >
          DR
        </text>
      </svg>

      {(showWordmark || showTagline) && (
        <div className="flex flex-col leading-none">
          {showWordmark && (
            <span
              className="font-serif font-light tracking-widest uppercase text-sm"
              style={{ color: wordmarkColor }}
            >
              DELROM
            </span>
          )}
          {showTagline && (
            <span
              className="font-sans font-light tracking-widest uppercase mt-1"
              style={{ fontSize: '0.55rem', color: textColor }}
            >
              CURATED STAYS · PUERTO RICO
            </span>
          )}
        </div>
      )}
    </div>
  )
}
