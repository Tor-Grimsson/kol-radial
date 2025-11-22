import React, { useMemo } from 'react'

/**
 * Slider Component
 *
 * Reusable range slider with label and value display
 *
 * @param {Object} props
 * @param {string} props.label - Slider label text
 * @param {number} props.min - Minimum value
 * @param {number} props.max - Maximum value
 * @param {number} props.value - Current value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.variant - Variant style: 'default' | 'minimal'
 * @param {string} props.className - Additional wrapper classes
 * @param {number} props.displayWidth - Width for value display (in characters)
 * @param {string} props.fontSize - Font size for label and value (e.g., '11px', '12px', '14px')
 * @param {number} props.step - Slider step increment (default: 1)
 * @param {Function} props.formatValue - Optional formatter for displayed value
 */
const Slider = ({
  label,
  min = 0,
  max = 100,
  value = 0,
  onChange,
  variant = 'default',
  className = '',
  displayWidth = 10,
  fontSize,
  step = 1,
  formatValue,
  animateState = 'none', // 'none', 'inactive', 'active'
  onToggleAnimate = null,
  animateIntensity = 0
}) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(Number(e.target.value))
    }
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    if (newValue === '' || newValue === '-') return
    const numValue = Number(newValue)
    if (isNaN(numValue)) return
    if (onChange) {
      onChange(numValue)
    }
  }

  const variantClass = variant === 'minimal' ? 'control-slider-minimal' : 'control-slider'
  const decimals = useMemo(() => {
    if (formatValue) return null
    if (!Number.isFinite(step)) return 0
    if (step >= 1) return 0
    const decimalPart = step.toString().split('.')[1]
    return decimalPart ? decimalPart.length : 2
  }, [formatValue, step])

  const displayValue = useMemo(() => {
    if (formatValue) return formatValue(value)
    if (decimals && decimals > 0) {
      return Number(value).toFixed(decimals)
    }
    return Math.round(value)
  }, [decimals, formatValue, value])

  const dotColor = animateState === 'active'
    ? `rgba(234, 179, 8, ${0.4 + animateIntensity * 0.6})` // yellow with intensity
    : animateState === 'inactive'
    ? 'rgba(255, 255, 255, 0.5)' // white when added but not animating
    : 'rgba(255, 255, 255, 0.3)' // dim white by default

  return (
    <div className={`${variantClass} gap-3 ${className}`}>
      {label && (
        <label className="kol-mono-xs whitespace-nowrap shrink-0 w-fit flex items-center gap-2" style={fontSize ? { fontSize } : undefined}>
          {label}
          {onToggleAnimate && (
            <button
              type="button"
              onClick={onToggleAnimate}
              className="w-2 h-2 rounded-full transition-all cursor-pointer border-none p-0"
              style={{ backgroundColor: dotColor }}
            />
          )}
        </label>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="slider-black flex-1 w-full cursor-pointer"
      />
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        className="w-[40px] px-2 py-1 rounded border border-auto kol-mono-text text-[11px] text-center hide-number-spinners shrink-0"
        style={fontSize ? { fontSize } : undefined}
      />
    </div>
  )
}

export default Slider
