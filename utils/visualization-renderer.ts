import type { ColorScheme } from '@/types/audio'

export class VisualizationRenderer {
  private ctx: OffscreenCanvasRenderingContext2D
  private width: number
  private height: number
  private colorScheme: ColorScheme
  private sensitivity: number
  private speed: number

  constructor(
    ctx: OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
    colorScheme: ColorScheme,
    sensitivity: number = 1.5,
    speed: number = 1
  ) {
    this.ctx = ctx
    this.width = width
    this.height = height
    this.colorScheme = colorScheme
    this.sensitivity = sensitivity
    this.speed = speed
  }

  private getColor(value: number, index: number, total: number): string {
    const colorIndex = Math.floor((index / total) * this.colorScheme.colors.length)
    return this.colorScheme.colors[colorIndex]
  }

  renderBars(frequencyData: Uint8Array) {
    const bufferLength = frequencyData.length
    const barWidth = (this.width / bufferLength) * 2.5
    let x = 0

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = frequencyData[i] * this.sensitivity
      this.ctx.fillStyle = this.getColor(barHeight, i, bufferLength)
      this.ctx.fillRect(x, this.height - barHeight, barWidth, barHeight)
      x += barWidth + 1
    }
  }

  renderWave(timeData: Uint8Array) {
    const bufferLength = timeData.length
    const sliceWidth = this.width / bufferLength

    this.ctx.lineWidth = 2
    this.ctx.strokeStyle = this.getColor(100, 0, 1)
    this.ctx.beginPath()

    let x = 0
    for (let i = 0; i < bufferLength; i++) {
      const v = timeData[i] / 128.0
      const y = (v * this.height / 2) * this.sensitivity

      if (i === 0) {
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }

      x += sliceWidth
    }

    this.ctx.lineTo(this.width, this.height / 2)
    this.ctx.stroke()
  }

  // ... Add other visualization methods
}

