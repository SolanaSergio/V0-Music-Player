import type { DrawContext } from '@/components/visualizers/types'
import { applySensitivity, getAverageFrequency } from './utils'

export const drawSpiral = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const centerX = width / 2
  const centerY = height / 2
  const baseRadius = Math.min(width, height) * 0.4
  const rotations = 3
  const angleStep = (Math.PI * 2 * rotations) / data.length

  // Draw multiple spiral layers
  const layers = 3
  for (let layer = 0; layer < layers; layer++) {
    const layerOffset = layer * 20 // Offset each layer
    
    ctx.beginPath()
    let prevX: number | null = null
    let prevY: number | null = null

    // Draw spiral points
    for (let i = 0; i < data.length; i++) {
      const angle = i * angleStep
      const normalizedValue = applySensitivity(data[i], sensitivity)
      const radiusOffset = normalizedValue * baseRadius * 0.3
      
      // Spiral radius grows with angle
      const spiralRadius = (angle / (Math.PI * 2 * rotations)) * baseRadius
      const radius = spiralRadius + radiusOffset + layerOffset
      
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      if (i === 0) {
        ctx.moveTo(x, y)
      } else if (prevX !== null && prevY !== null) {
        // Create smooth curve between points
        const xc = (prevX + x) / 2
        const yc = (prevY + y) / 2
        ctx.quadraticCurveTo(prevX, prevY, xc, yc)
      }

      prevX = x
      prevY = y
    }

    // Create gradient for the spiral
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    const colorIndex = layer % scheme.colors.length
    gradient.addColorStop(0, scheme.colors[colorIndex])
    gradient.addColorStop(1, `${scheme.colors[colorIndex]}33`)

    ctx.strokeStyle = gradient
    ctx.lineWidth = 2

    // Add glow effect based on average frequency
    const avgFrequency = getAverageFrequency(data, sensitivity)
    if (avgFrequency > 0.6) {
      ctx.shadowColor = scheme.colors[colorIndex]
      ctx.shadowBlur = 15 * avgFrequency
      ctx.stroke()
      ctx.shadowBlur = 0
    } else {
      ctx.stroke()
    }

    // Draw connecting lines between layers
    if (layer > 0) {
      const prevLayer = layer - 1
      const segments = 12
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2
        const normalizedValue = applySensitivity(data[Math.floor(i * data.length / segments)], sensitivity)
        const radiusOffset = normalizedValue * baseRadius * 0.3
        
        const innerRadius = ((angle / (Math.PI * 2)) * baseRadius) + radiusOffset + (prevLayer * 20)
        const outerRadius = ((angle / (Math.PI * 2)) * baseRadius) + radiusOffset + layerOffset

        ctx.beginPath()
        ctx.moveTo(
          centerX + Math.cos(angle) * innerRadius,
          centerY + Math.sin(angle) * innerRadius
        )
        ctx.lineTo(
          centerX + Math.cos(angle) * outerRadius,
          centerY + Math.sin(angle) * outerRadius
        )

        const lineGradient = ctx.createLinearGradient(
          centerX + Math.cos(angle) * innerRadius,
          centerY + Math.sin(angle) * innerRadius,
          centerX + Math.cos(angle) * outerRadius,
          centerY + Math.sin(angle) * outerRadius
        )
        lineGradient.addColorStop(0, `${scheme.colors[prevLayer]}33`)
        lineGradient.addColorStop(1, `${scheme.colors[colorIndex]}33`)
        
        ctx.strokeStyle = lineGradient
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }
  }
} 