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
  // Reset all canvas settings to defaults
  ctx.resetTransform()
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
  
  // Clear canvas completely
  ctx.clearRect(0, 0, width, height)
  
  // Fill background with solid color
  ctx.fillStyle = scheme.background || '#000000'
  ctx.fillRect(0, 0, width, height)

  // Calculate average frequency with smoothed sensitivity
  const avgFrequency = data.reduce((sum, value) => sum + value, 0) / data.length
  const smoothedSensitivity = Math.sqrt(sensitivity) * 0.8
  const intensityFactor = Math.min(1, (avgFrequency / 255) * smoothedSensitivity)

  // Create new ripples based on audio intensity
  if (intensityFactor > 0.2) {
    const numNewRipples = Math.ceil(intensityFactor * 1.5)
    for (let i = 0; i < numNewRipples; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const frequency = avgFrequency * (0.8 + Math.random() * 0.4)
      ripples.push(createRipple(x, y, frequency, scheme, smoothedSensitivity))
    }
  }

  // Update and draw ripples
  return ripples.filter(ripple => {
    // Update ripple properties with smoothed expansion
    ripple.radius += ripple.speed * config.speed * (intensityFactor * 0.7 + 0.3)
    ripple.opacity *= 0.96

    // Save context with clean state
    ctx.save()
    
    // Reset composite operation for each ripple
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    
    // Draw main ripple ring
    ctx.beginPath()
    ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
    
    // Create gradient for main ring
    const gradient = ctx.createRadialGradient(
      ripple.x, ripple.y, ripple.radius - 2,
      ripple.x, ripple.y, ripple.radius + 2
    )
    const alpha = Math.floor(ripple.opacity * 255).toString(16).padStart(2, '0')
    gradient.addColorStop(0, `${ripple.color}00`)
    gradient.addColorStop(0.5, `${ripple.color}${alpha}`)
    gradient.addColorStop(1, `${ripple.color}00`)
    
    // Draw main ring
    ctx.strokeStyle = gradient
    ctx.lineWidth = 2 * ripple.opacity
    ctx.shadowColor = ripple.color
    ctx.shadowBlur = 12 * ripple.opacity
    ctx.stroke()
    
    // Reset shadow for inner rings
    ctx.shadowBlur = 0
    
    // Draw additional inner rings
    const numRings = 2
    for (let i = 1; i <= numRings; i++) {
      const innerRadius = ripple.radius * (0.7 - (i * 0.15))
      if (innerRadius <= 0) continue

      ctx.beginPath()
      ctx.arc(ripple.x, ripple.y, innerRadius, 0, Math.PI * 2)
      const innerAlpha = Math.floor(ripple.opacity * 120).toString(16).padStart(2, '0')
      ctx.strokeStyle = `${ripple.color}${innerAlpha}`
      ctx.lineWidth = 1.2
      ctx.stroke()
    }
    
    // Restore context to clean state
    ctx.restore()

    // Return true if ripple should remain active
    return ripple.opacity > 0.1 && ripple.radius < ripple.maxRadius
  })
}

export const createRipple = (
  x: number,
  y: number,
  frequency: number,
  scheme: ColorScheme,
  sensitivity: number
): RippleEffect => {
  const colorIndex = Math.floor(Math.random() * scheme.colors.length)
  
  return {
    x,
    y,
    radius: 0,
    maxRadius: Math.max(100, frequency * sensitivity),
    opacity: 1,
    color: scheme.colors[colorIndex],
    speed: Math.max(2, sensitivity * 2.5) // Reduced sensitivity multiplier
  }
} 