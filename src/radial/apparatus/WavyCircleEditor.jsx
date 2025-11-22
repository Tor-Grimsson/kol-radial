import WavyCircleCanvas from './WavyCircleCanvas'
import WavyCircleControls from './WavyCircleControls'
import { useWavyCircleEditor } from './useWavyCircleEditor'
import { Button } from '../../components/atoms'

const WavyCircleEditor = () => {
  const {
    params,
    ui,
    nodes,
    pathData,
    stats,
    svgRef,
    paramRanges,
    handleParamChange,
    handleUiToggle,
    toggleAnimateParam,
    animationIntensities,
    handleMouseDown,
    handleMouseMove,
    resetDrag,
    exportSvg,
    copyPath
  } = useWavyCircleEditor()

  const shapeIcons = {
    circle: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="8" />
      </svg>
    ),
    triangle: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4 L20 20 L4 20 Z" />
      </svg>
    ),
    rectangle: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="6" width="12" height="12" />
      </svg>
    ),
    star: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2 L14.5 9.5 L22 10 L16.5 15 L18 22 L12 18 L6 22 L7.5 15 L2 10 L9.5 9.5 Z" />
      </svg>
    ),
    hexagon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2 L20 7 L20 17 L12 22 L4 17 L4 7 Z" />
      </svg>
    ),
    random: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="8" cy="12" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="16" cy="12" r="1.5" />
      </svg>
    ),
    chaos: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="8" cy="8" r="1.5" />
        <circle cx="12" cy="8" r="1.5" />
        <circle cx="16" cy="8" r="1.5" />
        <circle cx="8" cy="12" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="16" cy="12" r="1.5" />
        <circle cx="8" cy="16" r="1.5" />
        <circle cx="12" cy="16" r="1.5" />
        <circle cx="16" cy="16" r="1.5" />
      </svg>
    )
  }

  const shapeOrder = ['circle', 'rectangle', 'triangle', 'star', 'hexagon', 'random', 'chaos']

  const handleRandomShape = () => {
    const randomParams = {
      radius: Math.floor(Math.random() * 150) + 80, // 80-230
      amplitude: Math.floor(Math.random() * 100) - 20, // -20 to 80
      frequency: Math.floor(Math.random() * 10) + 2, // 2-12
      resolution: Math.floor(Math.random() * 12) + 4, // 4-16
      scale: Math.random() * 1.5 + 0.5, // 0.5-2.0
      rotate: Math.floor(Math.random() * 360), // 0-360
      lfoAmount: Math.random() * 8, // 0-8
      lfoFrequency: Math.random() * 10 + 1 // 1-11
    }

    Object.entries(randomParams).forEach(([key, value]) => {
      handleParamChange(key, value)
    })
  }

  const handleChaosShape = () => {
    const chaosParams = {
      radius: Math.floor(Math.random() * 301), // 0-300
      amplitude: Math.floor(Math.random() * 351) - 175, // -175 to 175
      frequency: Math.floor(Math.random() * 9), // 0-8
      resolution: Math.floor(Math.random() * 9), // 0-8
      scale: Math.random() * 3, // 0-3
      rotate: Math.floor(Math.random() * 361), // 0-360
      lfoAmount: Math.random() * 15, // 0-15
      lfoFrequency: Math.random() * 12 // 0-12
    }

    Object.entries(chaosParams).forEach(([key, value]) => {
      handleParamChange(key, value)
    })
  }

  return (
    <div className="flex flex-row h-full max-h-screen w-full overflow-hidden text-auto relative">
      <div className="absolute top-0 left-0 p-8 flex flex-col gap-2 z-20 pointer-events-auto">
        {shapeOrder.map((shape) => (
          <button
            key={shape}
            type="button"
            onClick={() => {
              if (shape === 'random') {
                handleRandomShape()
              } else if (shape === 'chaos') {
                handleChaosShape()
              } else {
                handleParamChange('shape', shape)
              }
            }}
            className={`w-12 h-12 flex items-center justify-center rounded border transition ${
              params.shape === shape && shape !== 'random' && shape !== 'chaos'
                ? 'border-auto bg-[var(--kol-surface-on-primary)] text-[var(--kol-surface-primary)]'
                : 'border-auto text-auto hover:border-[var(--kol-border-strong)]'
            }`}
            style={{ backgroundColor: (params.shape === shape && shape !== 'random' && shape !== 'chaos') ? undefined : '#121215' }}
          >
            {shapeIcons[shape]}
          </button>
        ))}
      </div>
      <div className="flex w-full flex-1 p-4 overflow-hidden relative">
        <WavyCircleCanvas
          svgRef={svgRef}
          params={params}
          ui={ui}
          nodes={nodes}
          pathData={pathData}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={resetDrag}
          onMouseLeave={resetDrag}
          onZoomChange={(newZoom) => handleParamChange('zoom', newZoom)}
        />
        <div className="absolute bottom-0 left-0 p-8 flex flex-col gap-4 z-20 pointer-events-auto">
          <div className="kol-mono-xs flex flex-col gap-1 rounded border border-auto p-3" style={{ backgroundColor: '#121215' }}>
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
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={exportSvg} style={{ backgroundColor: '#121215' }}>
              Download SVG
            </Button>
            <Button variant="outline" size="sm" onClick={copyPath} style={{ backgroundColor: '#121215' }}>
              Copy Path
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 h-full p-8 z-20 pointer-events-auto">
        <WavyCircleControls
          params={params}
          ui={ui}
          paramRanges={paramRanges}
          onParamChange={handleParamChange}
          onUiToggle={handleUiToggle}
          onToggleAnimateParam={toggleAnimateParam}
          animationIntensities={animationIntensities}
        />
      </div>
    </div>
  )
}

export default WavyCircleEditor
