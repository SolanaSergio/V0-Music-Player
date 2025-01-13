'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import type { AudioVisualizerProps, VisualizerMode } from '@/types/audio'
import { useCanvas } from '@/hooks/use-canvas'
import { useAnimationFrame } from '@/hooks/use-animation-frame'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip"
import { visualizerModes, colorSchemes } from '@/config/visualizer'
import {
  drawBars,
  drawWave,
  drawCircle,
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
  drawRipples,
  handleMouseInteraction,
  createMouseHandlers,
  type MouseHandlers
} from '@/components/visualizers'
import type { DrawContext } from '@/components/visualizers/types'
import type { RippleEffect } from '@/components/visualizers/types'
import type { AnimationConfig } from '@/types/audio'

export function AudioVisualizer({ 
  analyser,
  className,
  visualizerMode = 'bars',
  colorScheme = 'default',
  sensitivity = 1.5,
  showControls = true,
  interactive = true
}: AudioVisualizerProps) {
  const mouseRef = useRef({ x: 0, y: 0, pressed: false })
  const handlersRef = useRef<MouseHandlers | null>(null)
  
  const { canvasRef, setupCanvas, dimensions } = useCanvas()
  
  // Memoize mouse handlers creation to prevent unnecessary re-creation
  const getMouseHandlers = useMemo(() => {
    return (canvas: HTMLCanvasElement) => createMouseHandlers(canvas, mouseRef.current)
  }, []) // Empty deps since we use refs

  // Memoized state updates
  const [mode, setMode] = useState<VisualizerMode['id']>(visualizerMode)
  const [colors, setColors] = useState(colorScheme)
  const [sens, setSens] = useState(sensitivity)
  const [ripples, setRipples] = useState<RippleEffect[]>([])

  // Update state when props change
  useEffect(() => {
    if (visualizerMode !== mode) {
      setMode(visualizerMode)
    }
  }, [visualizerMode, mode])

  useEffect(() => {
    if (colorScheme !== colors) {
      setColors(colorScheme)
    }
  }, [colorScheme, colors])

  useEffect(() => {
    if (sensitivity !== sens) {
      setSens(sensitivity)
    }
  }, [sensitivity, sens])

  // Event listener setup
  useEffect(() => {
    if (!interactive || !canvasRef.current) return

    const canvas = canvasRef.current
    handlersRef.current = getMouseHandlers(canvas)
    const handlers = handlersRef.current

    canvas.addEventListener('mousemove', handlers.handleMouseMove)
    canvas.addEventListener('mousedown', handlers.handleMouseDown)
    canvas.addEventListener('mouseup', handlers.handleMouseUp)
    canvas.addEventListener('mouseleave', handlers.handleMouseUp)

    return () => {
      canvas.removeEventListener('mousemove', handlers.handleMouseMove)
      canvas.removeEventListener('mousedown', handlers.handleMouseDown)
      canvas.removeEventListener('mouseup', handlers.handleMouseUp)
      canvas.removeEventListener('mouseleave', handlers.handleMouseUp)
    }
  }, [interactive, canvasRef, getMouseHandlers])

  // Update ripples for interactive modes
  useEffect(() => {
    if (mode === 'ripple') {
      const scheme = colorSchemes.find(s => s.id === colors) || colorSchemes[0]
      const newRipple = handleMouseInteraction(mouseRef.current, scheme, sens)
      if (newRipple) {
        setRipples(prev => [...prev, newRipple])
      }
    }
  }, [mode, colors, sens])

  // Cleanup ripples when mode changes
  useEffect(() => {
    if (mode !== 'ripple') {
      setRipples([])
    }
  }, [mode])

  // Get the default config for the current mode
  const defaultConfig = useMemo<AnimationConfig>(() => {
    const currentMode = visualizerModes.find(m => m.id === mode)
    const defaultValues: AnimationConfig = {
      speed: 1,
      smoothing: 0.8,
      decay: 0.98,
      blend: 0.1
    }
    
    if (!currentMode?.defaultConfig) {
      return defaultValues
    }

    return {
      ...defaultValues,
      ...currentMode.defaultConfig,
      speed: currentMode.defaultConfig.speed ?? defaultValues.speed,
      smoothing: currentMode.defaultConfig.smoothing ?? defaultValues.smoothing,
      decay: currentMode.defaultConfig.decay ?? defaultValues.decay,
      blend: currentMode.defaultConfig.blend ?? defaultValues.blend
    }
  }, [mode])

  // Main visualization loop using useAnimationFrame
  useAnimationFrame(
    () => {
      const ctx = setupCanvas()
      if (!ctx || !analyser) return

      // Clear with alpha for trail effect
      ctx.fillStyle = `${colorSchemes.find(s => s.id === colors)?.background || '#000000'}0D`
      ctx.fillRect(0, 0, dimensions.width, dimensions.height)

      // Get frequency data
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(dataArray)

      // Draw current mode
      const scheme = colorSchemes.find(s => s.id === colors) || colorSchemes[0]
      const drawContext: DrawContext = {
        width: dimensions.width,
        height: dimensions.height,
        scheme,
        sensitivity: sens
      }

      // Draw visualizer based on current mode
      try {
        switch(mode) {
          case 'ripple':
            const updatedRipples = drawRipples(ctx, dataArray, drawContext, ripples, defaultConfig)
            if (updatedRipples.length !== ripples.length) {
              requestAnimationFrame(() => {
                setRipples(updatedRipples)
              })
            }
            break
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
          case 'matrix':
            drawMatrix(ctx, dataArray, drawContext)
            break
          case 'rings':
            drawRings(ctx, dataArray, drawContext)
            break
          case 'tunnel':
            drawTunnel(ctx, dataArray, drawContext)
            break
          default:
            console.warn(`Unknown visualizer mode: ${mode}`)
            drawBars(ctx, dataArray, drawContext)
        }
      } catch (error) {
        console.error(`Error in visualizer ${mode}:`, error)
        drawBars(ctx, dataArray, drawContext)
      }
    },
    [analyser, mode, colors, sens, defaultConfig, ripples]
  )

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setupCanvas()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setupCanvas])

  // Memoize the controls to prevent unnecessary re-renders
  const visualizerControls = useMemo(() => (
    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 bg-background/80 backdrop-blur-sm rounded-lg p-2">
      <TooltipRoot>
        <TooltipTrigger asChild>
          <div>
            <Select 
              value={mode} 
              onValueChange={(value: VisualizerMode['id']) => {
                setMode(value as typeof mode)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                {visualizerModes.map((mode) => (
                  <SelectItem key={mode.id} value={mode.id}>
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Visualization mode</p>
        </TooltipContent>
      </TooltipRoot>

      <TooltipRoot>
        <TooltipTrigger asChild>
          <div>
            <Select 
              value={colors} 
              onValueChange={setColors}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select colors" />
              </SelectTrigger>
              <SelectContent>
                {colorSchemes.map((scheme) => (
                  <SelectItem key={scheme.id} value={scheme.id}>
                    {scheme.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Color scheme</p>
        </TooltipContent>
      </TooltipRoot>

      <TooltipRoot>
        <TooltipTrigger asChild>
          <div className="w-[180px]">
            <Slider
              value={[sens]}
              min={0.5}
              max={2.5}
              step={0.1}
              onValueChange={([value]) => setSens(value)}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Sensitivity</p>
        </TooltipContent>
      </TooltipRoot>
    </div>
  ), [mode, colors, sens, setMode, setColors, setSens])

  if (!showControls) {
    return (
      <canvas
        ref={canvasRef}
        className={className}
      />
    )
  }

  return (
    <TooltipProvider>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className={className}
        />
        {visualizerControls}
      </div>
    </TooltipProvider>
  )
}

