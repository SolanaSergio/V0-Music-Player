import type { DrawContext } from './types'

interface Orbiter {
  angle: number
  radius: number
  speed: number
  size: number
  color: string
}

const orbiters: Orbiter[] = []
const ORBITER_COUNT = 24

export const drawOrbit = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const centerX = width / 2
  const centerY = height / 2
  const maxRadius = Math.min(width, height) * 0.4

  // Initialize orbiters if needed
  if (orbiters.length === 0) {
    for (let i = 0; i < ORBITER_COUNT; i++) {
      orbiters.push({
        angle: (i / ORBITER_COUNT) * Math.PI * 2,
        radius: maxRadius * (0.3 + Math.random() * 0.7),
        speed: 0.02 + Math.random() * 0.03,
        size: 2 + Math.random() * 4,
        color: scheme.colors[i % scheme.colors.length]
      })
    }
  }

  // Calculate frequency bands
  const bandSize = Math.floor(data.length / ORBITER_COUNT)
  const frequencyBands = Array.from({ length: ORBITER_COUNT }, (_, i) => {
    const start = i * bandSize
    const end = start + bandSize
    return Array.from(data.slice(start, end)).reduce((a, b) => a + b, 0) / bandSize
  })

  // Update and draw orbiters
  orbiters.forEach((orbiter, i) => {
    const normalizedFrequency = (frequencyBands[i] / 255) * sensitivity
    
    // Update orbiter
    orbiter.angle += orbiter.speed * normalizedFrequency
    orbiter.color = scheme.colors[i % scheme.colors.length]

    // Calculate position
    const x = centerX + Math.cos(orbiter.angle) * orbiter.radius
    const y = centerY + Math.sin(orbiter.angle) * orbiter.radius

    // Draw orbiter
    ctx.beginPath()
    ctx.arc(x, y, orbiter.size * normalizedFrequency, 0, Math.PI * 2)
    ctx.fillStyle = orbiter.color
    ctx.fill()

    // Draw trail
    ctx.beginPath()
    ctx.moveTo(x, y)
    const trailLength = 0.5 // Half a circle
    for (let t = 0; t < trailLength; t += 0.1) {
      const trailAngle = orbiter.angle - t
      const trailX = centerX + Math.cos(trailAngle) * orbiter.radius
      const trailY = centerY + Math.sin(trailAngle) * orbiter.radius
      ctx.lineTo(trailX, trailY)
    }
    
    const gradient = ctx.createLinearGradient(x, y, 
      centerX + Math.cos(orbiter.angle - trailLength) * orbiter.radius,
      centerY + Math.sin(orbiter.angle - trailLength) * orbiter.radius
    )
    gradient.addColorStop(0, orbiter.color)
    gradient.addColorStop(1, `${orbiter.color}00`)
    
    ctx.strokeStyle = gradient
    ctx.lineWidth = orbiter.size * normalizedFrequency * 0.5
    ctx.stroke()
  })
} 