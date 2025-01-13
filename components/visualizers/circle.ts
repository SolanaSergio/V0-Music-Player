import type { DrawContext } from '@/components/visualizers/types'
import { applySensitivity, getAverageFrequency } from './utils'

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const centerX = width / 2
  const centerY = height / 2
  const baseRadius = Math.min(width, height) * 0.3
  const segments = data.length
  const angleStep = (Math.PI * 2) / segments
  const avgFrequency = getAverageFrequency(data, sensitivity)

  // Clear canvas with solid background
  ctx.fillStyle = scheme.background || '#000000'
  ctx.fillRect(0, 0, width, height)

  // Draw frequency circle with enhanced sensitivity
  ctx.beginPath()
  for (let i = 0; i < segments; i++) {
    const normalizedValue = applySensitivity(data[i], sensitivity)
    // Dynamic radius based on both individual frequency and average
    const segmentRadius = baseRadius + (normalizedValue * baseRadius * (0.8 + avgFrequency * 0.4))
    const angle = i * angleStep
    const x = centerX + Math.cos(angle) * segmentRadius
    const y = centerY + Math.sin(angle) * segmentRadius

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      // Create smooth curve between points
      const prevAngle = (i - 1) * angleStep
      const prevNormalizedValue = applySensitivity(data[i - 1], sensitivity)
      const prevRadius = baseRadius + (prevNormalizedValue * baseRadius * (0.8 + avgFrequency * 0.4))
      const prevX = centerX + Math.cos(prevAngle) * prevRadius
      const prevY = centerY + Math.sin(prevAngle) * prevRadius
      
      const xc = (prevX + x) / 2
      const yc = (prevY + y) / 2
      ctx.quadraticCurveTo(prevX, prevY, xc, yc)
    }
  }
  ctx.closePath()

  // Create enhanced gradient with dynamic sizing
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

  // Reset shadow
  ctx.shadowBlur = 0

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
} 