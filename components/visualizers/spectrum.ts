import type { DrawContext } from './types'
import { applySensitivity, getAverageFrequency } from './utils'

// Frequency band configuration
interface FrequencyBand {
  start: number
  end: number
  peak: number
  hold: number
}

const FREQ_BANDS = 32 // Number of frequency bands to display
let bands: FrequencyBand[] = []

export const drawSpectrum = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) * 0.35
  const avgFrequency = getAverageFrequency(data, sensitivity)

  // Initialize frequency bands if needed
  if (bands.length === 0) {
    bands = Array.from({ length: FREQ_BANDS }, (_, i) => ({
      // Use logarithmic scaling for frequency bands
      start: Math.floor(data.length * (Math.exp(i / FREQ_BANDS * Math.log(2)) - 1)),
      end: Math.floor(data.length * (Math.exp((i + 1) / FREQ_BANDS * Math.log(2)) - 1)),
      peak: 0,
      hold: 0
    }))
  }

  // Clear the entire canvas with solid background
  ctx.fillStyle = scheme.background || '#000000'
  ctx.fillRect(0, 0, width, height)

  // Draw subtle radial gradient for depth
  const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 2)
  bgGradient.addColorStop(0, `${scheme.colors[0]}22`)
  bgGradient.addColorStop(0.5, `${scheme.colors[0]}11`)
  bgGradient.addColorStop(1, `${scheme.colors[0]}00`)
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, width, height)

  // Animation and drawing constants
  const barWidth = (Math.PI * 2) / FREQ_BANDS
  const peakDecay = 0.98
  const peakHoldTime = 30

  ctx.save()
  ctx.translate(centerX, centerY)

  // Draw circular grid with better visibility
  const gridCircles = 4
  for (let i = 1; i <= gridCircles; i++) {
    ctx.beginPath()
    ctx.arc(0, 0, radius * (i / gridCircles), 0, Math.PI * 2)
    ctx.strokeStyle = `${scheme.colors[0]}33`
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // Process and draw each frequency band
  bands.forEach((band, i) => {
    // Calculate average value for this frequency band
    let sum = 0
    let count = 0
    for (let j = band.start; j < band.end; j++) {
      sum += data[j]
      count++
    }
    const avgValue = applySensitivity(sum / count, sensitivity)

    // Update peak with smoother decay
    if (avgValue > band.peak) {
      band.peak = avgValue
      band.hold = peakHoldTime
    } else {
      if (band.hold > 0) {
        band.hold--
      } else {
        band.peak = Math.max(0, band.peak * peakDecay)
      }
    }

    const angle = i * barWidth
    const bandRadius = radius * avgValue
    const peakRadius = radius * band.peak

    // Draw frequency band with improved gradient
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, bandRadius, angle, angle + barWidth * 0.8)
    ctx.lineTo(0, 0)

    // Create dynamic gradient based on frequency and amplitude
    const freqRatio = i / FREQ_BANDS
    const colorIndex = Math.floor(freqRatio * (scheme.colors.length - 1))
    const nextColorIndex = Math.min(colorIndex + 1, scheme.colors.length - 1)
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
    
    gradient.addColorStop(0, `${scheme.colors[colorIndex]}33`)
    gradient.addColorStop(avgValue, scheme.colors[colorIndex])
    gradient.addColorStop(1, `${scheme.colors[nextColorIndex]}11`)
    
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw peak marker with improved visibility
    ctx.beginPath()
    ctx.arc(
      Math.cos(angle + barWidth * 0.4) * peakRadius,
      Math.sin(angle + barWidth * 0.4) * peakRadius,
      2, 0, Math.PI * 2
    )
    ctx.fillStyle = scheme.colors[colorIndex]
    ctx.fill()

    // Add glow effect for high frequencies with better control
    if (avgValue > 0.7 || avgFrequency > 0.6) {
      ctx.shadowColor = scheme.colors[colorIndex]
      ctx.shadowBlur = 10 * Math.max(avgValue, avgFrequency)
      ctx.fill()
      ctx.shadowBlur = 0
    }
  })

  // Draw center circle with improved gradient
  const innerRadius = radius * 0.15 * (1 + avgFrequency * 0.2)
  ctx.beginPath()
  ctx.arc(0, 0, innerRadius, 0, Math.PI * 2)
  const centerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, innerRadius)
  centerGradient.addColorStop(0, scheme.colors[0])
  centerGradient.addColorStop(0.5, `${scheme.colors[0]}66`)
  centerGradient.addColorStop(1, `${scheme.colors[0]}00`)
  ctx.fillStyle = centerGradient
  
  if (avgFrequency > 0.5) {
    ctx.shadowColor = scheme.colors[0]
    ctx.shadowBlur = 15 * avgFrequency
    ctx.fill()
    ctx.shadowBlur = 0
  } else {
    ctx.fill()
  }

  ctx.restore()
} 