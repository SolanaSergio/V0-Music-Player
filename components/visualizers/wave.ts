import type { DrawContext } from '@/components/visualizers/types'
import { applySensitivity, getAverageFrequency } from './utils'

export const drawWave = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const layers = 3 // Number of wave layers
  const baseLineWidth = 2

  for (let layer = 0; layer < layers; layer++) {
    const layerOffset = (layer - Math.floor(layers / 2)) * 20 // Offset each layer vertically
    const sliceWidth = width / data.length
    
    ctx.beginPath()
    ctx.lineWidth = baseLineWidth * (layers - layer)
    
    // Create gradient for stroke
    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    const colorIndex = layer % scheme.colors.length
    gradient.addColorStop(0, `${scheme.colors[colorIndex]}99`)
    gradient.addColorStop(0.5, scheme.colors[colorIndex])
    gradient.addColorStop(1, `${scheme.colors[colorIndex]}99`)
    ctx.strokeStyle = gradient

    let x = 0
    let prevY = 0

    for (let i = 0; i < data.length; i++) {
      const normalizedValue = applySensitivity(data[i], sensitivity, 128.0)
      const y = (normalizedValue * height / 2) + layerOffset

      if (i === 0) {
        ctx.moveTo(x, y)
        prevY = y
      } else {
        // Smooth curve between points
        const cpx = x - sliceWidth / 2
        ctx.quadraticCurveTo(cpx, prevY, x, y)
        prevY = y
      }

      x += sliceWidth
    }

    // Add glow effect based on average amplitude
    const avgAmplitude = getAverageFrequency(data, sensitivity)
    if (avgAmplitude > 0.6) {
      ctx.shadowColor = scheme.colors[colorIndex]
      ctx.shadowBlur = 10 * avgAmplitude
      ctx.stroke()
      ctx.shadowBlur = 0
    } else {
      ctx.stroke()
    }
  }
} 