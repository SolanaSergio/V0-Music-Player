import type { DrawContext } from '@/components/visualizers/types'
import { applySensitivity, getAverageFrequency } from './utils'

interface Ring {
  radius: number
  rotation: number
  speed: number
  opacity: number
  color: string
}

const rings: Ring[] = []
const maxRings = 20

export const drawRings = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const centerX = width / 2
  const centerY = height / 2
  const maxRadius = Math.min(width, height) * 0.4
  const avgFrequency = getAverageFrequency(data, sensitivity)

  // Clear canvas with solid background
  ctx.fillStyle = scheme.background || '#000000'
  ctx.fillRect(0, 0, width, height)

  // Update existing rings
  for (let i = rings.length - 1; i >= 0; i--) {
    const ring = rings[i]
    ring.rotation += ring.speed
    ring.opacity -= 0.002 // Reduced opacity decay

    // Remove rings that have faded out
    if (ring.opacity <= 0) {
      rings.splice(i, 1)
    }
  }

  // Create new rings based on frequency data
  const spawnCount = Math.floor(avgFrequency * 3)
  for (let i = 0; i < spawnCount && rings.length < maxRings; i++) {
    const freqIndex = Math.floor(Math.random() * data.length)
    const normalizedValue = applySensitivity(data[freqIndex], sensitivity)
    
    rings.push({
      radius: maxRadius * (0.2 + Math.random() * 0.8),
      rotation: Math.random() * Math.PI * 2,
      speed: (0.02 + normalizedValue * 0.04) * (Math.random() > 0.5 ? 1 : -1),
      opacity: 1.0, // Start with full opacity
      color: scheme.colors[Math.floor(Math.random() * scheme.colors.length)]
    })
  }

  // Draw background glow
  if (avgFrequency > 0.4) {
    const glowRadius = maxRadius * 1.5 * avgFrequency
    const glow = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, glowRadius
    )
    glow.addColorStop(0, `${scheme.colors[0]}33`)
    glow.addColorStop(1, `${scheme.colors[0]}00`)
    
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, width, height)
  }

  // Draw rings
  rings.forEach(ring => {
    ctx.beginPath()

    // Create segments based on frequency data
    const segments = 32
    const angleStep = (Math.PI * 2) / segments

    for (let i = 0; i <= segments; i++) {
      const angle = i * angleStep + ring.rotation
      const freqIndex = Math.floor((i / segments) * data.length)
      const normalizedValue = applySensitivity(data[freqIndex], sensitivity)
      
      const radiusOffset = normalizedValue * ring.radius * 0.2
      const currentRadius = ring.radius + radiusOffset

      const x = centerX + Math.cos(angle) * currentRadius
      const y = centerY + Math.sin(angle) * currentRadius

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        // Create smooth curve between points
        const prevAngle = (i - 1) * angleStep + ring.rotation
        const prevFreqIndex = Math.floor(((i - 1) / segments) * data.length)
        const prevNormalizedValue = applySensitivity(data[prevFreqIndex], sensitivity)
        
        const prevRadiusOffset = prevNormalizedValue * ring.radius * 0.2
        const prevRadius = ring.radius + prevRadiusOffset

        const prevX = centerX + Math.cos(prevAngle) * prevRadius
        const prevY = centerY + Math.sin(prevAngle) * prevRadius

        const cpX = (x + prevX) / 2
        const cpY = (y + prevY) / 2
        ctx.quadraticCurveTo(prevX, prevY, cpX, cpY)
      }
    }
    ctx.closePath()

    // Create gradient for ring with improved opacity handling
    const gradient = ctx.createLinearGradient(
      centerX - ring.radius,
      centerY - ring.radius,
      centerX + ring.radius,
      centerY + ring.radius
    )
    const alpha = Math.floor(ring.opacity * 255).toString(16).padStart(2, '0')
    gradient.addColorStop(0, `${ring.color}${alpha}`)
    gradient.addColorStop(1, `${ring.color}33`)

    ctx.strokeStyle = gradient
    ctx.lineWidth = 2 + avgFrequency * 3

    // Add glow effect based on frequency
    if (avgFrequency > 0.4) {
      ctx.shadowColor = ring.color
      ctx.shadowBlur = 15 * avgFrequency * ring.opacity
      ctx.stroke()
      ctx.shadowBlur = 0
    } else {
      ctx.stroke()
    }
  })
} 