import type { DrawContext } from '@/components/visualizers/types'

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext
) => {
  const centerX = width / 2
  const centerY = height / 2
  const maxRadius = Math.min(width, height) / 3

  for (let i = 0; i < data.length; i++) {
    const radius = (data[i] * sensitivity / 255.0) * maxRadius
    const startAngle = (i * 2 * Math.PI) / data.length
    const endAngle = ((i + 1.5) * 2 * Math.PI) / data.length
    const colorIndex = Math.floor((i / data.length) * scheme.colors.length)

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.strokeStyle = scheme.colors[colorIndex]
    ctx.lineWidth = 2
    ctx.stroke()
  }
} 