import type { DrawContext } from '@/components/visualizers/types'
import { applySensitivity, getAverageFrequency } from './utils'

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) * 0.3
  const segments = data.length
  const angleStep = (Math.PI * 2) / segments

  // Draw frequency circle
  ctx.beginPath()
  for (let i = 0; i < segments; i++) {
    const normalizedValue = applySensitivity(data[i], sensitivity)
    const segmentRadius = radius + (normalizedValue * radius)
    const angle = i * angleStep
    const x = centerX + Math.cos(angle) * segmentRadius
    const y = centerY + Math.sin(angle) * segmentRadius

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.closePath()

  // Create gradient
  const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 2)
  scheme.colors.forEach((color, index) => {
    gradient.addColorStop(index / (scheme.colors.length - 1), color)
  })

  // Apply gradient and glow effect
  const avgFrequency = getAverageFrequency(data, sensitivity)
  if (avgFrequency > 0.6) {
    ctx.shadowColor = scheme.colors[0]
    ctx.shadowBlur = 20 * avgFrequency
  }

  ctx.strokeStyle = gradient
  ctx.lineWidth = 2
  ctx.stroke()

  // Reset shadow
  ctx.shadowBlur = 0

  // Fill with semi-transparent gradient
  const fillGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 2)
  scheme.colors.forEach((color, index) => {
    fillGradient.addColorStop(index / (scheme.colors.length - 1), `${color}33`)
  })
  
  ctx.fillStyle = fillGradient
  ctx.fill()
} 