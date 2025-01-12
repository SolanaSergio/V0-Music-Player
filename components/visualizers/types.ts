import type { ColorScheme } from '@/types/audio'

export interface DrawContext {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  scheme: ColorScheme
  sensitivity: number
}

export type DrawFunction = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  context: DrawContext
) => void

export interface RippleEffect {
  x: number
  y: number
  radius: number
  maxRadius: number
  opacity: number
  color: string
  speed: number
} 