import { useCallback, useRef } from 'react'

type CanvasSize = {
  width: number
  height: number
}

type UseCanvasReturn = {
  setupCanvas: () => CanvasRenderingContext2D | null
  dimensions: CanvasSize
  canvasRef: React.RefObject<HTMLCanvasElement>
}

export const useCanvas = (): UseCanvasReturn => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dimensionsRef = useRef<CanvasSize>({ width: 0, height: 0 })

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
      willReadFrequently: false
    })
    if (!ctx) return null

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      dimensionsRef.current = { width: rect.width, height: rect.height }
    }

    return ctx
  }, [])

  return {
    setupCanvas,
    dimensions: dimensionsRef.current,
    canvasRef
  }
} 