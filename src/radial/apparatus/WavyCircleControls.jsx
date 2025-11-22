import { useEffect, useRef, useState } from 'react'
import { SketchPicker } from 'react-color'
import { Slider, ToggleCheckbox } from '../../components/atoms'

const lfoWaveTypes = [
  {
    value: 'sine',
    icon: (
      <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M0 6 Q 2.5 0, 5 6 T 10 6 Q 12.5 12, 15 6 T 20 6" />
      </svg>
    )
  },
  {
    value: 'triangle',
    icon: (
      <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="miter">
        <path d="M0 6 L 5 0 L 10 12 L 15 0 L 20 6" />
      </svg>
    )
  },
  {
    value: 'square',
    icon: (
      <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="miter">
        <path d="M0 6 L 0 0 L 5 0 L 5 12 L 10 12 L 10 0 L 15 0 L 15 12 L 20 12" />
      </svg>
    )
  },
  {
    value: 'random',
    icon: (
      <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="miter">
        <path d="M0 8 L 4 8 L 4 2 L 8 2 L 8 10 L 12 10 L 12 4 L 16 4 L 16 6 L 20 6" />
      </svg>
    )
  }
]

const WavyCircleControls = ({
  params,
  ui,
  paramRanges,
  onParamChange,
  onUiToggle,
  onToggleAnimateParam,
  animationIntensities
}) => {
  const [showPathPicker, setShowPathPicker] = useState(false)
  const [showFillPicker, setShowFillPicker] = useState(false)
  const pathPickerRef = useRef(null)
  const fillPickerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPathPicker && pathPickerRef.current && !pathPickerRef.current.contains(event.target)) {
        setShowPathPicker(false)
      }
      if (showFillPicker && fillPickerRef.current && !fillPickerRef.current.contains(event.target)) {
        setShowFillPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPathPicker, showFillPicker])

  return (
    <aside className="flex w-[400px] flex-col gap-8 p-6 rounded border border-auto" style={{ backgroundColor: '#121215' }}>
      <section className="flex flex-col gap-2">
        <h2 className="control-heading">WAVE PARAMETERS</h2>
        <Slider
          label="Radius"
          min={paramRanges.radius.min}
          max={paramRanges.radius.max}
          value={params.radius}
          step={1}
          onChange={(value) => onParamChange('radius', value)}
          variant="minimal"
          className="w-full"
          animateState={ui.animatedParams.includes('radius') ? (ui.animate ? 'active' : 'inactive') : 'none'}
          onToggleAnimate={ui.animate ? () => onToggleAnimateParam('radius') : null}
          animateIntensity={animationIntensities.radius || 0}
        />
        <Slider
          label="Amplitude"
          min={paramRanges.amplitude.min}
          max={paramRanges.amplitude.max}
          value={params.amplitude}
          step={1}
          onChange={(value) => onParamChange('amplitude', value)}
          variant="minimal"
          className="w-full"
          animateState={ui.animatedParams.includes('amplitude') ? (ui.animate ? 'active' : 'inactive') : 'none'}
          onToggleAnimate={ui.animate ? () => onToggleAnimateParam('amplitude') : null}
          animateIntensity={animationIntensities.amplitude || 0}
        />
        <Slider
          label="Scale"
          min={0.1}
          max={2}
          step={0.1}
          value={params.scale}
          onChange={(value) => onParamChange('scale', value)}
          variant="minimal"
          className="w-full"
          formatValue={(value) => `${value.toFixed(1)}×`}
          animateState={ui.animatedParams.includes('scale') ? (ui.animate ? 'active' : 'inactive') : 'none'}
          onToggleAnimate={ui.animate ? () => onToggleAnimateParam('scale') : null}
          animateIntensity={animationIntensities.scale || 0}
        />
        <Slider
          label="Rotate"
          min={0}
          max={360}
          step={1}
          value={params.rotate}
          onChange={(value) => onParamChange('rotate', value)}
          variant="minimal"
          className="w-full"
          formatValue={(value) => `${value}°`}
          animateState={ui.animatedParams.includes('rotate') ? (ui.animate ? 'active' : 'inactive') : 'none'}
          onToggleAnimate={ui.animate ? () => onToggleAnimateParam('rotate') : null}
          animateIntensity={animationIntensities.rotate || 0}
        />
        <Slider
          label="Frequency"
          min={1}
          max={12}
          value={params.frequency}
          step={1}
          onChange={(value) => onParamChange('frequency', value)}
          variant="minimal"
          className="w-full"
          animateState={ui.animatedParams.includes('frequency') ? (ui.animate ? 'active' : 'inactive') : 'none'}
          onToggleAnimate={ui.animate ? () => onToggleAnimateParam('frequency') : null}
          animateIntensity={animationIntensities.frequency || 0}
        />
        <Slider
          label="Resolution"
          min={1}
          max={16}
          value={params.resolution}
          step={1}
          onChange={(value) => onParamChange('resolution', value)}
          variant="minimal"
          className="w-full"
          animateState={ui.animatedParams.includes('resolution') ? (ui.animate ? 'active' : 'inactive') : 'none'}
          onToggleAnimate={ui.animate ? () => onToggleAnimateParam('resolution') : null}
          animateIntensity={animationIntensities.resolution || 0}
        />
        <Slider
          label="LFO Amount"
          min={0}
          max={10}
          value={params.lfoAmount}
          step={0.1}
          onChange={(value) => onParamChange('lfoAmount', value)}
          variant="minimal"
          className="w-full"
          animateState={ui.animatedParams.includes('lfoAmount') ? (ui.animate ? 'active' : 'inactive') : 'none'}
          onToggleAnimate={ui.animate ? () => onToggleAnimateParam('lfoAmount') : null}
          animateIntensity={animationIntensities.lfoAmount || 0}
        />
        <Slider
          label="LFO Frequency"
          min={1}
          max={12}
          value={params.lfoFrequency}
          step={params.lfoSync ? 1 : 0.1}
          onChange={(value) => onParamChange('lfoFrequency', value)}
          variant="minimal"
          className="w-full"
          animateState={ui.animatedParams.includes('lfoFrequency') ? (ui.animate ? 'active' : 'inactive') : 'none'}
          onToggleAnimate={ui.animate ? () => onToggleAnimateParam('lfoFrequency') : null}
          animateIntensity={animationIntensities.lfoFrequency || 0}
        />
        <div className="flex flex-row justify-between items-start my-2">
          <ToggleCheckbox
            label={<span className="kol-mono-xs tracking-[0.08em]">Sync</span>}
            checked={params.lfoSync}
            onChange={(next) => onParamChange('lfoSync', next)}
          />
          <div className="flex flex-col gap-3">
            <ToggleCheckbox
              label={<span className="kol-mono-xs tracking-[0.08em]">Sym X</span>}
              checked={params.lfoSymmetryX}
              onChange={(next) => onParamChange('lfoSymmetryX', next)}
            />
            <ToggleCheckbox
              label={<span className="kol-mono-xs tracking-[0.08em]">Sym Y</span>}
              checked={params.lfoSymmetryY}
              onChange={(next) => onParamChange('lfoSymmetryY', next)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {lfoWaveTypes.map((type) => {
              const isActive = params.lfoWaveType === type.value
              return (
                <button
                  type="button"
                  key={type.value}
                  onClick={() => onParamChange('lfoWaveType', type.value)}
                  className={`rounded border px-2 py-1 transition flex items-center justify-center ${
                    isActive
                      ? 'border-auto bg-[var(--kol-surface-on-primary)] text-[var(--kol-surface-primary)]'
                      : 'border-auto text-[var(--kol-surface-on-primary)] hover:border-[var(--kol-border-strong)]'
                  }`}
                >
                  {type.icon}
                </button>
              )
            })}
          </div>
        </div>
        <Slider
          label="Zoom"
          min={0.5}
          max={3}
          step={0.1}
          value={params.zoom}
          onChange={(value) => onParamChange('zoom', value)}
          variant="minimal"
          className="w-full"
          formatValue={(value) => `${value.toFixed(1)}×`}
          animateState={ui.animatedParams.includes('zoom') ? (ui.animate ? 'active' : 'inactive') : 'none'}
          onToggleAnimate={ui.animate ? () => onToggleAnimateParam('zoom') : null}
          animateIntensity={animationIntensities.zoom || 0}
        />
        <Slider
          label="Stroke Width"
          min={0.5}
          max={5}
          step={0.5}
          value={params.strokeWidth}
          onChange={(value) => onParamChange('strokeWidth', value)}
          variant="minimal"
          className="w-full"
          formatValue={(value) => `${value.toFixed(1)}px`}
          animateState={ui.animatedParams.includes('strokeWidth') ? (ui.animate ? 'active' : 'inactive') : 'none'}
          onToggleAnimate={ui.animate ? () => onToggleAnimateParam('strokeWidth') : null}
          animateIntensity={animationIntensities.strokeWidth || 0}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="control-heading">VISUALIZATION</h2>
        <div className="grid grid-cols-3 gap-4">
          <ToggleCheckbox
            label={<span className="kol-mono-text-xs tracking-[0.08em]">Grid</span>}
            checked={ui.showGrid}
            onChange={(next) => onUiToggle('showGrid', next)}
          />
          <ToggleCheckbox
            label={<span className="kol-mono-text-xs tracking-[0.08em]">Nodes</span>}
            checked={ui.showNodes}
            onChange={(next) => onUiToggle('showNodes', next)}
          />
          <ToggleCheckbox
            label={<span className="kol-mono-text-xs tracking-[0.08em]">Handles</span>}
            checked={ui.showHandles}
            onChange={(next) => onUiToggle('showHandles', next)}
          />
          <ToggleCheckbox
            label={<span className="kol-mono-text-xs tracking-[0.08em]">Mirror X</span>}
            checked={params.mirrorX}
            onChange={(next) => onParamChange('mirrorX', next)}
          />
          <ToggleCheckbox
            label={<span className="kol-mono-text-xs tracking-[0.08em]">Mirror Y</span>}
            checked={params.mirrorY}
            onChange={(next) => onParamChange('mirrorY', next)}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="control-heading">SYMMETRICAL EDITING</h2>
        <div className="grid grid-cols-3 gap-3">
          <ToggleCheckbox
            label={<span className="kol-mono-xs tracking-[0.08em]">On</span>}
            checked={ui.symmetricEdit}
            onChange={(next) => onUiToggle('symmetricEdit', next)}
          />
          <ToggleCheckbox
            label={<span className="kol-mono-xs tracking-[0.08em]">Handles</span>}
            checked={ui.symmetricalBezier}
            onChange={(next) => onUiToggle('symmetricalBezier', next)}
          />
          <ToggleCheckbox
            label={<span className="kol-mono-xs tracking-[0.08em]">Corners</span>}
            checked={ui.smoothCorners}
            onChange={(next) => onUiToggle('smoothCorners', next)}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="control-heading">ANIMATION</h2>
        <div className="flex items-center gap-3">
          <ToggleCheckbox
            label={<span className="kol-mono-xs tracking-[0.08em]">On</span>}
            checked={ui.animate}
            onChange={(next) => onUiToggle('animate', next)}
          />
          <Slider
            label="Speed"
            min={0.1}
            max={5}
            step={0.1}
            value={ui.animateSpeed}
            onChange={(value) => onUiToggle('animateSpeed', value)}
            variant="minimal"
            className="flex-1"
            formatValue={(value) => `${value.toFixed(1)}×`}
          />
        </div>
      </section>

      <section className="flex items-start gap-8">
        <div className="flex flex-col gap-3 relative flex-1" ref={pathPickerRef}>
          <h2 className="control-heading">PATH COLOR</h2>
          <button
            type="button"
            className="flex items-center gap-2 text-left"
            onClick={(e) => {
              if (e.altKey) {
                onParamChange('pathEnabled', !params.pathEnabled)
              } else {
                setShowPathPicker((prev) => !prev)
              }
            }}
            aria-haspopup="dialog"
            aria-expanded={showPathPicker}
          >
            <span
              className="h-8 w-8 rounded-full border border-auto relative overflow-hidden"
              style={{ backgroundColor: params.pathColor }}
            >
              {!params.pathEnabled && (
                <span
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top right, transparent calc(50% - 1px), #ef4444 calc(50% - 1px), #ef4444 calc(50% + 1px), transparent calc(50% + 1px))'
                  }}
                />
              )}
            </span>
            <span className="kol-mono-xs">
              {params.pathColor.startsWith('rgba')
                ? '#' + params.pathColor.match(/\d+/g).slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('')
                : params.pathColor}
            </span>
          </button>
          {showPathPicker && (
            <div className="absolute left-0 bottom-full z-20 mb-2">
              <SketchPicker
                color={params.pathColor}
                presetColors={[]}
                styles={{
                  default: {
                    picker: {
                      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
                      borderRadius: '12px',
                      padding: '10px',
                      background: 'var(--kol-surface-primary)',
                    },
                  },
                }}
                onChange={(color) => {
                  const rgba = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`
                  onParamChange('pathColor', rgba)
                }}
                className="sketch-only-spectrum"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 relative flex-1" ref={fillPickerRef}>
          <h2 className="control-heading">FILL COLOR</h2>
          <button
            type="button"
            className="flex items-center gap-2 text-left"
            onClick={(e) => {
              if (e.altKey) {
                onParamChange('fillEnabled', !params.fillEnabled)
              } else {
                setShowFillPicker((prev) => !prev)
              }
            }}
            aria-haspopup="dialog"
            aria-expanded={showFillPicker}
          >
            <span
              className="h-8 w-8 rounded-full border border-auto relative overflow-hidden"
              style={{ backgroundColor: params.fillColor }}
            >
              {!params.fillEnabled && (
                <span
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top right, transparent calc(50% - 1px), #ef4444 calc(50% - 1px), #ef4444 calc(50% + 1px), transparent calc(50% + 1px))'
                  }}
                />
              )}
            </span>
            <span className="kol-mono-xs">
              {params.fillColor.startsWith('rgba')
                ? '#' + params.fillColor.match(/\d+/g).slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('')
                : params.fillColor}
            </span>
          </button>
          {showFillPicker && (
            <div className="absolute left-0 bottom-full z-20 mb-2">
              <SketchPicker
                color={params.fillColor}
                presetColors={[]}
                styles={{
                  default: {
                    picker: {
                      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
                      borderRadius: '12px',
                      padding: '10px',
                      background: 'var(--kol-surface-primary)',
                    },
                  },
                }}
                onChange={(color) => {
                  const rgba = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`
                  onParamChange('fillColor', rgba)
                }}
                className="sketch-only-spectrum"
              />
            </div>
          )}
        </div>
      </section>
    </aside>
  )
}

export default WavyCircleControls
