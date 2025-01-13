import type { DrawContext } from '@/components/visualizers/types'
import { applySensitivity, getAverageFrequency } from './utils'

interface Particle {
  x: number
  y: number
  size: number
  speed: number
  color: string
  angle: number
  life: number
  trail: { x: number; y: number }[]
  trailLength: number
}

const maxParticles = 150
const maxTrailLength = 10
let particles: Particle[] = []

export const drawParticles = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  // Clear canvas with solid background
  ctx.fillStyle = scheme.background || '#000000'
  ctx.fillRect(0, 0, width, height)

  const avgFrequency = getAverageFrequency(data, sensitivity)

  // Update and remove dead particles
  particles = particles.filter(p => {
    // Update position
    p.x += Math.cos(p.angle) * p.speed * (1 + avgFrequency)
    p.y += Math.sin(p.angle) * p.speed * (1 + avgFrequency)
    
    // Update trail
    p.trail.unshift({ x: p.x, y: p.y })
    if (p.trail.length > p.trailLength) {
      p.trail.pop()
    }
    
    // Update life based on frequency
    const freqIndex = Math.floor((p.x / width) * data.length)
    const normalizedValue = applySensitivity(data[freqIndex], sensitivity)
    p.life *= 0.97 - (normalizedValue * 0.02)
    
    return p.life > 0.1 && p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height
  })

  // Create new particles based on frequency data
  const spawnCount = Math.floor(avgFrequency * 8)
  for (let i = 0; i < spawnCount && particles.length < maxParticles; i++) {
    const freqIndex = Math.floor(Math.random() * data.length)
    const normalizedValue = applySensitivity(data[freqIndex], sensitivity)
    
    particles.push({
      x: width / 2,
      y: height / 2,
      size: 2 + (normalizedValue * 8),
      speed: 2 + (normalizedValue * 6),
      color: scheme.colors[Math.floor(Math.random() * scheme.colors.length)],
      angle: Math.random() * Math.PI * 2,
      life: 1,
      trail: [],
      trailLength: Math.floor(5 + (normalizedValue * maxTrailLength))
    })
  }

  // Draw background glow based on average frequency
  if (avgFrequency > 0.4) {
    const centerGlow = ctx.createRadialGradient(
      width/2, height/2, 0,
      width/2, height/2, Math.min(width, height) * 0.4
    )
    centerGlow.addColorStop(0, `${scheme.colors[0]}${Math.floor(avgFrequency * 40).toString(16).padStart(2, '0')}`)
    centerGlow.addColorStop(1, `${scheme.colors[0]}00`)
    
    ctx.fillStyle = centerGlow
    ctx.fillRect(0, 0, width, height)
  }

  // Draw particles with enhanced effects
  particles.forEach(p => {
    // Draw trail
    if (p.trail.length > 1) {
      ctx.beginPath()
      ctx.moveTo(p.trail[0].x, p.trail[0].y)
      
      for (let i = 1; i < p.trail.length; i++) {
        ctx.lineTo(p.trail[i].x, p.trail[i].y)
      }
      
      const gradient = ctx.createLinearGradient(
        p.trail[0].x, p.trail[0].y,
        p.trail[p.trail.length-1].x, p.trail[p.trail.length-1].y
      )
      gradient.addColorStop(0, `${p.color}${Math.floor(p.life * 255).toString(16).padStart(2, '0')}`)
      gradient.addColorStop(1, `${p.color}00`)
      
      ctx.strokeStyle = gradient
      ctx.lineWidth = p.size * 0.5
      ctx.stroke()
    }
    
    // Draw particle
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    
    // Create gradient for particle
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
    gradient.addColorStop(0, `${p.color}${Math.floor(p.life * 255).toString(16).padStart(2, '0')}`)
    gradient.addColorStop(1, `${p.color}00`)
    
    ctx.fillStyle = gradient
    
    // Add glow effect based on life and frequency
    const freqIndex = Math.floor((p.x / width) * data.length)
    const normalizedValue = applySensitivity(data[freqIndex], sensitivity)
    
    if (normalizedValue > 0.4 || p.life > 0.8) {
      ctx.shadowColor = p.color
      ctx.shadowBlur = p.size * (1 + normalizedValue)
      ctx.fill()
      ctx.shadowBlur = 0
    } else {
      ctx.fill()
    }
  })
} 