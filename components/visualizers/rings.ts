import type { DrawContext } from './types'

interface Ring {
  radius: number
  rotation: number
  speed: number
  thickness: number
  color: string
}

const rings: Ring[] = []
const RING_COUNT = 5

export const drawRings = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const centerX = width / 2
  const centerY = height / 2
  const maxRadius = Math.min(width, height) * 0.4

  // Initialize rings if needed
  if (rings.length === 0) {
    for (let i = 0; i < RING_COUNT; i++) {
      rings.push({
        radius: maxRadius * (0.3 + (i / RING_COUNT) * 0.7),
        rotation: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03,
        thickness: 5 + Math.random() * 10,
        color: scheme.colors[i % scheme.colors.length]
      })
    }
  }

  // Calculate frequency bands for rings
  const bandSize = Math.floor(data.length / RING_COUNT)
  const frequencyBands = Array.from({ length: RING_COUNT }, (_, i) => {
    const start = i * bandSize
    const end = start + bandSize
    return Array.from(data.slice(start, end)).reduce((a, b) => a + b, 0) / bandSize
  })

  // Update and draw rings
  rings.forEach((ring, i) => {
    const normalizedFrequency = (frequencyBands[i] / 255) * sensitivity
    
    // Update ring
    ring.rotation += ring.speed * normalizedFrequency
    ring.color = scheme.colors[i % scheme.colors.length]
    
    // Draw ring segments
    const segments = 12
    const segmentAngle = (Math.PI * 2) / segments
    
    for (let s = 0; s < segments; s++) {
      const startAngle = ring.rotation + s * segmentAngle
      const endAngle = startAngle + segmentAngle * 0.8 // Leave gap between segments
      
      ctx.beginPath()
      ctx.arc(
        centerX,
        centerY,
        ring.radius * (1 + normalizedFrequency * 0.2),
        startAngle,
        endAngle
      )

      // Create gradient for segment
      const gradient = ctx.createRadialGradient(
        centerX, centerY, ring.radius - ring.thickness,
        centerX, centerY, ring.radius + ring.thickness
      )
      gradient.addColorStop(0, `${ring.color}00`)
      gradient.addColorStop(0.5, `${ring.color}99`)
      gradient.addColorStop(1, `${ring.color}00`)

      ctx.strokeStyle = gradient
      ctx.lineWidth = ring.thickness * (1 + normalizedFrequency * 0.5)
      ctx.stroke()

      // Add glow effect for high frequencies
      if (normalizedFrequency > 0.6) {
        ctx.shadowColor = ring.color
        ctx.shadowBlur = 20 * normalizedFrequency
        ctx.stroke()
        ctx.shadowBlur = 0
      }
    }

    // Draw connecting lines between rings
    if (i > 0) {
      const prevRing = rings[i - 1]
      const lineCount = 6
      const lineAngle = (Math.PI * 2) / lineCount
      
      for (let l = 0; l < lineCount; l++) {
        const angle = ring.rotation + l * lineAngle
        const x1 = centerX + Math.cos(angle) * prevRing.radius
        const y1 = centerY + Math.sin(angle) * prevRing.radius
        const x2 = centerX + Math.cos(angle) * ring.radius
        const y2 = centerY + Math.sin(angle) * ring.radius

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
        gradient.addColorStop(0, `${prevRing.color}33`)
        gradient.addColorStop(1, `${ring.color}33`)

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = gradient
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }
  })
} 