import type { ColorScheme } from '@/types/audio'

export interface DrawContext {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  scheme: ColorScheme
  sensitivity: number
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
  maxLife: number
}

export interface RippleEffect {
  x: number
  y: number
  radius: number
  maxRadius: number
  opacity: number
  color: string
  speed: number
} 