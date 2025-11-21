export const CANVAS_SIZE = 800
export const CANVAS_CENTER = { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 }

export const defaultParams = {
  radius: 120,
  amplitude: 25,
  frequency: 5,
  zoom: 1,
  strokeWidth: 2,
  pathColor: '#ffffff',
  shape: 'circle'
}

export const defaultUI = {
  showGrid: true,
  showNodes: true,
  showHandles: true,
  symmetricEdit: false,
  symmetricalBezier: true
}

export const smoothDragScale = 0.01

const shapeProfiles = {
  circle: () => 0,
  triangle: (theta) => Math.cos(3 * theta),
  rectangle: (theta) => Math.cos(4 * theta),
  star: (theta) => Math.cos(5 * theta),
  hexagon: (theta) => Math.cos(6 * theta)
}

const shapeBiases = {
  circle: 0,
  triangle: 0.18,
  rectangle: 0.2,
  star: 0.25,
  hexagon: 0.22
}

const polygonRadius = (theta, radius, sides) => {
  const segment = (2 * Math.PI) / sides
  const halfSegment = segment / 2
  const adjusted = ((theta + halfSegment) % segment) - halfSegment
  const denom = Math.cos(adjusted)
  const safeDenom = Math.max(denom, 0.01)
  return radius * Math.cos(halfSegment) / safeDenom
}

const starRadius = (theta, radius) => {
  const spikes = 5
  const segment = (2 * Math.PI) / (spikes * 2)
  const offset = ((theta + segment / 2) % (2 * segment))
  const index = Math.floor(offset / segment)
  const innerRadius = radius * 0.4
  const start = index % 2 === 0 ? radius : innerRadius
  const end = (index + 1) % 2 === 0 ? radius : innerRadius
  const t = ((offset % segment) + segment) % segment / segment
  return start + (end - start) * t
}

const getShapeRadius = (theta, radius, shape) => {
  switch (shape) {
    case 'triangle':
      return polygonRadius(theta, radius, 3)
    case 'rectangle':
      return polygonRadius(theta, radius, 4)
    case 'hexagon':
      return polygonRadius(theta, radius, 6)
    case 'star':
      return starRadius(theta, radius)
    default:
      return radius
  }
}

export const calculateOptimalNodes = ({ radius, amplitude, frequency, shape }) => {
  const totalNodes = frequency * 4
  const generatedNodes = []

  for (let index = 0; index < totalNodes; index += 1) {
    const theta = (index / totalNodes) * Math.PI * 2
    const wavePhase = frequency * theta
    const shapeRadius = getShapeRadius(theta, radius, shape)
    const r = shapeRadius + amplitude * Math.sin(wavePhase)
    const x = CANVAS_CENTER.x + r * Math.cos(theta)
    const y = CANVAS_CENTER.y + r * Math.sin(theta)

    const drByTheta = amplitude * frequency * Math.cos(wavePhase)
    const tangentRadius = drByTheta
    const tangentTheta = r
    const tx = tangentRadius * Math.cos(theta) - tangentTheta * Math.sin(theta)
    const ty = tangentRadius * Math.sin(theta) + tangentTheta * Math.cos(theta)
    const tangentMagnitude = Math.sqrt(tx * tx + ty * ty) || 1
    const normalizedTx = tx / tangentMagnitude
    const normalizedTy = ty / tangentMagnitude
    const handleLength = (2 * Math.PI * r) / (totalNodes * 3)

    generatedNodes.push({
      x,
      y,
      theta,
      handle1: {
        x: x - normalizedTx * handleLength,
        y: y - normalizedTy * handleLength
      },
      handle2: {
        x: x + normalizedTx * handleLength,
        y: y + normalizedTy * handleLength
      },
      symmetryGroup: index % (totalNodes / frequency)
    })
  }

  return generatedNodes
}

export const generatePathFromNodes = (nodeList) => {
  if (!nodeList.length) return ''

  let pathString = `M ${nodeList[0].x} ${nodeList[0].y}`

  for (let index = 0; index < nodeList.length; index += 1) {
    const current = nodeList[index]
    const next = nodeList[(index + 1) % nodeList.length]
    pathString += ` C ${current.handle2.x} ${current.handle2.y}, ${next.handle1.x} ${next.handle1.y}, ${next.x} ${next.y}`
  }

  return pathString
}

export const getSymmetricSiblings = (nodeIndex, nodeList) => {
  const node = nodeList[nodeIndex]
  return nodeList
    .map((candidate, index) => ({ candidate, index }))
    .filter(({ candidate }) => candidate.symmetryGroup === node.symmetryGroup)
    .map(({ index }) => index)
}
