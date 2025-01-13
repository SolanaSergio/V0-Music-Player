import type { RippleEffect, DrawContext } from '@/components/visualizers/types'
import type { AnimationConfig, ColorScheme } from '@/types/audio'

type MouseState = {
  x: number
  y: number
  pressed: boolean
}

export type MouseHandlers = {
  handleMouseMove: (e: MouseEvent) => void
  handleMouseDown: (e: MouseEvent) => void
  handleMouseUp: (e: MouseEvent) => void
}

export const createMouseHandlers = (
  canvas: HTMLCanvasElement,
  mouseState: MouseState
): MouseHandlers => {
  const getMousePosition = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  return {
    handleMouseMove: (e: MouseEvent) => {
      const pos = getMousePosition(e)
      mouseState.x = pos.x
      mouseState.y = pos.y
    },
    handleMouseDown: (e: MouseEvent) => {
      const pos = getMousePosition(e)
      mouseState.x = pos.x
      mouseState.y = pos.y
      mouseState.pressed = true
    },
    handleMouseUp: () => {
      mouseState.pressed = false
    }
  }
}

export const handleMouseInteraction = (
  mouseState: MouseState,
  scheme: ColorScheme,
  sensitivity: number
): RippleEffect | null => {
  if (!mouseState.pressed) return null
  
  return createRipple(
    mouseState.x,
    mouseState.y,
    100, // Base frequency for mouse-created ripples
    scheme,
    sensitivity
  )
}

export const drawRipples = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  { width, height, scheme, sensitivity }: DrawContext,
  ripples: RippleEffect[],
  config: AnimationConfig
): RippleEffect[] => {
  // Clear with alpha for trail effect
  ctx.fillStyle = `${scheme.background || '#000000'}0D`
  ctx.fillRect(0, 0, width, height)

  // Use data and sensitivity to affect ripple properties
  const avgFrequency = data.reduce((sum, value) => sum + value, 0) / data.length
  const intensityFactor = (avgFrequency / 255) * sensitivity

  return updateRipples(ctx, ripples, {
    ...config,
    speed: config.speed * intensityFactor,
    decay: Math.max(0.95, config.decay * (1 - intensityFactor * 0.1))
  })
}

export const updateRipples = (
  ctx: CanvasRenderingContext2D,
  ripples: RippleEffect[],
  config: AnimationConfig
): RippleEffect[] => {
  return ripples.filter(ripple => {
    // Update ripple properties with smooth expansion
    ripple.radius += ripple.speed * config.speed
    ripple.opacity *= config.decay

    // Save context for clipping
    ctx.save()
    
    // Create clipping mask for ripple ring
    ctx.beginPath()
    ctx.arc(ripple.x, ripple.y, ripple.radius + 2, 0, Math.PI * 2)
    ctx.arc(ripple.x, ripple.y, Math.max(0, ripple.radius - 2), 0, Math.PI * 2, true)
    ctx.clip()

    // Draw the ripple ring with glow
    ctx.shadowBlur = 20
    ctx.shadowColor = ripple.color
    ctx.fillStyle = ripple.color
    ctx.fill()
    
    // Restore context
    ctx.restore()

    // Draw additional inner rings for effect
    const numRings = 3
    for (let i = 1; i <= numRings; i++) {
      const innerRadius = ripple.radius * (0.7 - (i * 0.15))
      if (innerRadius <= 0) continue

      ctx.beginPath()
      ctx.arc(ripple.x, ripple.y, innerRadius, 0, Math.PI * 2)
      ctx.strokeStyle = `${ripple.color}${Math.floor(ripple.opacity * 100).toString(16).padStart(2, '0')}`
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Return true if ripple should remain active
    return ripple.opacity > 0.1 && ripple.radius < ripple.maxRadius
  })
}

export const createRipple = (
  x: number,
  y: number,
  frequency: number,
  scheme: ColorScheme,
  speed: number
): RippleEffect => {
  // Use random color from scheme for variety
  const colorIndex = Math.floor(Math.random() * scheme.colors.length)
  
  return {
    x,
    y,
    radius: 0,
    maxRadius: Math.max(200, frequency), // Larger max radius
    opacity: 1,
    color: scheme.colors[colorIndex],
    speed: speed * 3 // Faster expansion
  }
} 