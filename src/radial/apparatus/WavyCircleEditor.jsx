import WavyCircleCanvas from './WavyCircleCanvas'
import WavyCircleControls from './WavyCircleControls'
import { useWavyCircleEditor } from './useWavyCircleEditor'

const WavyCircleEditor = () => {
  const {
    params,
    ui,
    nodes,
    pathData,
    stats,
    svgRef,
    handleParamChange,
    handleUiToggle,
    handleMouseDown,
    handleMouseMove,
    resetDrag,
    exportSvg,
    copyPath
  } = useWavyCircleEditor()

  return (
    <div className="flex flex-row h-full max-h-screen w-full overflow-hidden text-auto">
      <div className="flex w-full flex-1 p-4 overflow-hidden">
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
        />
      </div>
      <WavyCircleControls
        params={params}
        ui={ui}
        stats={stats}
        onParamChange={handleParamChange}
        onUiToggle={handleUiToggle}
        onExportSvg={exportSvg}
        onCopyPath={copyPath}
      />
    </div>
  )
}

export default WavyCircleEditor
