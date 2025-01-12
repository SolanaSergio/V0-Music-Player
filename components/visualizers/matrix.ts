import type { DrawContext } from './types'

interface Symbol {
  x: number
  y: number
  value: string
  speed: number
  opacity: number
}

const symbols: Symbol[] = []
const SYMBOL_SIZE = 14
const SYMBOLS = '日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ012345789Z:'

export const drawMatrix = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  // Set up text rendering
  ctx.font = `${SYMBOL_SIZE}px monospace`
  ctx.textAlign = 'center'

  // Calculate columns
  const columns = Math.floor(width / SYMBOL_SIZE)
  
  // Initialize symbols if needed
  if (symbols.length === 0) {
    for (let i = 0; i < columns; i++) {
      symbols.push({
        x: i * SYMBOL_SIZE,
        y: Math.random() * height,
        value: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        speed: 1 + Math.random() * 2,
        opacity: Math.random()
      })
    }
  }

  // Calculate frequency bands for columns
  const bandSize = Math.floor(data.length / columns)
  const frequencyBands = Array.from({ length: columns }, (_, i) => {
    const start = i * bandSize
    const end = start + bandSize
    return Array.from(data.slice(start, end)).reduce((a, b) => a + b, 0) / bandSize
  })

  // Update and draw symbols
  symbols.forEach((symbol, i) => {
    // Update position based on frequency
    const normalizedFrequency = (frequencyBands[i] / 255) * sensitivity
    symbol.y += symbol.speed * (1 + normalizedFrequency)
    
    // Reset position if off screen
    if (symbol.y > height) {
      symbol.y = 0
      symbol.x = i * SYMBOL_SIZE
      symbol.value = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      symbol.opacity = Math.random()
    }

    // Randomly change symbol
    if (Math.random() < 0.02) {
      symbol.value = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    }

    // Draw symbol with color based on frequency
    const colorIndex = Math.floor(normalizedFrequency * scheme.colors.length)
    const color = scheme.colors[colorIndex] || scheme.colors[0]
    
    // Create gradient effect
    const gradient = ctx.createLinearGradient(
      symbol.x,
      symbol.y - SYMBOL_SIZE,
      symbol.x,
      symbol.y + SYMBOL_SIZE
    )
    gradient.addColorStop(0, `${color}00`)
    gradient.addColorStop(0.5, `${color}${Math.floor(symbol.opacity * 255).toString(16).padStart(2, '0')}`)
    gradient.addColorStop(1, `${color}00`)

    ctx.fillStyle = gradient
    ctx.fillText(symbol.value, symbol.x, symbol.y)

    // Add glow effect for high frequencies
    if (normalizedFrequency > 0.7) {
      ctx.shadowColor = color
      ctx.shadowBlur = 10 * normalizedFrequency
      ctx.fillText(symbol.value, symbol.x, symbol.y)
      ctx.shadowBlur = 0
    }
  })
} 