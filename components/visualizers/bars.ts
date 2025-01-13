import type { DrawContext } from '@/components/visualizers/types'
import { applySensitivity, getAverageFrequency } from './utils'

export const drawBars = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const barWidth = (width / data.length) * 2.5
  const avgFrequency = getAverageFrequency(data, sensitivity)
  let x = 0

  // Draw bars
  for (let i = 0; i < data.length; i++) {
    const normalizedValue = applySensitivity(data[i], sensitivity)
    const barHeight = normalizedValue * height
    const colorIndex = Math.floor((i / data.length) * scheme.colors.length)
    const color = scheme.colors[colorIndex]

    // Create gradient for bar
    const gradient = ctx.createLinearGradient(x, height, x, height - barHeight)
    gradient.addColorStop(0, `${color}99`) // 60% opacity at bottom
    gradient.addColorStop(1, color) // Full opacity at top

    ctx.fillStyle = gradient

    // Add glow effect based on both individual and average frequency
    if (normalizedValue > 0.7 || avgFrequency > 0.6) {
      ctx.shadowColor = color
      ctx.shadowBlur = 15 * Math.max(normalizedValue, avgFrequency)
      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight)
      ctx.shadowBlur = 0
    } else {
      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight)
    }

    x += barWidth + 1
  }
} 