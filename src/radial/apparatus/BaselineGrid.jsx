const BaselineGrid = ({
  gridSize = 8,
  opacity = 0.08,
  strokeWidth = 1,
  svgOpacity = 1,
  color = 'var(--kol-border-subtle)',
  offsetX = 0,
  offsetY = 0,
  className = '',
  style
}) => {
  const normalize = (value) => String(value).replace(/[^a-zA-Z0-9_-]/g, '-')
  const patternId = `baselineGrid-${gridSize}-${normalize(offsetX)}-${normalize(offsetY)}`

  return (
    <svg
      className={`absolute inset-0 pointer-events-none ${className}`.trim()}
      style={{ opacity: svgOpacity, width: '100%', height: '100%', color, ...style }}
    >
      <defs>
        <pattern
          id={patternId}
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${offsetX} ${offsetY})`}
        >
          <path
            d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}

export default BaselineGrid
