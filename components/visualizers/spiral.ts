import type { DrawContext } from '@/components/visualizers/types'
import { applySensitivity, getAverageFrequency } from './utils'

export const drawSpiral = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const centerX = width / 2
  const centerY = height / 2
  const avgFrequency = getAverageFrequency(data, sensitivity)
  const baseRadius = Math.min(width, height) * 0.4
  const rotations = 3 + (avgFrequency * 2) // Dynamic number of rotations
  const angleStep = (Math.PI * 2) / data.length
  const spiralLayers = 3

  // Clear canvas with solid background
  ctx.fillStyle = scheme.background || '#000000'
  ctx.fillRect(0, 0, width, height)

  // Draw multiple spiral layers
  for (let layer = spiralLayers - 1; layer >= 0; layer--) {
    const layerOffset = layer * (Math.PI / 6) // Offset each layer by 30 degrees
    const points: [number, number][] = []
    
    // Calculate spiral points with enhanced sensitivity
    for (let i = 0; i < data.length; i++) {
      const normalizedValue = applySensitivity(data[i], sensitivity)
      const angle = (i * angleStep * rotations) + layerOffset
      const progress = i / data.length
      
      // Dynamic radius calculation based on both progress and frequency
      const radius = (baseRadius * progress) * (0.8 + normalizedValue * 0.4)
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      points.push([x, y])
    }

    // Draw spiral path with smooth curves
    ctx.beginPath()
    points.forEach(([x, y], i) => {
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        const [prevX, prevY] = points[i - 1]
        const xc = (prevX + x) / 2
        const yc = (prevY + y) / 2
        ctx.quadraticCurveTo(prevX, prevY, xc, yc)
      }
    })

    // Create dynamic gradient based on layer and frequency
    const gradient = ctx.createLinearGradient(
      centerX - baseRadius,
      centerY - baseRadius,
      centerX + baseRadius,
      centerY + baseRadius
    )
    
    scheme.colors.forEach((color, index) => {
      const alpha = Math.floor((0.7 - (layer * 0.2)) * 255).toString(16).padStart(2, '0')
      gradient.addColorStop(index / (scheme.colors.length - 1), `${color}${alpha}`)
    })

    // Apply enhanced glow effect based on average frequency
    if (avgFrequency > 0.4) {
      ctx.shadowColor = scheme.colors[0]
      ctx.shadowBlur = 15 * (avgFrequency * 1.5)
    }

    // Draw spiral with dynamic width
    ctx.strokeStyle = gradient
    ctx.lineWidth = 2 + (avgFrequency * 3)
    ctx.stroke()

    // Reset shadow for next layer
    ctx.shadowBlur = 0

    // Draw connecting lines between layers
    if (layer > 0 && points.length > 0) {
      const nextLayerAngle = ((layer - 1) * Math.PI) / 6
      const nextLayerRadius = (baseRadius * 0.2) * (0.8 + avgFrequency * 0.4)
      const nextX = centerX + Math.cos(nextLayerAngle) * nextLayerRadius
      const nextY = centerY + Math.sin(nextLayerAngle) * nextLayerRadius
      
      ctx.beginPath()
      ctx.moveTo(points[0][0], points[0][1])
      ctx.lineTo(nextX, nextY)
      
      const lineGradient = ctx.createLinearGradient(
        points[0][0], points[0][1],
        nextX, nextY
      )
      scheme.colors.forEach((color, index) => {
        const alpha = Math.floor(0.4 * 255).toString(16).padStart(2, '0')
        lineGradient.addColorStop(index / (scheme.colors.length - 1), `${color}${alpha}`)
      })
      
      ctx.strokeStyle = lineGradient
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }
} 