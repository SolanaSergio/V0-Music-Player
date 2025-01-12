import type { DrawContext } from '@/components/visualizers/types'

export const drawWave = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  ctx.lineWidth = 2
  ctx.strokeStyle = scheme.colors[0]
  ctx.beginPath()

  const sliceWidth = width / data.length
  let x = 0

  for (let i = 0; i < data.length; i++) {
    const v = data[i] / 128.0
    const y = (v * height / 2) * sensitivity

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }

    x += sliceWidth
  }

  ctx.lineTo(width, height / 2)
  ctx.stroke()
} 