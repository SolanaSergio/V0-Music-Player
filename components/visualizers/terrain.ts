import type { DrawContext } from '@/components/visualizers/types'
import { applySensitivity, getAverageFrequency } from './utils'

export const drawTerrain = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const segments = data.length
  const segmentWidth = width / segments
  const points: [number, number][] = []

  // Create terrain points with smooth transitions
  for (let i = 0; i <= segments; i++) {
    const x = i * segmentWidth
    let y = height

    if (i < segments) {
      const normalizedValue = applySensitivity(data[i], sensitivity)
      y = height - (normalizedValue * height * 0.8)
    } else {
      // For the last point, use the first value to create a loop
      const normalizedValue = applySensitivity(data[0], sensitivity)
      y = height - (normalizedValue * height * 0.8)
    }

    points.push([x, y])
  }

  // Draw terrain layers
  const layers = 3
  const layerOffset = height * 0.1

  for (let layer = 0; layer < layers; layer++) {
    ctx.beginPath()
    points.forEach(([x, y], i) => {
      const offsetY = y + (layer * layerOffset)
      
      if (i === 0) {
        ctx.moveTo(x, offsetY)
      } else {
        // Create smooth curve between points
        const [prevX, prevY] = points[i - 1]
        const prevOffsetY = prevY + (layer * layerOffset)
        const xc = (prevX + x) / 2
        const yc = (prevOffsetY + offsetY) / 2
        ctx.quadraticCurveTo(prevX, prevOffsetY, xc, yc)
      }
    })

    // Complete the terrain by drawing to the bottom
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()

    // Create gradient for each layer
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    const colorIndex = layer % scheme.colors.length
    gradient.addColorStop(0, scheme.colors[colorIndex])
    gradient.addColorStop(1, `${scheme.colors[colorIndex]}33`)

    ctx.fillStyle = gradient

    // Add glow effect based on average frequency
    const avgFrequency = getAverageFrequency(data, sensitivity)
    if (avgFrequency > 0.6 && layer === 0) {
      ctx.shadowColor = scheme.colors[colorIndex]
      ctx.shadowBlur = 20 * avgFrequency
      ctx.fill()
      ctx.shadowBlur = 0
    } else {
      ctx.fill()
    }

    // Draw highlight line on top of each layer
    ctx.beginPath()
    points.forEach(([x, y], i) => {
      const offsetY = y + (layer * layerOffset)
      
      if (i === 0) {
        ctx.moveTo(x, offsetY)
      } else {
        const [prevX, prevY] = points[i - 1]
        const prevOffsetY = prevY + (layer * layerOffset)
        const xc = (prevX + x) / 2
        const yc = (prevOffsetY + offsetY) / 2
        ctx.quadraticCurveTo(prevX, prevOffsetY, xc, yc)
      }
    })

    ctx.strokeStyle = `${scheme.colors[colorIndex]}66`
    ctx.lineWidth = 1
    ctx.stroke()
  }
} 