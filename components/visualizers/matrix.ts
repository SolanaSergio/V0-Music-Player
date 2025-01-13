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

const symbolSize = 20
const maxSymbols = 200
let symbols: Symbol[] = []

const getRandomSymbol = () => {
  const chars = '0123456789ABCDEF'
  return chars[Math.floor(Math.random() * chars.length)]
}

export const drawMatrix = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const columns = Math.floor(width / symbolSize)
  const avgFrequency = getAverageFrequency(data, sensitivity)

  // Clear canvas with solid background
  ctx.fillStyle = scheme.background || '#000000'
  ctx.fillRect(0, 0, width, height)

  // Update existing symbols
  symbols = symbols.filter(symbol => {
    // Calculate frequency index and normalized value based on x position
    const symbolFreqIndex = Math.floor((symbol.x / width) * data.length)
    const symbolNormalizedValue = applySensitivity(data[symbolFreqIndex], sensitivity)

    // Update position and properties
    symbol.y += symbol.speed * (1 + symbolNormalizedValue)
    symbol.opacity = Math.max(0, symbol.opacity - (0.005 + avgFrequency * 0.005))
    
    // Randomly change symbol value
    if (Math.random() < 0.05) {
      symbol.value = getRandomSymbol()
    }
    
    return symbol.opacity > 0 && symbol.y < height
  })

  // Create new symbols based on frequency
  const spawnCount = Math.floor(avgFrequency * 8)
  for (let i = 0; i < spawnCount && symbols.length < maxSymbols; i++) {
    const x = Math.floor(Math.random() * columns) * symbolSize
    const freqIndex = Math.floor((x / width) * data.length)
    const normalizedValue = applySensitivity(data[freqIndex], sensitivity)
    
    symbols.push({
      x,
      y: 0,
      value: getRandomSymbol(),
      speed: 2 + (normalizedValue * 4),
      opacity: 0.9,
      color: scheme.colors[Math.floor(Math.random() * scheme.colors.length)]
    })
  }

  // Draw symbols with enhanced effects
  ctx.save()
  symbols.forEach(symbol => {
    const symbolFreqIndex = Math.floor((symbol.x / width) * data.length)
    const symbolNormalizedValue = applySensitivity(data[symbolFreqIndex], sensitivity)
    
    // Create gradient for trailing effect
    const gradient = ctx.createLinearGradient(
      symbol.x, symbol.y - symbolSize * 2,
      symbol.x, symbol.y
    )
    gradient.addColorStop(0, `${symbol.color}00`)
    gradient.addColorStop(1, `${symbol.color}${Math.floor(symbol.opacity * 255).toString(16).padStart(2, '0')}`)
    
    // Apply glow effect based on frequency
    if (symbolNormalizedValue > 0.4) {
      ctx.shadowColor = symbol.color
      ctx.shadowBlur = 10 * symbolNormalizedValue * symbol.opacity
    } else {
      ctx.shadowBlur = 0
    }
    
    ctx.font = `${symbolSize}px monospace`
    ctx.textAlign = 'center'
    ctx.fillStyle = gradient
    ctx.fillText(symbol.value, symbol.x + symbolSize / 2, symbol.y)
  })
  ctx.restore()
} 