import type { RippleEffect } from '@/components/visualizers/types'
import type { AnimationConfig, ColorScheme } from '@/types/audio'

export const updateRipples = (
  ctx: CanvasRenderingContext2D,
  ripples: RippleEffect[],
  config: AnimationConfig
): RippleEffect[] => {
  return ripples.filter(ripple => {
    ripple.radius += ripple.speed * config.speed
    ripple.opacity *= config.decay

    ctx.beginPath()
    ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
    ctx.strokeStyle = `${ripple.color}${Math.floor(ripple.opacity * 255).toString(16).padStart(2, '0')}`
    ctx.lineWidth = 2
    ctx.stroke()

    return ripple.opacity > 0.1 && ripple.radius < ripple.maxRadius
  })
}

export const createRipple = (
  x: number,
  y: number,
  frequency: number,
  scheme: ColorScheme,
  speed: number
): RippleEffect => ({
  x,
  y,
  radius: 0,
  maxRadius: Math.max(100, frequency),
  opacity: 1,
  color: scheme.colors[0],
  speed: speed * 2
}) 