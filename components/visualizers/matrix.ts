import type { DrawContext } from '@/components/visualizers/types'
import { applySensitivity, getAverageFrequency } from './utils'

interface Symbol {
  x: number
  y: number
  value: string
  speed: number
  opacity: number
  color: string
}

const symbols: Symbol[] = []
const maxSymbols = 300
const symbolSize = 14
const possibleChars = '0123456789ABCDEF'

export const drawMatrix = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const columns = Math.floor(width / symbolSize)
  const rows = Math.floor(height / symbolSize)

  // Update existing symbols
  for (let i = symbols.length - 1; i >= 0; i--) {
    const symbol = symbols[i]
    symbol.y += symbol.speed
    symbol.opacity -= 0.005

    // Randomly change symbol value
    if (Math.random() < 0.1) {
      symbol.value = possibleChars[Math.floor(Math.random() * possibleChars.length)]
    }

    // Remove symbols that are off screen or faded
    if (symbol.y > height || symbol.opacity <= 0 || symbol.y > rows * symbolSize) {
      symbols.splice(i, 1)
    }
  }

  // Create new symbols based on frequency data
  const avgFrequency = getAverageFrequency(data, sensitivity)
  const spawnCount = Math.floor(avgFrequency * 5)

  for (let i = 0; i < spawnCount && symbols.length < maxSymbols; i++) {
    const freqIndex = Math.floor(Math.random() * data.length)
    const normalizedValue = applySensitivity(data[freqIndex], sensitivity)
    
    symbols.push({
      x: Math.floor(Math.random() * columns) * symbolSize,
      y: -symbolSize,
      value: possibleChars[Math.floor(Math.random() * possibleChars.length)],
      speed: 1 + normalizedValue * 5,
      opacity: 0.8 + Math.random() * 0.2,
      color: scheme.colors[Math.floor(Math.random() * scheme.colors.length)]
    })
  }

  // Clear canvas with fade effect
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
  ctx.fillRect(0, 0, width, height)

  // Draw symbols
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `${symbolSize}px monospace`

  symbols.forEach(symbol => {
    // Create gradient for each symbol
    const gradient = ctx.createLinearGradient(
      symbol.x,
      symbol.y - symbolSize,
      symbol.x,
      symbol.y + symbolSize
    )
    gradient.addColorStop(0, `${symbol.color}00`)
    gradient.addColorStop(0.5, `${symbol.color}${Math.floor(symbol.opacity * 255).toString(16).padStart(2, '0')}`)
    gradient.addColorStop(1, `${symbol.color}33`)

    ctx.fillStyle = gradient

    // Add glow effect based on frequency
    if (avgFrequency > 0.6) {
      ctx.shadowColor = symbol.color
      ctx.shadowBlur = 10 * avgFrequency
      ctx.fillText(symbol.value, symbol.x + symbolSize/2, symbol.y)
      ctx.shadowBlur = 0
    } else {
      ctx.fillText(symbol.value, symbol.x + symbolSize/2, symbol.y)
    }
  })

  // Draw frequency bars in background
  const barWidth = width / data.length
  ctx.globalAlpha = 0.1
  
  for (let i = 0; i < data.length; i++) {
    const normalizedValue = applySensitivity(data[i], sensitivity)
    const barHeight = height * normalizedValue * 0.5

    const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height)
    gradient.addColorStop(0, `${scheme.colors[0]}00`)
    gradient.addColorStop(1, scheme.colors[0])

    ctx.fillStyle = gradient
    ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight)
  }
  
  ctx.globalAlpha = 1.0
} 