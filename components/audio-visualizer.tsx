'use client'

import { useRef, useEffect, useState } from 'react'
import type { AudioVisualizerProps, RippleEffect, VisualizerMode } from '@/types/audio'
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
  updateRipples, 
  createRipple,
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
} from '@/components/visualizers'

// Animation configuration - kept static for now but could be made configurable via UI
const DEFAULT_CONFIG = {
  speed: 1,
  smoothing: 0.8,
  decay: 0.98,
  blend: 0.1
}

export function AudioVisualizer({ 
  analyser,
  className,
  visualizerMode = 'bars',
  colorScheme = 'default',
  sensitivity = 1.5,
  quality = 'medium',
  showControls = true,
  interactive = true
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const rippleRef = useRef<RippleEffect[]>([])
  const mouseRef = useRef({ x: 0, y: 0, pressed: false })
  
  // Reusable arrays for audio data
  const dataArrayRef = useRef<Uint8Array>()
  const timeDataArrayRef = useRef<Uint8Array>()
  
  const [mode, setMode] = useState(visualizerMode)
  const [colors, setColors] = useState(colorScheme)
  const [sens, setSens] = useState(sensitivity)

  // Event handlers with proper cleanup
  useEffect(() => {
    if (!interactive || !canvasRef.current) return

    const canvas = canvasRef.current
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        pressed: mouseRef.current.pressed
      }
    }

    const handleMouseDown = () => {
      mouseRef.current.pressed = true
    }

    const handleMouseUp = () => {
      mouseRef.current.pressed = false
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseUp)

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseUp)
    }
  }, [interactive])

  useEffect(() => {
    if (!canvasRef.current) return
    
    // Early return if no analyzer with clear error message
    if (!analyser) {
      console.warn('No analyzer node available for visualization')
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('Could not get 2D context from canvas')
      return
    }

    // Set up high DPI canvas
    const setupCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      
      // Only update if dimensions actually changed
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        ctx.scale(dpr, dpr)
      }
      
      return { width: rect.width, height: rect.height }
    }

    const dimensions = setupCanvas()

    // Configure analyser based on quality setting
    const fftSizes = { low: 128, medium: 256, high: 512 }
    analyser.fftSize = fftSizes[quality] * 2
    analyser.smoothingTimeConstant = DEFAULT_CONFIG.smoothing
    analyser.minDecibels = -90
    analyser.maxDecibels = -10

    // Initialize or resize reusable arrays
    if (!dataArrayRef.current || dataArrayRef.current.length !== analyser.frequencyBinCount) {
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
    }
    if (!timeDataArrayRef.current || timeDataArrayRef.current.length !== analyser.frequencyBinCount) {
      timeDataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
    }

    const scheme = colorSchemes.find(s => s.id === colors) || colorSchemes[0]
    
    // Drawing functions
    const drawVisualizer = () => {
      if (!ctx || !analyser || !dataArrayRef.current || !timeDataArrayRef.current) {
        console.warn('Missing required resources for visualization')
        return
      }

      try {
        // Clear with alpha for trails
        ctx.fillStyle = `${scheme.background}${Math.floor(DEFAULT_CONFIG.blend * 255).toString(16).padStart(2, '0')}`
        ctx.fillRect(0, 0, dimensions.width, dimensions.height)

        // Get audio data
        analyser.getByteFrequencyData(dataArrayRef.current)
        analyser.getByteTimeDomainData(timeDataArrayRef.current)

        const drawContext = {
          ctx,
          width: dimensions.width,
          height: dimensions.height,
          scheme,
          sensitivity: sens
        }

        // Draw based on mode
        switch (mode) {
          case 'bars':
            drawBars(ctx, dataArrayRef.current, drawContext)
            break
          case 'wave':
            drawWave(ctx, timeDataArrayRef.current, drawContext)
            break
          case 'circle':
            drawCircle(ctx, dataArrayRef.current, drawContext)
            break
          case 'spectrum':
            drawSpectrum(ctx, dataArrayRef.current, drawContext)
            break
          case 'particles':
            drawParticles(ctx, dataArrayRef.current, drawContext)
            break
          case 'frequency':
            drawFrequency(ctx, dataArrayRef.current, drawContext)
            break
          case 'orbit':
            drawOrbit(ctx, dataArrayRef.current, drawContext)
            break
          case 'terrain':
            drawTerrain(ctx, dataArrayRef.current, drawContext)
            break
          case 'spiral':
            drawSpiral(ctx, dataArrayRef.current, drawContext)
            break
          case 'starburst':
            drawStarburst(ctx, dataArrayRef.current, drawContext)
            break
          case 'matrix':
            drawMatrix(ctx, dataArrayRef.current, drawContext)
            break
          case 'rings':
            drawRings(ctx, dataArrayRef.current, drawContext)
            break
          case 'tunnel':
            drawTunnel(ctx, dataArrayRef.current, drawContext)
            break
        }

        // Update ripples if interactive
        if (interactive) {
          const avgFrequency = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length
          rippleRef.current = updateRipples(ctx, rippleRef.current, DEFAULT_CONFIG)
          
          if (mouseRef.current.pressed) {
            rippleRef.current.push(
              createRipple(
                mouseRef.current.x,
                mouseRef.current.y,
                avgFrequency,
                scheme,
                DEFAULT_CONFIG.speed
              )
            )
          }
        }

        animationRef.current = requestAnimationFrame(drawVisualizer)
      } catch (error) {
        console.error('Error in visualization loop:', error)
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }

    // Start animation
    drawVisualizer()

    // Handle window resize
    const handleResize = () => {
      setupCanvas()
    }
    
    window.addEventListener('resize', handleResize)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [analyser, mode, colors, quality, interactive, sens])

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
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 bg-background/80 backdrop-blur-sm rounded-lg p-2">
          <TooltipRoot>
            <TooltipTrigger asChild>
              <div>
                <Select 
                  value={mode} 
                  onValueChange={(value: VisualizerMode['id']) => setMode(value)}
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
                  onValueChange={(value: string) => setColors(value)}
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
              <div className="flex items-center gap-2">
                <span className="text-sm">Sensitivity</span>
                <Slider
                  value={[sens]}
                  min={0.1}
                  max={3}
                  step={0.1}
                  onValueChange={([value]) => setSens(value)}
                  className="w-32"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adjust visualization sensitivity</p>
            </TooltipContent>
          </TooltipRoot>
        </div>
      </div>
    </TooltipProvider>
  )
}

