import type { DrawContext } from '@/components/visualizers/types'
import { applySensitivity, getAverageFrequency } from './utils'

interface Star {
  x: number
  y: number
  angle: number
  speed: number
  length: number
  opacity: number
  color: string
}

const maxStars = 150
let stars: Star[] = []

export const drawStarburst = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const centerX = width / 2
  const centerY = height / 2
  // Adjust frequency sensitivity
  const smoothedSensitivity = Math.sqrt(sensitivity) * 0.8
  const avgFrequency = getAverageFrequency(data, smoothedSensitivity)
  const maxLength = Math.min(width, height) * 0.5

  // Clear canvas with solid background
  ctx.fillStyle = scheme.background || '#000000'
  ctx.fillRect(0, 0, width, height)

  // Update existing stars
  stars = stars.filter(star => {
    // Update position
    star.x = centerX + Math.cos(star.angle) * star.length
    star.y = centerY + Math.sin(star.angle) * star.length
    
    // Update length and opacity with smoother decay
    star.length += star.speed * (1 + avgFrequency)
    star.opacity *= 0.98 - (avgFrequency * 0.01)
    
    return star.opacity > 0.1 && star.length < maxLength
  })

  // Create new stars based on audio intensity
  const spawnCount = Math.floor(avgFrequency * 8 * smoothedSensitivity)
  for (let i = 0; i < spawnCount && stars.length < maxStars; i++) {
    const freqIndex = Math.floor(Math.random() * data.length)
    const normalizedValue = applySensitivity(data[freqIndex], smoothedSensitivity)
    
    stars.push({
      x: centerX,
      y: centerY,
      angle: Math.random() * Math.PI * 2,
      speed: 2 + (normalizedValue * 4 * smoothedSensitivity),
      length: 0,
      opacity: 0.8 + (normalizedValue * 0.2),
      color: scheme.colors[Math.floor(Math.random() * scheme.colors.length)]
    })
  }

  // Draw background glow based on average frequency
  if (avgFrequency > 0.2) {
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, maxLength * avgFrequency
    )
    gradient.addColorStop(0, `${scheme.colors[0]}40`)
    gradient.addColorStop(1, `${scheme.colors[0]}00`)
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }

  // Draw stars with enhanced trails
  stars.forEach(star => {
    // Draw trail with improved gradient
    const trailGradient = ctx.createLinearGradient(
      centerX, centerY,
      star.x, star.y
    )
    const startAlpha = Math.floor(star.opacity * 60).toString(16).padStart(2, '0')
    const endAlpha = Math.floor(star.opacity * 200).toString(16).padStart(2, '0')
    
    trailGradient.addColorStop(0, `${star.color}${startAlpha}`)
    trailGradient.addColorStop(0.4, `${star.color}${endAlpha}`)
    trailGradient.addColorStop(1, `${star.color}${startAlpha}`)
    
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(star.x, star.y)
    ctx.strokeStyle = trailGradient
    ctx.lineWidth = 1.5 + (star.opacity * 2)
    ctx.stroke()

    // Draw star point with enhanced glow
    if (avgFrequency > 0.2) {
      ctx.shadowColor = star.color
      ctx.shadowBlur = 10 * avgFrequency * star.opacity
    }
    
    ctx.beginPath()
    ctx.arc(star.x, star.y, 1.5 + (star.opacity * 2), 0, Math.PI * 2)
    ctx.fillStyle = star.color
    ctx.fill()
    
    ctx.shadowBlur = 0
  })

  // Draw center burst with enhanced effects
  const burstSize = 10 + (avgFrequency * 20 * smoothedSensitivity)
  const burstGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, burstSize
  )
  
  // Create multi-color burst effect
  scheme.colors.forEach((color, index) => {
    const alpha = Math.floor((0.8 - (index * 0.15)) * 255).toString(16).padStart(2, '0')
    burstGradient.addColorStop(index / (scheme.colors.length - 1), `${color}${alpha}`)
  })

  if (avgFrequency > 0.2) {
    ctx.shadowColor = scheme.colors[0]
    ctx.shadowBlur = 20 * avgFrequency * smoothedSensitivity
  }

  ctx.beginPath()
  ctx.arc(centerX, centerY, burstSize, 0, Math.PI * 2)
  ctx.fillStyle = burstGradient
  ctx.fill()

  ctx.shadowBlur = 0
} 