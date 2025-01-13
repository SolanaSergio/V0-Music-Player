import type { DrawContext } from '@/components/visualizers/types'
import { applySensitivity, getAverageFrequency } from './utils'

interface Orbiter {
  angle: number
  radius: number
  speed: number
  size: number
  color: string
}

const orbiters: Orbiter[] = []
const maxOrbiters = 50

export const drawOrbit = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const centerX = width / 2
  const centerY = height / 2
  const baseRadius = Math.min(width, height) * 0.3

  // Update existing orbiters
  for (let i = orbiters.length - 1; i >= 0; i--) {
    const orbiter = orbiters[i]
    orbiter.angle += orbiter.speed
    
    // Remove orbiters that have completed several orbits
    if (orbiter.angle > Math.PI * 8) {
      orbiters.splice(i, 1)
    }
  }

  // Create new orbiters based on frequency data
  const avgFrequency = getAverageFrequency(data, sensitivity)
  const spawnCount = Math.floor(avgFrequency * 3)

  for (let i = 0; i < spawnCount && orbiters.length < maxOrbiters; i++) {
    const freqIndex = Math.floor(Math.random() * data.length)
    const normalizedValue = applySensitivity(data[freqIndex], sensitivity)
    
    orbiters.push({
      angle: 0,
      radius: baseRadius * (0.5 + normalizedValue * 0.5),
      speed: 0.02 + normalizedValue * 0.03,
      size: 2 + normalizedValue * 8,
      color: scheme.colors[Math.floor(Math.random() * scheme.colors.length)]
    })
  }

  // Draw orbit paths
  ctx.beginPath()
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath()
    ctx.arc(centerX, centerY, baseRadius * (i / 3), 0, Math.PI * 2)
    ctx.strokeStyle = `${scheme.colors[i % scheme.colors.length]}33`
    ctx.stroke()
  }

  // Draw orbiters with trails
  orbiters.forEach(orbiter => {
    const x = centerX + Math.cos(orbiter.angle) * orbiter.radius
    const y = centerY + Math.sin(orbiter.angle) * orbiter.radius

    // Draw trail
    const trailGradient = ctx.createLinearGradient(
      centerX + Math.cos(orbiter.angle - 0.5) * orbiter.radius,
      centerY + Math.sin(orbiter.angle - 0.5) * orbiter.radius,
      x, y
    )
    trailGradient.addColorStop(0, `${orbiter.color}00`)
    trailGradient.addColorStop(1, `${orbiter.color}66`)

    ctx.beginPath()
    ctx.strokeStyle = trailGradient
    ctx.lineWidth = orbiter.size / 2
    ctx.moveTo(
      centerX + Math.cos(orbiter.angle - 0.5) * orbiter.radius,
      centerY + Math.sin(orbiter.angle - 0.5) * orbiter.radius
    )
    ctx.lineTo(x, y)
    ctx.stroke()

    // Draw orbiter
    ctx.beginPath()
    ctx.arc(x, y, orbiter.size, 0, Math.PI * 2)
    
    // Create gradient for orbiter
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, orbiter.size)
    gradient.addColorStop(0, orbiter.color)
    gradient.addColorStop(1, `${orbiter.color}33`)
    
    ctx.fillStyle = gradient

    // Add glow effect based on frequency
    if (avgFrequency > 0.6) {
      ctx.shadowColor = orbiter.color
      ctx.shadowBlur = orbiter.size * avgFrequency
      ctx.fill()
      ctx.shadowBlur = 0
    } else {
      ctx.fill()
    }
  })
} 