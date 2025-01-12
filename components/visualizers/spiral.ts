import type { DrawContext } from './types'

export const drawSpiral = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const centerX = width / 2
  const centerY = height / 2
  const maxRadius = Math.min(width, height) * 0.4
  const spiralCount = 3
  const rotations = 5

  // Draw multiple spiral layers
  for (let s = 0; s < spiralCount; s++) {
    const spiralOffset = (s / spiralCount) * Math.PI * 2
    const baseRadius = maxRadius * (0.3 + (s / spiralCount) * 0.7)

    ctx.beginPath()
    
    // Create spiral path
    const points: [number, number][] = []
    const steps = data.length
    
    for (let i = 0; i < steps; i++) {
      const progress = i / steps
      const angle = progress * Math.PI * 2 * rotations + spiralOffset
      const normalizedFrequency = (data[i] / 255) * sensitivity
      const radius = baseRadius * (progress + normalizedFrequency * 0.2)
      
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      
      points.push([x, y])
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        // Smooth curve between points
        const [px, py] = points[i - 1]
        const cpX = (x + px) / 2
        const cpY = (y + py) / 2
        ctx.quadraticCurveTo(cpX, cpY, x, y)
      }
    }

    // Create gradient for the spiral
    const gradient = ctx.createLinearGradient(
      centerX - maxRadius,
      centerY - maxRadius,
      centerX + maxRadius,
      centerY + maxRadius
    )
    
    const colorIndex = s % scheme.colors.length
    gradient.addColorStop(0, `${scheme.colors[colorIndex]}99`) // 60% opacity
    gradient.addColorStop(1, `${scheme.colors[colorIndex]}33`) // 20% opacity

    // Apply styles and draw
    ctx.strokeStyle = gradient
    ctx.lineWidth = 2 + (spiralCount - s)
    ctx.stroke()

    // Add glow effect
    ctx.shadowColor = scheme.colors[colorIndex]
    ctx.shadowBlur = 10
    ctx.stroke()
    ctx.shadowBlur = 0
  }
} 