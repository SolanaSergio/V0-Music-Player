import type { DrawContext } from './types'

interface Star {
  x: number
  y: number
  size: number
  angle: number
  speed: number
  color: string
  life: number
  maxLife: number
}

const stars: Star[] = []
const MAX_STARS = 100

export const drawStarburst = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const centerX = width / 2
  const centerY = height / 2

  // Calculate average frequency for intensity
  const avgFrequency = data.reduce((sum, value) => sum + value, 0) / data.length
  const normalizedFrequency = (avgFrequency / 255) * sensitivity

  // Create new stars based on audio intensity
  if (normalizedFrequency > 0.5 && stars.length < MAX_STARS) {
    const burstCount = Math.floor(normalizedFrequency * 5)
    for (let i = 0; i < burstCount; i++) {
      stars.push({
        x: centerX,
        y: centerY,
        size: 2 + Math.random() * 4,
        angle: Math.random() * Math.PI * 2,
        speed: (2 + Math.random() * 4) * normalizedFrequency,
        color: scheme.colors[Math.floor(Math.random() * scheme.colors.length)],
        life: 1,
        maxLife: 0.7 + Math.random() * 0.3
      })
    }
  }

  // Update and draw stars
  for (let i = stars.length - 1; i >= 0; i--) {
    const star = stars[i]
    
    // Update position
    star.x += Math.cos(star.angle) * star.speed
    star.y += Math.sin(star.angle) * star.speed
    
    // Update life
    star.life -= 0.01
    
    if (star.life <= 0 || 
        star.x < 0 || star.x > width || 
        star.y < 0 || star.y > height) {
      stars.splice(i, 1)
      continue
    }

    // Draw star
    const opacity = (star.life / star.maxLife).toFixed(2)
    ctx.beginPath()
    
    // Star shape
    const points = 5
    const outerRadius = star.size * (1 + normalizedFrequency)
    const innerRadius = outerRadius * 0.5
    
    for (let p = 0; p < points * 2; p++) {
      const radius = p % 2 === 0 ? outerRadius : innerRadius
      const pointAngle = (p * Math.PI) / points
      const px = star.x + Math.cos(pointAngle) * radius
      const py = star.y + Math.sin(pointAngle) * radius
      
      if (p === 0) {
        ctx.moveTo(px, py)
      } else {
        ctx.lineTo(px, py)
      }
    }
    
    ctx.closePath()
    
    // Fill with gradient
    const gradient = ctx.createRadialGradient(
      star.x, star.y, 0,
      star.x, star.y, outerRadius
    )
    gradient.addColorStop(0, `${star.color}${Math.floor(Number(opacity) * 255).toString(16).padStart(2, '0')}`)
    gradient.addColorStop(1, `${star.color}00`)
    
    ctx.fillStyle = gradient
    ctx.fill()
    
    // Add glow effect
    ctx.shadowColor = star.color
    ctx.shadowBlur = 10 * normalizedFrequency
    ctx.fill()
    ctx.shadowBlur = 0
  }
} 