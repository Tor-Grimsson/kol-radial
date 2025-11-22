export const CANVAS_SIZE = 800
export const CANVAS_CENTER = { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 }

export const defaultParams = {
  radius: 120,
  amplitude: 25,
  frequency: 5,
  resolution: 4,
  lfoAmount: 0,
  lfoFrequency: 2,
  lfoSync: false,
  lfoSymmetryX: false,
  lfoSymmetryY: false,
  lfoWaveType: 'sine',
  mirrorX: false,
  mirrorY: false,
  scale: 1,
  zoom: 1,
  rotate: 0,
  strokeWidth: 2,
  pathColor: '#ffffff',
  pathEnabled: true,
  fillColor: '#ffffff',
  fillEnabled: false,
  shape: 'circle'
}

export const shapePresets = {
  circle: {
    radius: 120,
    amplitude: 25,
    frequency: 5,
    scale: 1,
    ranges: {
      radius: { min: 50, max: 200 },
      amplitude: { min: -50, max: 50 }
    }
  },
  rectangle: {
    radius: 128,
    amplitude: 20,
    frequency: 4,
    resolution: 8,
    scale: 1,
    rotate: 22,
    ranges: {
      radius: { min: 80, max: 200 },
      amplitude: { min: -50, max: 50 }
    }
  },
  triangle: {
    radius: 200,
    amplitude: 100,
    frequency: 3,
    scale: 0.7,
    ranges: {
      radius: { min: 100, max: 300 },
      amplitude: { min: 50, max: 150 }
    }
  },
  star: {
    radius: 160,
    amplitude: 70,
    frequency: 8,
    scale: 1,
    ranges: {
      radius: { min: 100, max: 250 },
      amplitude: { min: 40, max: 100 }
    }
  },
  hexagon: {
    radius: 200,
    amplitude: 15,
    frequency: 6,
    resolution: 8,
    scale: 0.8,
    rotate: 15,
    ranges: {
      radius: { min: 120, max: 280 },
      amplitude: { min: -30, max: 40 }
    }
  }
}

export const defaultUI = {
  showGrid: true,
  showNodes: true,
  showHandles: true,
  symmetricEdit: false,
  symmetricalBezier: true,
  smoothCorners: true,
  animate: false,
  animateSpeed: 1,
  animatedParams: []
}

export const smoothDragScale = 0.01

const getLfoValue = (phase, waveType) => {
  switch (waveType) {
    case 'sine':
      return Math.sin(phase)
    case 'triangle':
      return (2 / Math.PI) * Math.asin(Math.sin(phase))
    case 'square':
      return Math.sin(phase) >= 0 ? 1 : -1
    case 'random':
      // Use phase as seed for consistent random values
      const seed = Math.floor(phase / (Math.PI / 4))
      return (Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453) % 2 - 1
    default:
      return Math.sin(phase)
  }
}

export const calculateOptimalNodes = ({ radius, amplitude, frequency, resolution, lfoAmount, lfoFrequency, lfoSync, lfoSymmetryX, lfoSymmetryY, lfoWaveType, mirrorX, mirrorY, shape }) => {
  const totalNodes = frequency * resolution
  const generatedNodes = []

  // When sync is enabled, snap LFO frequency to ratios of main frequency
  const syncedLfoFreq = lfoSync ? Math.round(lfoFrequency) : lfoFrequency

  for (let index = 0; index < totalNodes; index += 1) {
    const theta = (index / totalNodes) * Math.PI * 2

    // Apply symmetry by using absolute values of sin/cos for X/Y
    let lfoPhase = syncedLfoFreq * theta
    if (lfoSymmetryX || lfoSymmetryY) {
      const x = Math.cos(theta)
      const y = Math.sin(theta)
      const symX = lfoSymmetryX ? Math.abs(x) : x
      const symY = lfoSymmetryY ? Math.abs(y) : y
      const symTheta = Math.atan2(symY, symX)
      lfoPhase = syncedLfoFreq * symTheta
    }

    const lfoValue = getLfoValue(lfoPhase, lfoWaveType)
    const frequencyMod = frequency + lfoAmount * lfoValue

    // Apply mirror symmetry to the wave calculation
    let mirrorTheta = theta
    if (mirrorX && mirrorY) {
      // Both axes: 4-way symmetry
      const quadrant = Math.floor((theta / (Math.PI / 2)) % 4)
      const baseTheta = theta % (Math.PI / 2)
      mirrorTheta = quadrant % 2 === 0 ? baseTheta : (Math.PI / 2) - baseTheta
    } else if (mirrorX) {
      // X-axis symmetry: mirror left/right
      const half = Math.floor((theta / Math.PI) % 2)
      const baseTheta = theta % Math.PI
      mirrorTheta = half === 0 ? baseTheta : (Math.PI * 2) - baseTheta
    } else if (mirrorY) {
      // Y-axis symmetry: mirror top/bottom
      const half = Math.floor((theta / Math.PI) % 2)
      mirrorTheta = half === 0 ? theta : (Math.PI * 2) - theta
    }

    const wavePhase = frequencyMod * mirrorTheta
    const r = radius + amplitude * Math.sin(wavePhase)
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

export const generatePathFromNodes = (nodeList, smoothCorners = true) => {
  if (!nodeList.length) return ''

  let pathString = `M ${nodeList[0].x} ${nodeList[0].y}`

  if (smoothCorners) {
    for (let index = 0; index < nodeList.length; index += 1) {
      const current = nodeList[index]
      const next = nodeList[(index + 1) % nodeList.length]
      pathString += ` C ${current.handle2.x} ${current.handle2.y}, ${next.handle1.x} ${next.handle1.y}, ${next.x} ${next.y}`
    }
  } else {
    for (let index = 0; index < nodeList.length; index += 1) {
      const next = nodeList[(index + 1) % nodeList.length]
      pathString += ` L ${next.x} ${next.y}`
    }
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
