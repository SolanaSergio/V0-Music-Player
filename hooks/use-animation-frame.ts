import { useEffect, useRef } from 'react'

type AnimationCallback = (timestamp: number) => void

export const useAnimationFrame = (
  callback: AnimationCallback,
  deps: React.DependencyList = []
) => {
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()
  const frameIntervalRef = useRef(1000 / 60) // Target 60fps

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current === undefined) {
        previousTimeRef.current = time
      }

      const deltaTime = time - previousTimeRef.current
      if (deltaTime >= frameIntervalRef.current) {
        callback(time)
        previousTimeRef.current = time
      }

      requestRef.current = requestAnimationFrame(animate)
    }

    requestRef.current = requestAnimationFrame(animate)

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return {
    setFrameRate: (fps: number) => {
      frameIntervalRef.current = 1000 / fps
    }
  }
} 