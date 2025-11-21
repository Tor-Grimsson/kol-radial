import { useEffect, useRef, useState } from 'react'
import { CANVAS_CENTER, CANVAS_SIZE } from './wavyCircleMath'

const WavyCircleCanvas = ({
  svgRef,
  nodes,
  pathData,
  params,
  ui,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave
}) => {
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const isPanningRef = useRef(false)
  const lastPointerRef = useRef({ x: 0, y: 0, time: performance.now() })
  const velocityRef = useRef({ x: 0, y: 0 })
  const momentumRef = useRef({ frame: null, lastTime: 0, velocity: { x: 0, y: 0 } })
  const [isDragging, setIsDragging] = useState(false)
  const [spaceActive, setSpaceActive] = useState(false)

  const cancelMomentum = () => {
    if (momentumRef.current.frame) {
      cancelAnimationFrame(momentumRef.current.frame)
      momentumRef.current.frame = null
    }
  }

  const startMomentum = () => {
    const { x, y } = velocityRef.current
    if (Math.hypot(x, y) < 0.002) return
    cancelMomentum()

    momentumRef.current.velocity = { x, y }
    momentumRef.current.lastTime = performance.now()

    const step = (time) => {
      const dt = Math.min(time - momentumRef.current.lastTime, 40)
      momentumRef.current.lastTime = time
      const vel = momentumRef.current.velocity
      const deltaX = vel.x * dt
      const deltaY = vel.y * dt
      const nextVelocity = {
        x: vel.x * 0.92,
        y: vel.y * 0.92
      }
      if (Math.hypot(nextVelocity.x, nextVelocity.y) < 0.002) {
        cancelMomentum()
        return
      }

      setPanOffset((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }))
      momentumRef.current.velocity = nextVelocity
      momentumRef.current.frame = requestAnimationFrame(step)
    }

    momentumRef.current.frame = requestAnimationFrame(step)
  }

  const handlePanStart = (event) => {
    isPanningRef.current = true
    cancelMomentum()
    const now = event.timeStamp || performance.now()
    lastPointerRef.current = { x: event.clientX, y: event.clientY, time: now }
    setIsDragging(true)
    event.preventDefault()
  }

  const handlePanMove = (event) => {
    if (!isPanningRef.current) return
    const now = event.timeStamp || performance.now()
    const last = lastPointerRef.current
    const dt = Math.max(now - last.time, 1)
    const dx = event.clientX - last.x
    const dy = event.clientY - last.y
    if (dx === 0 && dy === 0) return

    setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
    velocityRef.current = { x: dx / dt, y: dy / dt }
    lastPointerRef.current = { x: event.clientX, y: event.clientY, time: now }
    event.preventDefault()
  }

  const handlePanEnd = () => {
    if (!isPanningRef.current) return
    isPanningRef.current = false
    startMomentum()
    setIsDragging(false)
  }

  useEffect(() => () => cancelMomentum(), [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space' && !spaceActive) {
        event.preventDefault()
        setSpaceActive(true)
      }
    }

    const handleKeyUp = (event) => {
      if (event.code === 'Space') {
        event.preventDefault()
        setSpaceActive(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [spaceActive])

  const gridSpacing = 32
  const zoom = params.zoom
  const scaledSpacing = gridSpacing * zoom
  const gridColor = 'color-mix(in srgb, var(--kol-surface-on-primary) 18%, transparent)'
  const quadrantStyle = {
    backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
    backgroundSize: `${scaledSpacing}px ${scaledSpacing}px`,
    opacity: 0.16
  }

  const isInteractiveTarget = (target) => {
    if (!target || typeof target.closest !== 'function') return false
    return target.closest('.wavy-node, .wavy-handle')
  }

  const handleEditorMouseDown = (event) => {
    const wantsPan = spaceActive || (event.getModifierState && event.getModifierState('Space'))
    if (wantsPan && !isInteractiveTarget(event.target)) {
      handlePanStart(event)
    }
    if (typeof onMouseDown === 'function') {
      onMouseDown(event)
    }
  }

  const handleEditorMouseMove = (event) => {
    handlePanMove(event)
    if (typeof onMouseMove === 'function') {
      onMouseMove(event)
    }
  }

  const handleEditorMouseUp = (event) => {
    handlePanEnd()
    if (typeof onMouseUp === 'function') {
      onMouseUp(event)
    }
  }

  const handleEditorMouseLeave = (event) => {
    handlePanEnd()
    if (typeof onMouseLeave === 'function') {
      onMouseLeave(event)
    }
  }

  return (
    <div className="relative flex h-full min-h-0 flex-1 bg-surface-primary lg:order-1">
      {ui.showGrid && (
        <div className="pointer-events-none absolute inset-0 z-0">
          <div
            className="absolute top-0 left-0 h-1/2 w-1/2"
            style={{ ...quadrantStyle, backgroundPosition: 'bottom right' }}
          />
          <div
            className="absolute top-0 right-0 h-1/2 w-1/2"
            style={{ ...quadrantStyle, backgroundPosition: 'bottom left' }}
          />
          <div
            className="absolute bottom-0 left-0 h-1/2 w-1/2"
            style={{ ...quadrantStyle, backgroundPosition: 'top right' }}
          />
          <div
            className="absolute bottom-0 right-0 h-1/2 w-1/2"
            style={{ ...quadrantStyle, backgroundPosition: 'top left' }}
          />
        </div>
      )}


      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          className={`h-full w-full border border-auto ${isDragging ? 'cursor-grabbing' : spaceActive ? 'cursor-grab' : 'cursor-auto'}`}
          onMouseDown={handleEditorMouseDown}
          onMouseMove={handleEditorMouseMove}
          onMouseUp={handleEditorMouseUp}
          onMouseLeave={handleEditorMouseLeave}
        >
          {ui.showGrid && (
            <g
              id="axesGroup"
              transform={`translate(${CANVAS_CENTER.x * (1 - params.zoom)}, ${CANVAS_CENTER.y * (1 - params.zoom)}) scale(${params.zoom}) translate(${panOffset.x}, ${panOffset.y})`}
            >
              <line
                x1={-CANVAS_SIZE}
                y1={CANVAS_CENTER.y}
                  x2={CANVAS_SIZE * 2}
                  y2={CANVAS_CENTER.y}
                  stroke="var(--kol-border-strong)"
                  strokeWidth={1}
                />
                <line
                  x1={CANVAS_CENTER.x}
                  y1={-CANVAS_SIZE}
                  x2={CANVAS_CENTER.x}
                  y2={CANVAS_SIZE * 2}
                  stroke="var(--kol-border-strong)"
                  strokeWidth={1}
                />
            </g>
          )}

            <g
              id="pathGroup"
              transform={`translate(${CANVAS_CENTER.x * (1 - params.zoom)}, ${CANVAS_CENTER.y * (1 - params.zoom)}) scale(${params.zoom}) translate(${panOffset.x}, ${panOffset.y})`}
            >
              <path d={pathData} fill="none" stroke={params.pathColor} strokeWidth={params.strokeWidth} />
            </g>

          <g
            id="handlesGroup"
            transform={`translate(${CANVAS_CENTER.x * (1 - params.zoom)}, ${CANVAS_CENTER.y * (1 - params.zoom)}) scale(${params.zoom}) translate(${panOffset.x}, ${panOffset.y})`}
          >
            {ui.showHandles &&
              ui.showNodes &&
              nodes.map((node, index) => (
                <g key={`handle-${index}`}>
                  <line
                    x1={node.x}
                    y1={node.y}
                    x2={node.handle1.x}
                    y2={node.handle1.y}
                    stroke="var(--kol-border-strong)"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                  <line
                    x1={node.x}
                    y1={node.y}
                    x2={node.handle2.x}
                    y2={node.handle2.y}
                    stroke="var(--kol-border-strong)"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={node.handle1.x}
                    cy={node.handle1.y}
                    r="4"
                    className="wavy-handle cursor-move"
                    data-node-index={index}
                    data-handle-type="handle1"
                    fill="var(--kol-accent-primary-muted)"
                    stroke="var(--kol-surface-on-primary)"
                    strokeWidth={1.5}
                  />
                  <circle
                    cx={node.handle2.x}
                    cy={node.handle2.y}
                    r="4"
                    className="wavy-handle cursor-move"
                    data-node-index={index}
                    data-handle-type="handle2"
                    fill="var(--kol-accent-primary-muted)"
                    stroke="var(--kol-surface-on-primary)"
                    strokeWidth={1.5}
                  />
                </g>
              ))}
          </g>

          <g
            id="nodesGroup"
            transform={`translate(${CANVAS_CENTER.x * (1 - params.zoom)}, ${CANVAS_CENTER.y * (1 - params.zoom)}) scale(${params.zoom}) translate(${panOffset.x}, ${panOffset.y})`}
          >
            {ui.showNodes &&
              nodes.map((node, index) => (
                <circle
                  key={`node-${index}`}
                  cx={node.x}
                  cy={node.y}
                  r="5"
                  className="wavy-node cursor-move"
                  data-node-index={index}
                  fill="var(--kol-surface-primary)"
                  stroke="var(--kol-surface-on-primary)"
                  strokeWidth={2}
                />
              ))}
          </g>
        </svg>
      </div>
    </div>
  )
}

export default WavyCircleCanvas
