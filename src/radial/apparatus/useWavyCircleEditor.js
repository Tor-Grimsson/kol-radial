import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CANVAS_CENTER,
  CANVAS_SIZE,
  calculateOptimalNodes,
  defaultParams,
  defaultUI,
  generatePathFromNodes,
  getSymmetricSiblings,
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

  const pathData = useMemo(() => generatePathFromNodes(nodes), [nodes])

  const stats = {
    nodeCount: nodes.length,
    handleCount: nodes.length * 2,
    optimality: nodes.length === params.frequency * 4 ? 'Perfect symmetry' : 'Manual tweaks'
  }

  const handleParamChange = (key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  const handleUiToggle = (key, value) => {
    setUi((prev) => ({ ...prev, [key]: value }))
  }

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

  return {
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
  }
}
