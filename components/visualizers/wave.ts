import type { DrawContext } from '@/components/visualizers/types'
import { applySensitivity, getAverageFrequency } from './utils'

// Wave properties for physics simulation
interface WavePoint {
  amplitude: number
  velocity: number
  phase: number
}

let wavePoints: WavePoint[] = []
let time = 0

export const drawWave = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const numPoints = 100 // Number of points in the wave
  const avgFrequency = getAverageFrequency(data, sensitivity)
  
  // Initialize wave points if needed
  if (wavePoints.length !== numPoints) {
    wavePoints = Array.from({ length: numPoints }, () => ({
      amplitude: 0,
      velocity: 0,
      phase: Math.random() * Math.PI * 2
    }))
  }

  // Clear canvas with solid background
  ctx.fillStyle = scheme.background || '#000000'
  ctx.fillRect(0, 0, width, height)

  // Add subtle gradient overlay
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
  bgGradient.addColorStop(0, `${scheme.colors[0]}11`)
  bgGradient.addColorStop(1, `${scheme.colors[0]}00`)
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, width, height)

  // Update wave physics
  const dampening = 0.98
  const tension = 0.03
  const frequencyInfluence = applySensitivity(avgFrequency, sensitivity) * 2
  time += 0.05

  // Create multiple wave layers
  const layers = 3
  for (let layer = 0; layer < layers; layer++) {
    const layerOffset = height / 2 + (layer - 1) * 40
    const points: [number, number][] = []
    
    // Calculate wave points
    for (let i = 0; i < numPoints; i++) {
      const point = wavePoints[i]
      const freqIndex = Math.floor((i / numPoints) * data.length)
      const normalizedValue = applySensitivity(data[freqIndex], sensitivity)
      
      // Apply wave physics
      const targetAmplitude = normalizedValue * 100 * (1 - layer * 0.3)
      const force = (targetAmplitude - point.amplitude) * tension
      point.velocity += force
      point.velocity *= dampening
      point.amplitude += point.velocity
      
      // Calculate final y position with various wave components
      const x = (i / (numPoints - 1)) * width
      const baseY = layerOffset + 
        point.amplitude * Math.sin(time + point.phase) +
        20 * Math.sin(time * 2 + x / width * Math.PI * 2) * frequencyInfluence
      
      points.push([x, baseY])
    }

    // Draw the wave
    ctx.beginPath()
    ctx.lineWidth = 2 * (layers - layer)
    
    // Create dynamic gradient based on frequency
    const gradient = ctx.createLinearGradient(0, height/2 - 100, 0, height/2 + 100)
    const alpha = Math.min(0.8, 0.3 + frequencyInfluence * 0.5)
    gradient.addColorStop(0, `${scheme.colors[layer]}00`)
    gradient.addColorStop(0.5, `${scheme.colors[layer]}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`)
    gradient.addColorStop(1, `${scheme.colors[layer]}00`)
    ctx.strokeStyle = gradient
    
    // Draw smooth curve through points
    ctx.moveTo(points[0][0], points[0][1])
    for (let i = 1; i < points.length - 2; i++) {
      const xc = (points[i][0] + points[i + 1][0]) / 2
      const yc = (points[i][1] + points[i + 1][1]) / 2
      ctx.quadraticCurveTo(points[i][0], points[i][1], xc, yc)
    }
    ctx.quadraticCurveTo(
      points[points.length - 2][0],
      points[points.length - 2][1],
      points[points.length - 1][0],
      points[points.length - 1][1]
    )
    
    // Add glow effect based on frequency
    if (frequencyInfluence > 0.6) {
      ctx.shadowColor = scheme.colors[layer]
      ctx.shadowBlur = 15 * frequencyInfluence
      ctx.stroke()
      ctx.shadowBlur = 0
    } else {
      ctx.stroke()
    }

    // Draw reflection (subtle)
    ctx.globalAlpha = 0.2
    ctx.scale(1, -0.3) // Flip and scale for reflection
    ctx.translate(0, -height * 2.8)
    ctx.stroke()
    ctx.setTransform(1, 0, 0, 1, 0, 0) // Reset transform
    ctx.globalAlpha = 1.0
  }
} 