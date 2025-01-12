import type { DrawContext } from './types'

export const drawFrequency = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const binCount = data.length
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) * 0.4
  const angleStep = (Math.PI * 2) / binCount

  // Draw frequency rings
  for (let ring = 0; ring < 3; ring++) {
    const ringRadius = radius * (0.5 + ring * 0.2)
    
    ctx.beginPath()
    for (let i = 0; i < binCount; i++) {
      const angle = i * angleStep
      const normalizedValue = (data[i] / 255) * sensitivity
      const r = ringRadius + normalizedValue * (radius * 0.2)
      
      const x = centerX + Math.cos(angle) * r
      const y = centerY + Math.sin(angle) * r
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    
    ctx.closePath()
    
    // Color gradient
    const gradient = ctx.createRadialGradient(
      centerX, centerY, ringRadius * 0.8,
      centerX, centerY, ringRadius * 1.2
    )
    gradient.addColorStop(0, `${scheme.colors[ring]}66`) // 40% opacity
    gradient.addColorStop(1, `${scheme.colors[ring]}00`) // 0% opacity
    
    ctx.fillStyle = gradient
    ctx.fill()
    
    ctx.strokeStyle = scheme.colors[ring]
    ctx.lineWidth = 2
    ctx.stroke()
  }
} 