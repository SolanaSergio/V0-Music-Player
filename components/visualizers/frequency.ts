import type { DrawContext } from '@/components/visualizers/types'
import { applySensitivity, getAverageFrequency } from './utils'

export const drawFrequency = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const centerX = width / 2
  const centerY = height / 2
  const baseRadius = Math.min(width, height) * 0.3
  const segments = data.length
  const angleStep = (Math.PI * 2) / segments

  // Create frequency points
  const points: [number, number][] = []
  for (let i = 0; i < segments; i++) {
    const normalizedValue = applySensitivity(data[i], sensitivity)
    const radius = baseRadius + (normalizedValue * baseRadius)
    const angle = i * angleStep - Math.PI / 2 // Start from top
    
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius
    points.push([x, y])
  }

  // Draw frequency shape
  ctx.beginPath()
  points.forEach(([x, y], i) => {
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      // Create smooth curve between points
      const [prevX, prevY] = points[i - 1]
      const xc = (prevX + x) / 2
      const yc = (prevY + y) / 2
      ctx.quadraticCurveTo(prevX, prevY, xc, yc)
    }
  })
  
  // Close the path smoothly
  if (points.length > 0) {
    const [firstX, firstY] = points[0]
    const [lastX, lastY] = points[points.length - 1]
    const xc = (lastX + firstX) / 2
    const yc = (lastY + firstY) / 2
    ctx.quadraticCurveTo(lastX, lastY, xc, yc)
    ctx.quadraticCurveTo(firstX, firstY, firstX, firstY)
  }

  // Create and apply gradients
  const gradient = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.5, centerX, centerY, baseRadius * 2)
  scheme.colors.forEach((color, index) => {
    gradient.addColorStop(index / (scheme.colors.length - 1), color)
  })

  // Apply glow effect based on average frequency
  const avgFrequency = getAverageFrequency(data, sensitivity)
  if (avgFrequency > 0.6) {
    ctx.shadowColor = scheme.colors[0]
    ctx.shadowBlur = 20 * avgFrequency
  }

  // Stroke the shape
  ctx.strokeStyle = gradient
  ctx.lineWidth = 2
  ctx.stroke()

  // Fill with semi-transparent gradient
  const fillGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * 2)
  scheme.colors.forEach((color, index) => {
    fillGradient.addColorStop(index / (scheme.colors.length - 1), `${color}33`)
  })
  
  ctx.fillStyle = fillGradient
  ctx.fill()

  // Reset shadow
  ctx.shadowBlur = 0
} 