'use client'

import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import type { AudioVisualizerProps } from '@/types/audio'
import { useCanvas } from '@/hooks/use-canvas'
import { colorSchemes } from '@/config/visualizer'
import {
  drawBars,
  drawWave,
  drawCircle,
  drawRipples,
  drawSpectrum,
  drawParticles,
  drawFrequency,
  drawOrbit,
  drawTerrain,
  drawSpiral,
  drawStarburst,
  drawMatrix,
  drawRings,
  drawTunnel,
  createMouseHandlers,
  handleMouseInteraction
} from '@/components/visualizers'
import type { DrawContext, RippleEffect } from '@/components/visualizers/types'
import { cn } from '@/lib/utils'

export function AudioVisualizer({ 
  analyser,
  className,
  visualizerMode = 'bars',
  colorScheme = 'default',
  sensitivity = 1.5
}: AudioVisualizerProps) {
  const { setupCanvas, dimensions, canvasRef } = useCanvas()
  const animationFrame = useRef<number>()
  const mouseState = useRef({ x: 0, y: 0, pressed: false })
  const lastDataRef = useRef<Uint8Array | null>(null)
  
  const [mode, setMode] = useState(visualizerMode)
  const [colors, setColors] = useState(colorScheme)
  const [sens, setSens] = useState(sensitivity)
  const [ripples, setRipples] = useState<RippleEffect[]>([])

  // Update state when props change
  useEffect(() => {
    setMode(visualizerMode)
  }, [visualizerMode])

  useEffect(() => {
    setColors(colorScheme)
  }, [colorScheme])

  useEffect(() => {
    setSens(sensitivity)
  }, [sensitivity])

  // Setup mouse handlers for ripple effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handlers = createMouseHandlers(canvas, mouseState.current)
    
    if (mode === 'ripple') {
      const handleTouchStart = (e: TouchEvent) => {
        e.preventDefault()
        const touch = e.touches[0]
        const mouseEvent = new MouseEvent('mousedown', {
          clientX: touch.clientX,
          clientY: touch.clientY
        })
        handlers.handleMouseDown(mouseEvent)
      }

      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        const touch = e.touches[0]
        const mouseEvent = new MouseEvent('mousemove', {
          clientX: touch.clientX,
          clientY: touch.clientY
        })
        handlers.handleMouseMove(mouseEvent)
      }

      const handleTouchEnd = (e: TouchEvent) => {
        e.preventDefault()
        const mouseEvent = new MouseEvent('mouseup')
        handlers.handleMouseUp(mouseEvent)
      }

      canvas.addEventListener('mousemove', handlers.handleMouseMove)
      canvas.addEventListener('mousedown', handlers.handleMouseDown)
      canvas.addEventListener('mouseup', handlers.handleMouseUp)
      canvas.addEventListener('touchstart', handleTouchStart)
      canvas.addEventListener('touchmove', handleTouchMove)
      canvas.addEventListener('touchend', handleTouchEnd)

      return () => {
        canvas.removeEventListener('mousemove', handlers.handleMouseMove)
        canvas.removeEventListener('mousedown', handlers.handleMouseDown)
        canvas.removeEventListener('mouseup', handlers.handleMouseUp)
        canvas.removeEventListener('touchstart', handleTouchStart)
        canvas.removeEventListener('touchmove', handleTouchMove)
        canvas.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [mode, canvasRef])

  // Clear ripples when switching away from ripple mode
  useEffect(() => {
    if (mode !== 'ripple') {
      setRipples([])
      mouseState.current = { x: 0, y: 0, pressed: false }
    }
  }, [mode])

  const defaultConfig = useMemo(() => ({
    speed: 1,
    decay: 0.98,
    smoothing: 0.8,
    blend: 0.1
  }), [])

  const draw = useCallback(() => {
    const ctx = setupCanvas()
    if (!ctx) return

    // Reset canvas state completely
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
    
    // Clear canvas completely
    ctx.clearRect(0, 0, dimensions.width, dimensions.height)
    const scheme = colorSchemes.find(s => s.id === colors) || colorSchemes[0]
    ctx.fillStyle = scheme.background
    ctx.fillRect(0, 0, dimensions.width, dimensions.height)

    // Get frequency data if analyser is available, otherwise use last known data
    let dataArray: Uint8Array
    if (analyser) {
      dataArray = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(dataArray)
      lastDataRef.current = dataArray
    } else if (lastDataRef.current) {
      // When paused, gradually decay the last known data
      dataArray = lastDataRef.current.map(value => value * 0.95)
      lastDataRef.current = dataArray
    } else {
      // If no data available, use empty array
      dataArray = new Uint8Array(1024)
    }

    // Draw current mode
    const drawContext: DrawContext = {
      width: dimensions.width,
      height: dimensions.height,
      scheme,
      sensitivity: sens
    }

    // Draw visualizer based on current mode
    try {
      // Reset any lingering canvas states
      ctx.globalCompositeOperation = 'source-over'
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
      ctx.setTransform(1, 0, 0, 1, 0, 0)

      switch(mode) {
        case 'bars':
          drawBars(ctx, dataArray, drawContext)
          break
        case 'wave':
          drawWave(ctx, dataArray, drawContext)
          break
        case 'circle':
          drawCircle(ctx, dataArray, drawContext)
          break
        case 'spectrum':
          drawSpectrum(ctx, dataArray, drawContext)
          break
        case 'particles':
          drawParticles(ctx, dataArray, drawContext)
          break
        case 'frequency':
          drawFrequency(ctx, dataArray, drawContext)
          break
        case 'orbit':
          drawOrbit(ctx, dataArray, drawContext)
          break
        case 'terrain':
          drawTerrain(ctx, dataArray, drawContext)
          break
        case 'spiral':
          drawSpiral(ctx, dataArray, drawContext)
          break
        case 'starburst':
          drawStarburst(ctx, dataArray, drawContext)
          break
        case 'ripple':
          // Handle mouse interaction for ripples
          const mouseRipple = handleMouseInteraction(mouseState.current, scheme, sens)
          if (mouseRipple) {
            ripples.push(mouseRipple)
          }
          
          const updatedRipples = drawRipples(ctx, dataArray, drawContext, ripples, defaultConfig)
          if (updatedRipples.length !== ripples.length) {
            requestAnimationFrame(() => {
              setRipples(updatedRipples)
            })
          }
          break
        case 'matrix':
          drawMatrix(ctx, dataArray, drawContext)
          break
        case 'rings':
          drawRings(ctx, dataArray, drawContext)
          break
        case 'tunnel':
          drawTunnel(ctx, dataArray, drawContext)
          break
      }
    } catch (error) {
      console.error('Error in visualization:', error)
    }

    // Request next frame
    animationFrame.current = requestAnimationFrame(draw)
  }, [mode, colors, sens, dimensions, analyser, ripples, defaultConfig, setupCanvas])

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [])

  // Main visualization loop
  useEffect(() => {
    draw()
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [draw])

  return (
    <div className={cn(
      "relative w-full h-full flex items-center justify-center",
      className
    )}>
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  )
}

