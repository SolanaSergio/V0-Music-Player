'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { visualizerModes, colorSchemes } from '@/config/visualizer'
import type { AudioVisualizerProps, RippleEffect, AnimationConfig } from '@/types/audio'

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
  const [mode, setMode] = useState(visualizerMode)
  const [colors, setColors] = useState(colorScheme)
  const [sens, setSens] = useState(sensitivity)
  const [config, setConfig] = useState<AnimationConfig>({
    speed: 1,
    smoothing: 0.8,
    decay: 0.98,
    blend: 0.1
  })

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressed: mouseRef.current.pressed
    }
  }, [])

  const handleMouseDown = useCallback(() => {
    mouseRef.current.pressed = true
  }, [])

  const handleMouseUp = useCallback(() => {
    mouseRef.current.pressed = false
  }, [])

  const createRipple = (x: number, y: number, frequency: number): RippleEffect => ({
    x,
    y,
    radius: 0,
    maxRadius: Math.max(100, frequency),
    opacity: 1,
    color: colorSchemes.find(s => s.id === colors)?.colors[0] || '#fff',
    speed: config.speed * 2
  })

  const updateRipples = (ctx: CanvasRenderingContext2D, frequency: number) => {
    if (mouseRef.current.pressed) {
      rippleRef.current.push(createRipple(
        mouseRef.current.x,
        mouseRef.current.y,
        frequency
      ))
    }

    rippleRef.current = rippleRef.current.filter(ripple => {
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

  useEffect(() => {
    if (!canvasRef.current || !analyser) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set up high DPI canvas
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Configure analyser based on quality setting
    const fftSizes = { low: 128, medium: 256, high: 512 }
    analyser.fftSize = fftSizes[quality] * 2
    analyser.smoothingTimeConstant = config.smoothing

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const timeDataArray = new Uint8Array(bufferLength)

    const scheme = colorSchemes.find(s => s.id === colors) || colorSchemes[0]
    ctx.fillStyle = scheme.background || '#0a0a0a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Initialize particles if needed
    if ((mode === 'particles' || mode === 'starburst') && particlesRef.current.length === 0) {
      particlesRef.current = Array.from({ length: 100 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        color: scheme.colors[Math.floor(Math.random() * scheme.colors.length)],
        life: Math.random() * 100,
        maxLife: 100
      }))
    }

    const getColor = (value: number, index: number, total: number) => {
      const scheme = colorSchemes.find(s => s.id === colors) || colorSchemes[0]
      const colorIndex = Math.floor((index / total) * scheme.colors.length)
      return scheme.colors[colorIndex]
    }

    const drawBars = () => {
      const WIDTH = canvas.width
      const HEIGHT = canvas.height

      analyser.getByteFrequencyData(dataArray)
      ctx.fillStyle = 'rgb(18, 18, 18)'
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      const barWidth = (WIDTH / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] * sens
        ctx.fillStyle = getColor(barHeight, i, bufferLength)
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight)
        x += barWidth + 1
      }
    }

    const drawWave = () => {
      const WIDTH = canvas.width
      const HEIGHT = canvas.height

      analyser.getByteTimeDomainData(timeDataArray)
      ctx.fillStyle = 'rgb(18, 18, 18)'
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      ctx.lineWidth = 2
      ctx.strokeStyle = getColor(100, 0, 1)
      ctx.beginPath()

      const sliceWidth = WIDTH / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = timeDataArray[i] / 128.0
        const y = (v * HEIGHT / 2) * sens

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        x += sliceWidth
      }

      ctx.lineTo(WIDTH, HEIGHT / 2)
      ctx.stroke()
    }

    const drawCircle = () => {
      const WIDTH = canvas.width
      const HEIGHT = canvas.height
      const centerX = WIDTH / 2
      const centerY = HEIGHT / 2

      analyser.getByteFrequencyData(dataArray)
      ctx.fillStyle = 'rgb(18, 18, 18)'
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      const maxRadius = Math.min(WIDTH, HEIGHT) / 3

      for (let i = 0; i < bufferLength; i++) {
        const radius = (dataArray[i] * sens / 255.0) * maxRadius
        const startAngle = (i * 2 * Math.PI) / bufferLength
        const endAngle = ((i + 1.5) * 2 * Math.PI) / bufferLength

        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, startAngle, endAngle)
        ctx.strokeStyle = getColor(radius * 2, i, bufferLength)
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    const drawParticles = () => {
      const WIDTH = canvas.width
      const HEIGHT = canvas.height

      analyser.getByteFrequencyData(dataArray)
      ctx.fillStyle = 'rgba(18, 18, 18, 0.1)'
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      const avgFrequency = dataArray.reduce((a, b) => a + b) / bufferLength

      particlesRef.current.forEach((particle, i) => {
        const speed = (avgFrequency / 255) * sens
        particle.x += particle.vx * speed
        particle.y += particle.vy * speed

        if (particle.x < 0 || particle.x > WIDTH) particle.vx *= -1
        if (particle.y < 0 || particle.y > HEIGHT) particle.vy *= -1

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, avgFrequency / 30, 0, Math.PI * 2)
        ctx.fillStyle = getColor(avgFrequency, i, particlesRef.current.length)
        ctx.fill()
      })
    }

    const drawFrequency = () => {
      const WIDTH = canvas.width
      const HEIGHT = canvas.height

      analyser.getByteFrequencyData(dataArray)
      ctx.fillStyle = 'rgb(18, 18, 18)'
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      const barWidth = WIDTH / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] * sens
        const y = HEIGHT - barHeight

        const gradient = ctx.createLinearGradient(x, y, x, HEIGHT)
        gradient.addColorStop(0, getColor(barHeight, i, bufferLength))
        gradient.addColorStop(1, 'transparent')

        ctx.fillStyle = gradient
        ctx.fillRect(x, y, barWidth, barHeight)
        x += barWidth
      }
    }

    const drawOrbit = () => {
      const WIDTH = canvas.width
      const HEIGHT = canvas.height
      const centerX = WIDTH / 2
      const centerY = HEIGHT / 2

      analyser.getByteFrequencyData(dataArray)
      ctx.fillStyle = 'rgba(18, 18, 18, 0.1)'
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      for (let i = 0; i < bufferLength; i++) {
        const radius = (dataArray[i] * sens / 255.0) * Math.min(WIDTH, HEIGHT) / 4
        const angle = (i * 2 * Math.PI) / bufferLength
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)

        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.fillStyle = getColor(radius, i, bufferLength)
        ctx.fill()

        if (i > 0) {
          const prevRadius = (dataArray[i - 1] * sens / 255.0) * Math.min(WIDTH, HEIGHT) / 4
          const prevAngle = ((i - 1) * 2 * Math.PI) / bufferLength
          const prevX = centerX + prevRadius * Math.cos(prevAngle)
          const prevY = centerY + prevRadius * Math.sin(prevAngle)

          ctx.beginPath()
          ctx.moveTo(prevX, prevY)
          ctx.lineTo(x, y)
          ctx.strokeStyle = getColor(radius, i, bufferLength)
          ctx.stroke()
        }
      }
    }

    const drawTerrain = () => {
      const WIDTH = canvas.width
      const HEIGHT = canvas.height

      analyser.getByteFrequencyData(dataArray)
      ctx.fillStyle = 'rgb(18, 18, 18)'
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      ctx.beginPath()
      ctx.moveTo(0, HEIGHT)

      for (let i = 0; i < bufferLength; i++) {
        const x = (i / bufferLength) * WIDTH
        const y = HEIGHT - (dataArray[i] * sens)
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.lineTo(WIDTH, HEIGHT)
      ctx.lineTo(0, HEIGHT)
      
      const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT)
      gradient.addColorStop(0, getColor(255, 0, bufferLength))
      gradient.addColorStop(1, 'transparent')
      
      ctx.fillStyle = gradient
      ctx.fill()
    }

    const drawSpiral = () => {
      const WIDTH = canvas.width
      const HEIGHT = canvas.height
      const centerX = WIDTH / 2
      const centerY = HEIGHT / 2

      analyser.getByteFrequencyData(dataArray)
      ctx.fillStyle = scheme.background
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      const maxRadius = Math.min(WIDTH, HEIGHT) / 2
      const spiralSpacing = 5
      let angle = 0

      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] * sens
        const radius = (i / bufferLength) * maxRadius
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)

        ctx.beginPath()
        ctx.arc(x, y, value / 20, 0, Math.PI * 2)
        ctx.fillStyle = scheme.colors[i % scheme.colors.length]
        ctx.fill()

        angle += (spiralSpacing * Math.PI) / 180
      }
    }

    const drawStarburst = () => {
      const WIDTH = canvas.width
      const HEIGHT = canvas.height
      const centerX = WIDTH / 2
      const centerY = HEIGHT / 2

      analyser.getByteFrequencyData(dataArray)
      ctx.fillStyle = scheme.background
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      const avgFrequency = dataArray.reduce((a, b) => a + b) / bufferLength

      if (mouseRef.current.pressed) {
        const burst = {
          x: mouseRef.current.x,
          y: mouseRef.current.y,
          vx: 0,
          vy: 0,
          size: avgFrequency / 10,
          color: scheme.colors[Math.floor(Math.random() * scheme.colors.length)],
          life: 100,
          maxLife: 100
        }
        particlesRef.current.push(burst)
      }

      particlesRef.current = particlesRef.current.filter(particle => {
        particle.life -= 1
        particle.size *= 0.99
        particle.x += (Math.random() - 0.5) * avgFrequency / 10
        particle.y += (Math.random() - 0.5) * avgFrequency / 10

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()

        return particle.life > 0
      })
    }

    const drawRipple = () => {
      const WIDTH = canvas.width
      const HEIGHT = canvas.height

      analyser.getByteFrequencyData(dataArray)
      ctx.fillStyle = `rgba(18, 18, 18, ${config.blend})`
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      const avgFrequency = dataArray.reduce((a, b) => a + b) / bufferLength
      updateRipples(ctx, avgFrequency)
    }

    const drawMatrix = () => {
      const WIDTH = canvas.width
      const HEIGHT = canvas.height
      const fontSize = 14
      const columns = Math.floor(WIDTH / fontSize)
      
      if (!ctx.matrix) {
        ctx.matrix = Array(columns).fill(0)
      }

      analyser.getByteFrequencyData(dataArray)
      ctx.fillStyle = `rgba(0, 0, 0, 0.05)`
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      const avgFrequency = dataArray.reduce((a, b) => a + b) / bufferLength
      const speed = avgFrequency / 50

      ctx.fillStyle = scheme.colors[0]
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < columns; i++) {
        const char = String.fromCharCode(Math.random() * 128)
        const x = i * fontSize
        const y = ctx.matrix[i] * fontSize

        ctx.fillText(char, x, y)

        if (y > HEIGHT && Math.random() > 0.975) {
          ctx.matrix[i] = 0
        } else {
          ctx.matrix[i] += speed
        }
      }
    }

    const drawRings = () => {
      const WIDTH = canvas.width
      const HEIGHT = canvas.height
      const centerX = WIDTH / 2
      const centerY = HEIGHT / 2

      analyser.getByteFrequencyData(dataArray)
      ctx.fillStyle = `rgba(18, 18, 18, ${config.blend})`
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      const maxRadius = Math.min(WIDTH, HEIGHT) / 3
      const ringCount = 5
      const ringSpacing = maxRadius / ringCount

      for (let ring = 0; ring < ringCount; ring++) {
        ctx.beginPath()
        const radius = ringSpacing * (ring + 1)
        const angleStep = (Math.PI * 2) / bufferLength
        
        for (let i = 0; i < bufferLength; i++) {
          const value = dataArray[i] * sens
          const angle = i * angleStep
          const radiusOffset = (value / 255) * 50 * config.speed
          
          const x = centerX + (radius + radiusOffset) * Math.cos(angle)
          const y = centerY + (radius + radiusOffset) * Math.sin(angle)
          
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        
        ctx.closePath()
        const gradient = ctx.createRadialGradient(
          centerX, centerY, radius - ringSpacing,
          centerX, centerY, radius
        )
        gradient.addColorStop(0, 'transparent')
        gradient.addColorStop(0.5, getColor(ring * 50, ring, ringCount))
        gradient.addColorStop(1, 'transparent')
        
        ctx.strokeStyle = gradient
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    const drawTunnel = () => {
      const WIDTH = canvas.width
      const HEIGHT = canvas.height
      const centerX = WIDTH / 2
      const centerY = HEIGHT / 2

      analyser.getByteFrequencyData(dataArray)
      ctx.fillStyle = `rgba(18, 18, 18, ${config.blend})`
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      const segments = 32
      const rings = 8
      const angleStep = (Math.PI * 2) / segments

      for (let ring = rings - 1; ring >= 0; ring--) {
        const radius = (ring + 1) * 40
        const depth = ring * 0.3 * config.speed
        const scale = 1 / (1 + depth)
        
        ctx.beginPath()
        for (let i = 0; i <= segments; i++) {
          const angle = i * angleStep
          const segmentIndex = Math.floor((i / segments) * bufferLength)
          const value = dataArray[segmentIndex] * sens
          
          const radiusOffset = (value / 255) * 30
          const x = centerX + (radius + radiusOffset) * Math.cos(angle) * scale
          const y = centerY + (radius + radiusOffset) * Math.sin(angle) * scale
          
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        
        ctx.closePath()
        const color = getColor(ring * 30, ring, rings)
        ctx.strokeStyle = color
        ctx.lineWidth = 2 * scale
        ctx.stroke()
      }
    }


    const draw = () => {
      switch (mode) {
        case 'bars':
          drawBars()
          break
        case 'wave':
          drawWave()
          break
        case 'circle':
          drawCircle()
          break
        case 'spectrum':
          drawFrequency()
          break
        case 'particles':
          drawParticles()
          break
        case 'frequency':
          drawFrequency()
          break
        case 'orbit':
          drawOrbit()
          break
        case 'terrain':
          drawTerrain()
          break
        case 'spiral':
          drawSpiral()
          break
        case 'starburst':
          drawStarburst()
          break
        case 'ripple':
          drawRipple()
          break
        case 'matrix':
          drawMatrix()
          break
        case 'rings':
          drawRings()
          break
        case 'tunnel':
          drawTunnel()
          break
      }
      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove)
      canvas.addEventListener('mousedown', handleMouseDown)
      canvas.addEventListener('mouseup', handleMouseUp)
      canvas.addEventListener('mouseleave', handleMouseUp)
    }

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('mousedown', handleMouseDown)
        canvas.removeEventListener('mouseup', handleMouseUp)
        canvas.removeEventListener('mouseleave', handleMouseUp)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [analyser, mode, colors, sens, config, quality, interactive, handleMouseMove, handleMouseDown, handleMouseUp])

  if (!showControls) {
    return (
      <canvas
        ref={canvasRef}
        className={className}
      />
    )
  }

  const currentMode = visualizerModes.find(v => v.id === mode)

  return (
    <TooltipProvider>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className={className}
        />
        <div className="absolute bottom-4 right-4 flex flex-wrap items-center gap-2">
          <TooltipRoot>
            <TooltipTrigger asChild>
              <Select value={mode} onValueChange={(value: any) => setMode(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visualizerModes.map(visualizer => (
                    <SelectItem key={visualizer.id} value={visualizer.id}>
                      <div className="flex items-center">
                        <visualizer.icon className="mr-2 h-4 w-4" />
                        {visualizer.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TooltipTrigger>
            <TooltipContent side="top">
              {currentMode?.description}
              {currentMode?.interactive && " (Interactive)"}
            </TooltipContent>
          </TooltipRoot>

          <TooltipRoot>
            <TooltipTrigger asChild>
              <Select value={colors} onValueChange={(value: any) => setColors(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorSchemes.map(scheme => (
                    <SelectItem key={scheme.id} value={scheme.id}>
                      <div className="flex items-center gap-2">
                        <div className="flex h-4 items-center gap-px">
                          {scheme.colors.map((color, i) => (
                            <div
                              key={i}
                              className="h-full w-1"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        {scheme.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TooltipTrigger>
            <TooltipContent side="top">
              Color scheme
            </TooltipContent>
          </TooltipRoot>

          <TooltipRoot>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Slider
                  value={[sens]}
                  min={0.5}
                  max={2.5}
                  step={0.1}
                  className="w-[100px]"
                  onValueChange={([value]) => setSens(value)}
                />
                <span className="text-xs tabular-nums">
                  {sens.toFixed(1)}x
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              Sensitivity
            </TooltipContent>
          </TooltipRoot>

          <TooltipRoot>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Slider
                  value={[config.speed]}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="w-[100px]"
                  onValueChange={([value]) => setConfig(prev => ({ ...prev, speed: value }))}
                />
                <span className="text-xs tabular-nums">
                  {config.speed.toFixed(1)}x
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              Animation Speed
            </TooltipContent>
          </TooltipRoot>
        </div>
      </div>
    </TooltipProvider>
  )
}

