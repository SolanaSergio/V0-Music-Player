import type { DrawContext } from '@/components/visualizers/types'
import { applySensitivity, getAverageFrequency } from './utils'

interface TerrainPoint {
  x: number
  y: number
  height: number
}

export const drawTerrain = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const points: TerrainPoint[] = []
  const segments = 50 // Reduced for smoother curves
  const segmentWidth = width / segments
  const avgFrequency = getAverageFrequency(data, sensitivity)
  const baseHeight = height * 0.5
  const maxAmplitude = height * 0.4

  // Clear canvas with solid background
  ctx.fillStyle = scheme.background || '#000000'
  ctx.fillRect(0, 0, width, height)

  // Create terrain points with enhanced sensitivity
  for (let i = 0; i <= segments; i++) {
    const x = i * segmentWidth
    const dataIndex = Math.floor((i / segments) * data.length)
    const normalizedValue = applySensitivity(data[dataIndex], sensitivity)
    
    // Calculate height using both individual frequency and average
    const pointHeight = baseHeight - (normalizedValue * maxAmplitude * (0.8 + avgFrequency * 0.4))
    points.push({ x, y: pointHeight, height: normalizedValue })
  }

  // Draw multiple terrain layers with enhanced effects
  const layers = 3
  for (let layer = layers - 1; layer >= 0; layer--) {
    const layerOffset = (layer * height * 0.1)
    const alpha = 0.6 - (layer * 0.15)

    ctx.beginPath()
    ctx.moveTo(0, height)
    
    // Draw smooth curves between points
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i]
      const next = points[i + 1]
      const xc = (current.x + next.x) / 2
      const yc = (current.y + next.y) / 2 + layerOffset
      
      if (i === 0) {
        ctx.lineTo(current.x, current.y + layerOffset)
      }
      ctx.quadraticCurveTo(current.x, current.y + layerOffset, xc, yc)
    }
    
    // Complete the path
    ctx.lineTo(width, points[points.length - 1].y + layerOffset)
    ctx.lineTo(width, height)
    ctx.closePath()

    // Create dynamic gradient for each layer
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    scheme.colors.forEach((color, index) => {
      const adjustedAlpha = Math.floor(alpha * 255).toString(16).padStart(2, '0')
      gradient.addColorStop(index / (scheme.colors.length - 1), `${color}${adjustedAlpha}`)
    })

    // Apply enhanced glow effect based on average frequency
    if (avgFrequency > 0.4) {
      ctx.shadowColor = scheme.colors[0]
      ctx.shadowBlur = 20 * avgFrequency
    }

    ctx.fillStyle = gradient
    ctx.fill()

    // Reset shadow for next layer
    ctx.shadowBlur = 0

    // Draw highlight line on top of each layer
    ctx.beginPath()
    ctx.moveTo(0, points[0].y + layerOffset)
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i]
      const next = points[i + 1]
      const xc = (current.x + next.x) / 2
      const yc = (current.y + next.y) / 2 + layerOffset
      ctx.quadraticCurveTo(current.x, current.y + layerOffset, xc, yc)
    }
    
    ctx.strokeStyle = `${scheme.colors[0]}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`
    ctx.lineWidth = 2
    ctx.stroke()
  }
} 