import type { DrawContext } from './types'

export const drawSpectrum = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const binCount = data.length
  const binWidth = width / binCount
  const maxHeight = height * 0.8

  // Draw frequency spectrum
  ctx.beginPath()
  ctx.moveTo(0, height)

  for (let i = 0; i < binCount; i++) {
    const x = i * binWidth
    const normalizedValue = (data[i] / 255) * sensitivity
    const y = height - (normalizedValue * maxHeight)
    
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }

    // Color gradient based on frequency
    const colorIndex = Math.floor((i / binCount) * scheme.colors.length)
    ctx.strokeStyle = scheme.colors[colorIndex]
    ctx.lineWidth = 2
  }

  // Smooth curve
  ctx.stroke()

  // Fill area under curve
  ctx.lineTo(width, height)
  ctx.lineTo(0, height)
  ctx.fillStyle = `${scheme.colors[0]}33` // 20% opacity
  ctx.fill()
} 