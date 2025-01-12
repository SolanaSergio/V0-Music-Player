import type { DrawContext } from './types'

interface TerrainPoint {
  x: number
  y: number
  baseHeight: number
}

const terrainPoints: TerrainPoint[] = []
const POINT_COUNT = 100

export const drawTerrain = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  // Initialize terrain points if needed
  if (terrainPoints.length === 0) {
    for (let i = 0; i < POINT_COUNT; i++) {
      terrainPoints.push({
        x: (i / (POINT_COUNT - 1)) * width,
        y: height,
        baseHeight: Math.random() * 0.3 + 0.1 // 10-40% of height
      })
    }
  }

  // Calculate frequency influence on terrain
  const frequencyStep = Math.floor(data.length / POINT_COUNT)
  const layers = 3 // Number of terrain layers

  // Draw terrain layers
  for (let layer = 0; layer < layers; layer++) {
    ctx.beginPath()
    ctx.moveTo(0, height)

    // Draw terrain points
    terrainPoints.forEach((point, i) => {
      const frequencyIndex = Math.min(i * frequencyStep, data.length - 1)
      const normalizedFrequency = (data[frequencyIndex] / 255) * sensitivity
      const layerOffset = layer * 0.2 // Offset each layer
      const pointHeight = height - (point.baseHeight + layerOffset) * height * normalizedFrequency

      if (i === 0) {
        ctx.moveTo(point.x, pointHeight)
      } else {
        // Create smooth curves between points
        const prevPoint = terrainPoints[i - 1]
        const cpX = (prevPoint.x + point.x) / 2
        ctx.quadraticCurveTo(cpX, pointHeight, point.x, pointHeight)
      }
    })

    // Complete the terrain shape
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()

    // Create gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, `${scheme.colors[layer]}99`) // 60% opacity
    gradient.addColorStop(1, `${scheme.colors[layer]}33`) // 20% opacity

    ctx.fillStyle = gradient
    ctx.fill()

    // Add subtle stroke
    ctx.strokeStyle = scheme.colors[layer]
    ctx.lineWidth = 1
    ctx.stroke()
  }
} 