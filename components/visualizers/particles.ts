import type { DrawContext } from './types'

interface Particle {
  x: number
  y: number
  size: number
  speed: number
  color: string
  angle: number
}

const particles: Particle[] = []
const PARTICLE_COUNT = 100

export const drawParticles = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  // Initialize particles if needed
  if (particles.length === 0) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 4 + 1,
        speed: Math.random() * 2 + 0.5,
        color: scheme.colors[Math.floor(Math.random() * scheme.colors.length)],
        angle: Math.random() * Math.PI * 2
      })
    }
  }

  // Calculate average frequency for particle behavior
  const avgFrequency = data.reduce((sum, value) => sum + value, 0) / data.length
  const normalizedFrequency = (avgFrequency / 255) * sensitivity

  // Update and draw particles
  particles.forEach((particle, index) => {
    // Update position based on audio
    particle.x += Math.cos(particle.angle) * particle.speed * normalizedFrequency
    particle.y += Math.sin(particle.angle) * particle.speed * normalizedFrequency

    // Wrap around screen
    if (particle.x < 0) particle.x = width
    if (particle.x > width) particle.x = 0
    if (particle.y < 0) particle.y = height
    if (particle.y > height) particle.y = 0

    // Draw particle
    ctx.beginPath()
    ctx.arc(
      particle.x,
      particle.y,
      particle.size * normalizedFrequency,
      0,
      Math.PI * 2
    )
    ctx.fillStyle = particle.color
    ctx.fill()

    // Randomly change direction
    if (Math.random() < 0.01) {
      particle.angle = Math.random() * Math.PI * 2
    }

    // Update color based on frequency
    const colorIndex = Math.floor((index / particles.length) * scheme.colors.length)
    particle.color = scheme.colors[colorIndex]
  })
} 