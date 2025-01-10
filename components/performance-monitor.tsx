'use client'

import { useEffect, useState } from 'react'
import { debounce } from '@/utils/performance'

export function PerformanceMonitor() {
  const [fps, setFps] = useState(0)
  const [memory, setMemory] = useState<any>(null)
  const [networkInfo, setNetworkInfo] = useState<any>(null)

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    
    const measureFPS = () => {
      const now = performance.now()
      frameCount++
      
      if (now - lastTime >= 1000) {
        setFps(Math.round(frameCount * 1000 / (now - lastTime)))
        frameCount = 0
        lastTime = now
      }
      
      requestAnimationFrame(measureFPS)
    }

    const updateMemory = debounce(() => {
      if (performance.memory) {
        setMemory({
          used: Math.round(performance.memory.usedJSHeapSize / 1048576),
          total: Math.round(performance.memory.totalJSHeapSize / 1048576)
        })
      }
    }, 1000)

    const updateNetwork = debounce(() => {
      if ('connection' in navigator) {
        const conn = (navigator as any).connection
        setNetworkInfo({
          type: conn.effectiveType,
          downlink: conn.downlink
        })
      }
    }, 1000)

    measureFPS()
    updateMemory()
    updateNetwork()

    const interval = setInterval(() => {
      updateMemory()
      updateNetwork()
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-background/80 backdrop-blur-sm rounded-lg p-2 text-xs font-mono">
      <div>FPS: {fps}</div>
      {memory && (
        <div>Memory: {memory.used}MB / {memory.total}MB</div>
      )}
      {networkInfo && (
        <div>Network: {networkInfo.type} ({networkInfo.downlink}Mbps)</div>
      )}
    </div>
  )
}

