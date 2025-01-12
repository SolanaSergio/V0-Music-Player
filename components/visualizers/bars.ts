import type { DrawContext } from '@/components/visualizers/types'

export const drawBars = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const barWidth = (width / data.length) * 2.5
  let x = 0

  for (let i = 0; i < data.length; i++) {
    const barHeight = data[i] * sensitivity
    const colorIndex = Math.floor((i / data.length) * scheme.colors.length)
    ctx.fillStyle = scheme.colors[colorIndex]
    ctx.fillRect(x, height - barHeight, barWidth, barHeight)
    x += barWidth + 1
  }
} 