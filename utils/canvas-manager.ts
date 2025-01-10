export class CanvasManager {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private dpr: number
  private offscreenCanvas: OffscreenCanvas
  private offscreenCtx: OffscreenCanvasRenderingContext2D
  private width: number
  private height: number

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.dpr = window.devicePixelRatio || 1
    
    // Create offscreen canvas
    this.offscreenCanvas = new OffscreenCanvas(
      canvas.width * this.dpr,
      canvas.height * this.dpr
    )
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')!
    
    this.width = canvas.width
    this.height = canvas.height
    
    this.resize()
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect()
    this.width = rect.width
    this.height = rect.height
    
    // Set canvas size accounting for device pixel ratio
    this.canvas.width = this.width * this.dpr
    this.canvas.height = this.height * this.dpr
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`
    
    // Set offscreen canvas size
    this.offscreenCanvas.width = this.canvas.width
    this.offscreenCanvas.height = this.canvas.height
    
    // Scale contexts
    this.ctx.scale(this.dpr, this.dpr)
    this.offscreenCtx.scale(this.dpr, this.dpr)
  }

  clear(color: string = 'rgb(18, 18, 18)') {
    this.offscreenCtx.fillStyle = color
    this.offscreenCtx.fillRect(0, 0, this.width, this.height)
  }

  draw() {
    // Transfer offscreen canvas to main canvas
    this.ctx.drawImage(
      this.offscreenCanvas,
      0, 0, this.width, this.height,
      0, 0, this.width, this.height
    )
  }

  get context() {
    return this.offscreenCtx
  }

  get dimensions() {
    return { width: this.width, height: this.height }
  }
}

