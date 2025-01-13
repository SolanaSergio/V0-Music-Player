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

  // Clear canvas with solid background
  ctx.fillStyle = scheme.background || '#000000'
  ctx.fillRect(0, 0, width, height)

  // Create frequency points with enhanced sensitivity
  const points: [number, number][] = []
  const avgFrequency = getAverageFrequency(data, sensitivity)
  
  for (let i = 0; i < segments; i++) {
    const normalizedValue = applySensitivity(data[i], sensitivity)
    // Dynamic radius based on both individual frequency and average
    const radius = baseRadius + (normalizedValue * baseRadius * (0.8 + avgFrequency * 0.4))
    const angle = i * angleStep - Math.PI / 2 // Start from top
    
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius
    points.push([x, y])
  }

  // Draw frequency shape with enhanced effects
  ctx.beginPath()
  points.forEach(([x, y], i) => {
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      // Create smooth curve between points with dynamic control points
      const [prevX, prevY] = points[i - 1]
      const normalizedValue = applySensitivity(data[i], sensitivity)
      const tension = 0.2 + normalizedValue * 0.3 // Dynamic curve tension
      
      const xc = (prevX + x) / 2
      const yc = (prevY + y) / 2 + (normalizedValue * 20 * tension) // Apply tension to vertical offset
      ctx.quadraticCurveTo(prevX, prevY, xc, yc)
    }
  })
  
  // Close the path smoothly with sensitivity-based morphing
  if (points.length > 0) {
    const [firstX, firstY] = points[0]
    const [lastX, lastY] = points[points.length - 1]
    const lastNormalizedValue = applySensitivity(data[data.length - 1], sensitivity)
    const firstNormalizedValue = applySensitivity(data[0], sensitivity)
    
    const xc = (lastX + firstX) / 2
    const yc = (lastY + firstY) / 2 + ((lastNormalizedValue + firstNormalizedValue) * 10)
    ctx.quadraticCurveTo(lastX, lastY, xc, yc)
    ctx.quadraticCurveTo(firstX, firstY, firstX, firstY)
  }

  // Create and apply enhanced gradients
  const gradient = ctx.createRadialGradient(
    centerX, centerY, baseRadius * (0.3 + avgFrequency * 0.4),
    centerX, centerY, baseRadius * (1.5 + avgFrequency)
  )
  scheme.colors.forEach((color, index) => {
    gradient.addColorStop(index / (scheme.colors.length - 1), color)
  })

  // Apply enhanced glow effect based on average frequency
  if (avgFrequency > 0.4) { // Lower threshold for more responsive glow
    ctx.shadowColor = scheme.colors[0]
    ctx.shadowBlur = 20 * (avgFrequency * 1.5) // Increased glow intensity
  }

  // Stroke with dynamic width
  ctx.strokeStyle = gradient
  ctx.lineWidth = 2 + (avgFrequency * 3)
  ctx.stroke()

  // Fill with enhanced semi-transparent gradient
  const fillGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, baseRadius * (1.5 + avgFrequency)
  )
  scheme.colors.forEach((color, index) => {
    const alpha = Math.floor((0.2 + avgFrequency * 0.3) * 255).toString(16).padStart(2, '0')
    fillGradient.addColorStop(index / (scheme.colors.length - 1), `${color}${alpha}`)
  })
  
  ctx.fillStyle = fillGradient
  ctx.fill()

  // Reset shadow
  ctx.shadowBlur = 0
} 