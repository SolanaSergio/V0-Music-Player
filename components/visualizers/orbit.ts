import type { DrawContext } from '@/components/visualizers/types'
import { applySensitivity, getAverageFrequency } from './utils'

interface Orbiter {
  angle: number
  radius: number
  speed: number
  size: number
  color: string
  trail: { x: number; y: number }[]
}

const maxOrbiters = 50
const maxTrailLength = 20
let orbiters: Orbiter[] = []

export const drawOrbit = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const centerX = width / 2
  const centerY = height / 2
  const avgFrequency = getAverageFrequency(data, sensitivity)
  const baseRadius = Math.min(width, height) * 0.3

  // Clear canvas with solid background
  ctx.fillStyle = scheme.background || '#000000'
  ctx.fillRect(0, 0, width, height)

  // Update existing orbiters
  orbiters = orbiters.filter(orbiter => {
    // Update position
    orbiter.angle += orbiter.speed * (1 + avgFrequency)
    
    // Calculate new position
    const x = centerX + Math.cos(orbiter.angle) * orbiter.radius
    const y = centerY + Math.sin(orbiter.angle) * orbiter.radius
    
    // Update trail
    orbiter.trail.push({ x, y })
    if (orbiter.trail.length > maxTrailLength) {
      orbiter.trail.shift()
    }
    
    return true // Keep all orbiters
  })

  // Create new orbiters based on frequency
  const spawnCount = Math.floor(avgFrequency * 5)
  for (let i = 0; i < spawnCount && orbiters.length < maxOrbiters; i++) {
    const freqIndex = Math.floor(Math.random() * data.length)
    const normalizedValue = applySensitivity(data[freqIndex], sensitivity)
    
    orbiters.push({
      angle: Math.random() * Math.PI * 2,
      radius: baseRadius * (0.5 + normalizedValue * 1.5),
      speed: (0.02 + normalizedValue * 0.04) * (Math.random() > 0.5 ? 1 : -1),
      size: 2 + normalizedValue * 6,
      color: scheme.colors[Math.floor(Math.random() * scheme.colors.length)],
      trail: []
    })
  }

  // Draw orbit paths with enhanced glow
  ctx.strokeStyle = `${scheme.colors[0]}33`
  ctx.lineWidth = 1
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath()
    ctx.arc(centerX, centerY, baseRadius * i * 0.5, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Draw orbiters and trails
  orbiters.forEach(orbiter => {
    // Draw trail with gradient
    if (orbiter.trail.length > 1) {
      ctx.beginPath()
      ctx.moveTo(orbiter.trail[0].x, orbiter.trail[0].y)
      
      for (let i = 1; i < orbiter.trail.length; i++) {
        const t = i / orbiter.trail.length
        ctx.lineTo(orbiter.trail[i].x, orbiter.trail[i].y)
        ctx.strokeStyle = `${orbiter.color}${Math.floor(t * 255).toString(16).padStart(2, '0')}`
        ctx.lineWidth = orbiter.size * (1 - t * 0.7)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(orbiter.trail[i].x, orbiter.trail[i].y)
      }
    }

    // Draw orbiter with glow
    const x = orbiter.trail[orbiter.trail.length - 1]?.x
    const y = orbiter.trail[orbiter.trail.length - 1]?.y
    
    if (x !== undefined && y !== undefined) {
      if (avgFrequency > 0.4) {
        ctx.shadowColor = orbiter.color
        ctx.shadowBlur = 10 * avgFrequency
      }
      
      ctx.beginPath()
      ctx.arc(x, y, orbiter.size, 0, Math.PI * 2)
      ctx.fillStyle = orbiter.color
      ctx.fill()
      
      ctx.shadowBlur = 0
    }
  })
} 