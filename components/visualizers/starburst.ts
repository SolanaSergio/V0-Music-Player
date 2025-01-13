import type { DrawContext } from '@/components/visualizers/types'
import { applySensitivity, getAverageFrequency } from './utils'

interface Star {
  angle: number
  length: number
  speed: number
  color: string
  opacity: number
}

const stars: Star[] = []
const maxStars = 100

export const drawStarburst = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const centerX = width / 2
  const centerY = height / 2
  const maxLength = Math.min(width, height) * 0.5

  // Update existing stars
  for (let i = stars.length - 1; i >= 0; i--) {
    const star = stars[i]
    star.length += star.speed
    star.opacity -= 0.01

    // Remove stars that are too long or faded
    if (star.length > maxLength || star.opacity <= 0) {
      stars.splice(i, 1)
    }
  }

  // Create new stars based on frequency data
  const avgFrequency = getAverageFrequency(data, sensitivity)
  const spawnCount = Math.floor(avgFrequency * 3)

  for (let i = 0; i < spawnCount && stars.length < maxStars; i++) {
    const freqIndex = Math.floor(Math.random() * data.length)
    const normalizedValue = applySensitivity(data[freqIndex], sensitivity)
    
    stars.push({
      angle: Math.random() * Math.PI * 2,
      length: 0,
      speed: 2 + normalizedValue * 8,
      color: scheme.colors[Math.floor(Math.random() * scheme.colors.length)],
      opacity: 0.8 + Math.random() * 0.2
    })
  }

  // Draw background glow
  if (avgFrequency > 0.5) {
    const glowRadius = maxLength * avgFrequency
    const glow = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, glowRadius
    )
    glow.addColorStop(0, `${scheme.colors[0]}33`)
    glow.addColorStop(1, `${scheme.colors[0]}00`)
    
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, width, height)
  }

  // Draw stars with trails
  stars.forEach(star => {
    const endX = centerX + Math.cos(star.angle) * star.length
    const endY = centerY + Math.sin(star.angle) * star.length

    // Draw trail
    const gradient = ctx.createLinearGradient(
      centerX, centerY,
      endX, endY
    )
    gradient.addColorStop(0, `${star.color}00`)
    gradient.addColorStop(0.5, `${star.color}${Math.floor(star.opacity * 255).toString(16).padStart(2, '0')}`)
    gradient.addColorStop(1, `${star.color}00`)

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(endX, endY)
    ctx.strokeStyle = gradient
    ctx.lineWidth = 2 + avgFrequency * 3

    // Add glow effect based on frequency
    if (avgFrequency > 0.6) {
      ctx.shadowColor = star.color
      ctx.shadowBlur = 10 * avgFrequency
      ctx.stroke()
      ctx.shadowBlur = 0
    } else {
      ctx.stroke()
    }
  })

  // Draw center burst
  const burstRadius = 20 + avgFrequency * 30
  const burstGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, burstRadius
  )
  burstGradient.addColorStop(0, scheme.colors[0])
  burstGradient.addColorStop(0.5, `${scheme.colors[0]}66`)
  burstGradient.addColorStop(1, `${scheme.colors[0]}00`)

  ctx.fillStyle = burstGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, burstRadius, 0, Math.PI * 2)
  ctx.fill()
} 