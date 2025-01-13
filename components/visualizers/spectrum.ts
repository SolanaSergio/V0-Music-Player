import type { DrawContext } from './types'
import { applySensitivity, getAverageFrequency } from './utils'

export const drawSpectrum = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const binCount = data.length
  const binWidth = width / binCount
  const maxHeight = height * 0.8

  // Track peaks for each frequency bin
  const peaks = new Array(binCount).fill(0)
  const peakDecay = 0.98
  const peakHold = 30

  // Draw frequency spectrum
  ctx.beginPath()
  ctx.moveTo(0, height)

  const points: [number, number][] = []

  for (let i = 0; i < binCount; i++) {
    const x = i * binWidth
    const normalizedValue = applySensitivity(data[i], sensitivity)
    const y = height - (normalizedValue * maxHeight)
    
    // Update peaks
    if (y < peaks[i] || peaks[i] === 0) {
      peaks[i] = y
    } else {
      peaks[i] = Math.min(height, peaks[i] + peakHold * (1 - peakDecay))
    }

    points.push([x, y])
    
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      // Create smooth curve between points
      const [px, py] = points[i - 1]
      const xc = (px + x) / 2
      const yc = (py + y) / 2
      ctx.quadraticCurveTo(px, py, xc, yc)
    }
  }

  // Complete the curve
  if (points.length > 0) {
    const [lastX, lastY] = points[points.length - 1]
    ctx.lineTo(lastX, lastY)
  }

  // Create gradient for the spectrum
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  scheme.colors.forEach((color, index) => {
    gradient.addColorStop(index / (scheme.colors.length - 1), color)
  })
  
  ctx.strokeStyle = gradient
  ctx.lineWidth = 2
  ctx.stroke()

  // Fill area under curve with gradient
  ctx.lineTo(width, height)
  ctx.lineTo(0, height)
  const fillGradient = ctx.createLinearGradient(0, 0, 0, height)
  scheme.colors.forEach((color, index) => {
    fillGradient.addColorStop(index / (scheme.colors.length - 1), `${color}33`)
  })
  ctx.fillStyle = fillGradient
  ctx.fill()

  // Draw peaks
  ctx.beginPath()
  for (let i = 0; i < binCount; i++) {
    const x = i * binWidth
    if (i === 0) {
      ctx.moveTo(x, peaks[i])
    } else {
      ctx.lineTo(x, peaks[i])
    }
  }
  ctx.strokeStyle = `${scheme.colors[0]}99`
  ctx.lineWidth = 1
  ctx.stroke()

  // Add glow effect for high frequencies
  const avgFrequency = getAverageFrequency(data, sensitivity)
  if (avgFrequency > 0.6) {
    ctx.shadowColor = scheme.colors[0]
    ctx.shadowBlur = 15 * avgFrequency
    ctx.stroke()
    ctx.shadowBlur = 0
  }
} 