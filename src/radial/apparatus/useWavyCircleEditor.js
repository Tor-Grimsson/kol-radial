import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
  CANVAS_CENTER,
  CANVAS_SIZE,
  calculateOptimalNodes,
  defaultParams,
  defaultUI,
  generatePathFromNodes,
  getSymmetricSiblings,
  shapePresets,
  smoothDragScale
} from './wavyCircleMath'

export const useWavyCircleEditor = () => {
  const [params, setParams] = useState(defaultParams)
  const [ui, setUi] = useState(defaultUI)
  const [nodes, setNodes] = useState(() => calculateOptimalNodes(defaultParams))
  const [draggingIndex, setDraggingIndex] = useState(null)
  const [dragType, setDragType] = useState(null)
  const [mouseStart, setMouseStart] = useState(null)
  const [nodeStart, setNodeStart] = useState(null)
  const svgRef = useRef(null)

  useEffect(() => {
    if (!ui.symmetricEdit) {
      setNodes(calculateOptimalNodes(params))
    }
  }, [params, ui.symmetricEdit])

  const pathData = useMemo(() => generatePathFromNodes(nodes, ui.smoothCorners), [nodes, ui.smoothCorners])

  const stats = {
    nodeCount: nodes.length,
    handleCount: nodes.length * 2,
    optimality: nodes.length === params.frequency * 4 ? 'Perfect symmetry' : 'Manual tweaks'
  }

  const handleParamChange = (key, value) => {
    if (key === 'shape' && shapePresets[value]) {
      const preset = shapePresets[value]
      setParams({
        ...defaultParams,
        shape: value,
        radius: preset.radius,
        amplitude: preset.amplitude,
        frequency: preset.frequency,
        resolution: preset.resolution !== undefined ? preset.resolution : defaultParams.resolution,
        scale: preset.scale,
        rotate: preset.rotate !== undefined ? preset.rotate : defaultParams.rotate
      })
    } else {
      setParams((prev) => ({ ...prev, [key]: value }))
      // Update animation offset when user manually changes an animated parameter
      if (ui.animatedParams.includes(key)) {
        animationOffsetsRef.current[key] = value
      }
    }
  }

  const paramRanges = useMemo(() => {
    const preset = shapePresets[params.shape]
    if (preset) {
      return preset.ranges
    }
    return {
      radius: { min: 50, max: 200 },
      amplitude: { min: -50, max: 50 }
    }
  }, [params.shape])

  const handleUiToggle = (key, value) => {
    setUi((prev) => ({ ...prev, [key]: value }))
  }

  const toggleAnimateParam = useCallback((paramName) => {
    setUi((prev) => {
      const isAnimated = prev.animatedParams.includes(paramName)
      return {
        ...prev,
        animatedParams: isAnimated
          ? prev.animatedParams.filter(p => p !== paramName)
          : [...prev.animatedParams, paramName]
      }
    })
  }, [])

  const handleMouseDown = (event) => {
    if (!ui.symmetricEdit) return

    const target = event.target

    if (target.classList.contains('wavy-node')) {
      const nodeIndex = parseInt(target.dataset.nodeIndex, 10)
      setDraggingIndex(nodeIndex)
      setDragType('node')
      setMouseStart({ x: event.clientX, y: event.clientY })
      setNodeStart({ x: nodes[nodeIndex].x, y: nodes[nodeIndex].y })
      event.preventDefault()
      return
    }

    if (target.classList.contains('wavy-handle')) {
      const nodeIndex = parseInt(target.dataset.nodeIndex, 10)
      const handleType = target.dataset.handleType
      setDraggingIndex(nodeIndex)
      setDragType(handleType)
      setMouseStart({ x: event.clientX, y: event.clientY })
      setNodeStart({
        x: nodes[nodeIndex][handleType].x,
        y: nodes[nodeIndex][handleType].y
      })
      event.preventDefault()
    }
  }

  const handleMouseMove = (event) => {
    if (draggingIndex === null || !dragType) return
    if (!mouseStart || !nodeStart) return

    const dx = event.clientX - mouseStart.x
    const dy = event.clientY - mouseStart.y
    const updatedNodes = [...nodes]
    const siblings = getSymmetricSiblings(draggingIndex, updatedNodes)

    siblings.forEach((siblingIndex) => {
      const sibling = updatedNodes[siblingIndex]
      const currentAngle = Math.atan2(sibling.y - CANVAS_CENTER.y, sibling.x - CANVAS_CENTER.x)
      const baseAngle = Math.atan2(nodeStart.y - CANVAS_CENTER.y, nodeStart.x - CANVAS_CENTER.x)
      const angleDifference = currentAngle - baseAngle
      const rotatedDx = dx * Math.cos(angleDifference) - dy * Math.sin(angleDifference)
      const rotatedDy = dx * Math.sin(angleDifference) + dy * Math.cos(angleDifference)

      if (dragType === 'node') {
        sibling.x += rotatedDx * smoothDragScale
        sibling.y += rotatedDy * smoothDragScale
        sibling.handle1.x += rotatedDx * smoothDragScale
        sibling.handle1.y += rotatedDy * smoothDragScale
        sibling.handle2.x += rotatedDx * smoothDragScale
        sibling.handle2.y += rotatedDy * smoothDragScale
      } else {
        sibling[dragType].x += rotatedDx * smoothDragScale
        sibling[dragType].y += rotatedDy * smoothDragScale

        if (ui.symmetricalBezier) {
          const opposite = dragType === 'handle1' ? 'handle2' : 'handle1'
          const handleDx = sibling[dragType].x - sibling.x
          const handleDy = sibling[dragType].y - sibling.y
          sibling[opposite].x = sibling.x - handleDx
          sibling[opposite].y = sibling.y - handleDy
        }
      }
    })

    setNodes(updatedNodes)
  }

  const resetDrag = () => {
    setDraggingIndex(null)
    setDragType(null)
    setMouseStart(null)
    setNodeStart(null)
  }

  const exportSvg = () => {
    if (!svgRef.current) return

    const clone = svgRef.current.cloneNode(true)
    clone.querySelector('#nodesGroup')?.remove()
    clone.querySelector('#handlesGroup')?.remove()
    clone.querySelector('#gridGroup')?.remove()
    clone.querySelector('#labelsGroup')?.remove()
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    clone.setAttribute('viewBox', `0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`)

    const svgData = new XMLSerializer().serializeToString(clone)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'wavy_circle.svg'
    link.click()
    URL.revokeObjectURL(url)
  }

  const copyPath = async () => {
    if (!navigator?.clipboard) return

    try {
      await navigator.clipboard.writeText(pathData)
    } catch (error) {
      console.warn('Unable to copy path', error)
    }
  }

  // Track animation intensities for visual feedback
  const [animationIntensities, setAnimationIntensities] = useState({})
  const animationOffsetsRef = useRef({})

  // Animation loop
  useEffect(() => {
    if (!ui.animate || ui.animatedParams.length === 0) return

    const animationStartTime = performance.now()
    let animationFrame

    const animate = (currentTime) => {
      const elapsed = (currentTime - animationStartTime) / 1000 // convert to seconds
      const speed = ui.animateSpeed
      const newIntensities = {}

      setParams((prev) => {
        const updates = { ...prev }

        if (ui.animatedParams.includes('radius')) {
          const range = paramRanges.radius
          const offset = animationOffsetsRef.current.radius ?? ((range.min + range.max) / 2)
          const amplitude = (range.max - range.min) / 4
          updates.radius = offset + Math.sin(elapsed * speed * 0.4) * amplitude
          newIntensities.radius = Math.abs(Math.sin(elapsed * speed * 0.4))
        }

        if (ui.animatedParams.includes('amplitude')) {
          const range = paramRanges.amplitude
          const offset = animationOffsetsRef.current.amplitude ?? ((range.min + range.max) / 2)
          const amp = (range.max - range.min) / 4
          updates.amplitude = offset + Math.sin(elapsed * speed * 0.3) * amp
          newIntensities.amplitude = Math.abs(Math.sin(elapsed * speed * 0.3))
        }

        if (ui.animatedParams.includes('scale')) {
          const offset = animationOffsetsRef.current.scale ?? 1
          updates.scale = offset + Math.sin(elapsed * speed * 0.5) * 0.3
          newIntensities.scale = Math.abs(Math.sin(elapsed * speed * 0.5))
        }

        if (ui.animatedParams.includes('rotate')) {
          const startRotate = animationOffsetsRef.current.rotate ?? 0
          updates.rotate = (startRotate + speed * elapsed * 30) % 360
          newIntensities.rotate = Math.abs(Math.sin(elapsed * speed * 2)) // fast pulse
        }

        if (ui.animatedParams.includes('frequency')) {
          const offset = animationOffsetsRef.current.frequency ?? 6
          updates.frequency = Math.round(offset + Math.sin(elapsed * speed * 0.2) * 3)
          newIntensities.frequency = Math.abs(Math.sin(elapsed * speed * 0.2))
        }

        if (ui.animatedParams.includes('resolution')) {
          const offset = animationOffsetsRef.current.resolution ?? 8
          updates.resolution = Math.round(offset + Math.sin(elapsed * speed * 0.25) * 4)
          newIntensities.resolution = Math.abs(Math.sin(elapsed * speed * 0.25))
        }

        if (ui.animatedParams.includes('lfoAmount')) {
          const offset = animationOffsetsRef.current.lfoAmount ?? 5
          updates.lfoAmount = offset + Math.sin(elapsed * speed * 0.5) * 5
          newIntensities.lfoAmount = Math.abs(Math.sin(elapsed * speed * 0.5))
        }

        if (ui.animatedParams.includes('lfoFrequency')) {
          const offset = animationOffsetsRef.current.lfoFrequency ?? 6
          updates.lfoFrequency = offset + Math.sin(elapsed * speed * 0.3) * 3
          newIntensities.lfoFrequency = Math.abs(Math.sin(elapsed * speed * 0.3))
        }

        if (ui.animatedParams.includes('zoom')) {
          const offset = animationOffsetsRef.current.zoom ?? 1
          updates.zoom = offset + Math.sin(elapsed * speed * 0.3) * 0.2
          newIntensities.zoom = Math.abs(Math.sin(elapsed * speed * 0.3))
        }

        if (ui.animatedParams.includes('strokeWidth')) {
          const offset = animationOffsetsRef.current.strokeWidth ?? 2
          updates.strokeWidth = offset + Math.sin(elapsed * speed * 0.4) * 1
          newIntensities.strokeWidth = Math.abs(Math.sin(elapsed * speed * 0.4))
        }

        return updates
      })

      setAnimationIntensities(newIntensities)
      animationFrame = requestAnimationFrame(animate)
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      setAnimationIntensities({})
    }
  }, [ui.animate, ui.animateSpeed, ui.animatedParams, paramRanges])

  return {
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
  }
}
