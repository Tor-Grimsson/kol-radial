import { useEffect, useRef, useState } from 'react'
import { SketchPicker } from 'react-color'
import { Button, Slider, ToggleCheckbox } from '../../components/atoms'

const shapeOptions = [
  { value: 'circle', label: 'Circle' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'star', label: 'Star' },
  { value: 'hexagon', label: 'Hexagon' }
]

const WavyCircleControls = ({
  params,
  ui,
  stats,
  onParamChange,
  onUiToggle,
  onExportSvg,
  onCopyPath
}) => {
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPicker && pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPicker])

  return (
    <aside className="flex w-[360px] flex-col gap-8 p-6 border-l border-auto bg-fg-02">
      <section className="flex flex-col gap-4">
        <h2 className="control-heading">Wave Parameters</h2>
        <Slider
          label="Radius"
          min={50}
          max={200}
          value={params.radius}
          step={1}
          onChange={(value) => onParamChange('radius', value)}
          variant="minimal"
          className="w-full"
        />
        <Slider
          label="Amplitude (±)"
          min={-50}
          max={50}
          value={params.amplitude}
          step={1}
          onChange={(value) => onParamChange('amplitude', value)}
          variant="minimal"
          className="w-full"
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
        />
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
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="control-heading">Visualization</h2>
        <div className="flex flex-wrap items-center gap-4">
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
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="control-heading">Editing</div>
        <div className="flex flex-wrap items-center gap-3">
          <ToggleCheckbox
            label={<span className="kol-mono-xs tracking-[0.08em]">Symmetric Editing</span>}
            checked={ui.symmetricEdit}
            onChange={(next) => onUiToggle('symmetricEdit', next)}
          />
          <ToggleCheckbox
            label={<span className="kol-mono-xs tracking-[0.08em]">Symmetrical Handles</span>}
            checked={ui.symmetricalBezier}
            onChange={(next) => onUiToggle('symmetricalBezier', next)}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="control-heading">Appearance</h2>

        <div className="flex flex-col gap-3 relative" ref={pickerRef}>
          <label className="control-label">Path Color</label>
          <button
            type="button"
            className="flex items-center gap-3 rounded border border-auto bg-[var(--kol-surface-primary)] px-3 py-2 text-left"
            onClick={() => setShowPicker((prev) => !prev)}
            aria-haspopup="dialog"
            aria-expanded={showPicker}
          >
            <span
              className="h-6 w-6 rounded-full border border-auto"
              style={{ backgroundColor: params.pathColor }}
            />
            <span className="kol-mono-text-xs">{params.pathColor}</span>
          </button>
          {showPicker && (
            <div className="absolute left-0 z-20 mt-2">
              <SketchPicker
                color={params.pathColor}
                disableAlpha
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
                onChange={(color) => onParamChange('pathColor', color.hex)}
                className="sketch-only-spectrum"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <label className="control-label">Base Shape</label>
          <div className="flex flex-wrap gap-2">
            {shapeOptions.map((option) => {
              const isActive = params.shape === option.value
              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => onParamChange('shape', option.value)}
                  className={`kol-mono-xs rounded-full border px-3 py-1 transition ${
                    isActive
                      ? 'border-[var(--kol-accent-primary)] bg-[var(--kol-accent-primary)] text-[var(--kol-surface-primary)]'
                      : 'border-auto text-[var(--kol-surface-on-primary)] hover:border-[var(--kol-border-strong)]'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="control-heading">Statistics</h2>
        <div className="kol-mono-xs flex flex-col gap-1 rounded border border-auto bg-[var(--kol-container-primary)] p-3">
          <div>
            <span className="kol-mono-xs uppercase tracking-[0.06em]">Nodes:</span> {stats.nodeCount}
          </div>
          <div>
            <span className="kol-mono-xs uppercase tracking-[0.06em]">Control Points:</span> {stats.handleCount}
          </div>
          <div>
            <span className="kol-mono-xs uppercase tracking-[0.06em]">Optimality:</span> {stats.optimality}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={onExportSvg}>
            Download SVG
          </Button>
          <Button variant="outline" size="sm" onClick={onCopyPath}>
            Copy Path
          </Button>
        </div>
      </section>
    </aside>
  )
}

export default WavyCircleControls
