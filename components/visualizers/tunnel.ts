import type { DrawContext } from './types'

interface TunnelSegment {
  z: number
  rotation: number
  scale: number
  color: string
}

const segments: TunnelSegment[] = []
const SEGMENT_COUNT = 20
const MAX_Z = 10

export const drawTunnel = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const centerX = width / 2
  const centerY = height / 2
  const baseSize = Math.min(width, height) * 0.4

  // Initialize segments if needed
  if (segments.length === 0) {
    for (let i = 0; i < SEGMENT_COUNT; i++) {
      segments.push({
        z: (i / SEGMENT_COUNT) * MAX_Z,
        rotation: Math.random() * Math.PI * 2,
        scale: 1,
        color: scheme.colors[i % scheme.colors.length]
      })
    }
  }

  // Calculate average frequency for tunnel effects
  const avgFrequency = data.reduce((sum, value) => sum + value, 0) / data.length
  const normalizedFrequency = (avgFrequency / 255) * sensitivity

  // Update and draw segments from back to front
  segments.forEach((segment, i) => {
    // Update segment
    segment.z -= 0.1 * (1 + normalizedFrequency)
    if (segment.z < 0) {
      segment.z += MAX_Z
      segment.rotation = Math.random() * Math.PI * 2
    }
    
    segment.rotation += 0.02 * normalizedFrequency
    segment.color = scheme.colors[i % scheme.colors.length]

    // Calculate perspective
    const perspective = 1 / (segment.z * 0.2 + 1)
    const size = baseSize * perspective
    const sides = 6 // Hexagonal tunnel
    
    // Draw segment
    ctx.beginPath()
    for (let side = 0; side <= sides; side++) {
      const angle = segment.rotation + (side * Math.PI * 2) / sides
      const sideX = centerX + Math.cos(angle) * size
      const sideY = centerY + Math.sin(angle) * size
      
      if (side === 0) {
        ctx.moveTo(sideX, sideY)
      } else {
        ctx.lineTo(sideX, sideY)
      }
    }
    ctx.closePath()

    // Create gradient fill
    const gradient = ctx.createRadialGradient(
      centerX, centerY, size * 0.5,
      centerX, centerY, size
    )
    gradient.addColorStop(0, `${segment.color}${Math.floor(perspective * 255).toString(16).padStart(2, '0')}`)
    gradient.addColorStop(1, `${segment.color}00`)

    ctx.fillStyle = gradient
    ctx.fill()

    // Add glow effect for high frequencies
    if (normalizedFrequency > 0.6) {
      ctx.shadowColor = segment.color
      ctx.shadowBlur = 20 * normalizedFrequency * perspective
      ctx.fill()
      ctx.shadowBlur = 0
    }

    // Draw connecting lines between segments
    if (i > 0) {
      const prevSegment = segments[i - 1]
      const prevPerspective = 1 / (prevSegment.z * 0.2 + 1)
      const prevSize = baseSize * prevPerspective

      for (let side = 0; side < sides; side++) {
        const angle = segment.rotation + (side * Math.PI * 2) / sides
        const prevAngle = prevSegment.rotation + (side * Math.PI * 2) / sides

        const x1 = centerX + Math.cos(angle) * size
        const y1 = centerY + Math.sin(angle) * size
        const x2 = centerX + Math.cos(prevAngle) * prevSize
        const y2 = centerY + Math.sin(prevAngle) * prevSize

        const lineGradient = ctx.createLinearGradient(x1, y1, x2, y2)
        lineGradient.addColorStop(0, `${segment.color}33`)
        lineGradient.addColorStop(1, `${prevSegment.color}33`)

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = lineGradient
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }
  })
} 