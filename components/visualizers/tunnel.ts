import type { DrawContext } from '@/components/visualizers/types'
import { applySensitivity, getAverageFrequency } from './utils'

interface TunnelSegment {
  radius: number
  rotation: number
  depth: number
  color: string
}

const segments: TunnelSegment[] = []
const maxSegments = 30
let globalRotation = 0

export const drawTunnel = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const centerX = width / 2
  const centerY = height / 2
  const baseRadius = Math.min(width, height) * 0.4
  const avgFrequency = getAverageFrequency(data, sensitivity)

  // Update global rotation based on average frequency
  globalRotation += 0.02 + avgFrequency * 0.03

  // Remove segments that are too small
  while (segments.length > 0 && segments[0].radius < 10) {
    segments.shift()
  }

  // Add new segments based on frequency
  if (segments.length < maxSegments && avgFrequency > 0.3) {
    const freqIndex = Math.floor(Math.random() * data.length)
    const normalizedValue = applySensitivity(data[freqIndex], sensitivity)
    
    segments.push({
      radius: baseRadius,
      rotation: globalRotation + (Math.random() - 0.5) * Math.PI * normalizedValue,
      depth: 1,
      color: scheme.colors[Math.floor(Math.random() * scheme.colors.length)]
    })
  }

  // Draw background glow
  if (avgFrequency > 0.5) {
    const glowRadius = baseRadius * 1.5 * avgFrequency
    const glow = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, glowRadius
    )
    glow.addColorStop(0, `${scheme.colors[0]}33`)
    glow.addColorStop(1, `${scheme.colors[0]}00`)
    
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, width, height)
  }

  // Update and draw segments
  segments.forEach((segment, i) => {
    // Update segment
    segment.depth *= 0.95
    segment.radius *= 0.97
    segment.rotation += 0.1 * (1 - segment.depth)

    // Calculate segment properties
    const sides = 8
    const angleStep = (Math.PI * 2) / sides
    const points: [number, number][] = []

    // Create segment points
    for (let j = 0; j <= sides; j++) {
      const angle = j * angleStep + segment.rotation
      const freqIndex = Math.floor((j / sides) * data.length)
      const normalizedValue = applySensitivity(data[freqIndex], sensitivity)
      
      const radiusOffset = normalizedValue * segment.radius * 0.2
      const currentRadius = segment.radius + radiusOffset

      const x = centerX + Math.cos(angle) * currentRadius
      const y = centerY + Math.sin(angle) * currentRadius
      points.push([x, y])
    }

    // Draw segment
    ctx.beginPath()
    points.forEach(([x, y], j) => {
      if (j === 0) {
        ctx.moveTo(x, y)
      } else {
        // Create smooth curve between points
        const [prevX, prevY] = points[j - 1]
        const cpX = (x + prevX) / 2
        const cpY = (y + prevY) / 2
        ctx.quadraticCurveTo(prevX, prevY, cpX, cpY)
      }
    })
    ctx.closePath()

    // Create gradient for segment
    const gradient = ctx.createLinearGradient(
      centerX - segment.radius,
      centerY - segment.radius,
      centerX + segment.radius,
      centerY + segment.radius
    )
    gradient.addColorStop(0, `${segment.color}${Math.floor(segment.depth * 255).toString(16).padStart(2, '0')}`)
    gradient.addColorStop(1, `${segment.color}33`)

    ctx.strokeStyle = gradient
    ctx.lineWidth = 2 + avgFrequency * 3

    // Add glow effect based on frequency
    if (avgFrequency > 0.6) {
      ctx.shadowColor = segment.color
      ctx.shadowBlur = 15 * avgFrequency
      ctx.stroke()
      ctx.shadowBlur = 0
    } else {
      ctx.stroke()
    }

    // Draw connecting lines between segments
    if (i > 0) {
      const prevSegment = segments[i - 1]
      const lineCount = 8
      const lineAngle = (Math.PI * 2) / lineCount

      for (let l = 0; l < lineCount; l++) {
        const angle = segment.rotation + l * lineAngle
        const freqIndex = Math.floor((l / lineCount) * data.length)
        const normalizedValue = applySensitivity(data[freqIndex], sensitivity)
        
        const x1 = centerX + Math.cos(angle) * segment.radius
        const y1 = centerY + Math.sin(angle) * segment.radius
        const x2 = centerX + Math.cos(angle) * prevSegment.radius
        const y2 = centerY + Math.sin(angle) * prevSegment.radius

        const lineGradient = ctx.createLinearGradient(x1, y1, x2, y2)
        lineGradient.addColorStop(0, `${segment.color}${Math.floor(segment.depth * 255).toString(16).padStart(2, '0')}`)
        lineGradient.addColorStop(1, `${prevSegment.color}${Math.floor(prevSegment.depth * 255).toString(16).padStart(2, '0')}`)

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = lineGradient
        ctx.lineWidth = 1 + normalizedValue * 2
        ctx.stroke()
      }
    }
  })
} 