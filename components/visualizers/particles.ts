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
}

const particles: Particle[] = []
const maxParticles = 100

export const drawParticles = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  // Update and remove dead particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += Math.cos(p.angle) * p.speed
    p.y += Math.sin(p.angle) * p.speed
    p.life *= 0.95

    if (p.life < 0.1 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
      particles.splice(i, 1)
    }
  }

  // Create new particles based on frequency data
  const avgFrequency = getAverageFrequency(data, sensitivity)
  const spawnCount = Math.floor(avgFrequency * 5)

  for (let i = 0; i < spawnCount && particles.length < maxParticles; i++) {
    const freqIndex = Math.floor(Math.random() * data.length)
    const normalizedValue = applySensitivity(data[freqIndex], sensitivity)
    
    particles.push({
      x: width / 2,
      y: height / 2,
      size: normalizedValue * 10,
      speed: normalizedValue * 5,
      color: scheme.colors[Math.floor(Math.random() * scheme.colors.length)],
      angle: Math.random() * Math.PI * 2,
      life: 1
    })
  }

  // Draw particles
  particles.forEach(p => {
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    
    // Create gradient for each particle
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
    gradient.addColorStop(0, p.color)
    gradient.addColorStop(1, `${p.color}00`)
    
    ctx.fillStyle = gradient
    
    // Add glow effect based on particle life and frequency
    if (p.life > 0.8) {
      ctx.shadowColor = p.color
      ctx.shadowBlur = p.size * 2
      ctx.fill()
      ctx.shadowBlur = 0
    } else {
      ctx.fill()
    }
  })
} 