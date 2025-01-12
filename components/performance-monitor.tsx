'use client'

import { useEffect, useState } from 'react'
import { debounce } from '@/utils/performance'

interface MemoryInfo {
  used: number
  total: number
}

interface NetworkInfo {
  type: string
  downlink: number
}

interface ExtendedNavigator extends Navigator {
  connection: {
    effectiveType: string
    downlink: number
  }
}

export function PerformanceMonitor() {
  const [fps, setFps] = useState(0)
  const [memory, setMemory] = useState<MemoryInfo | null>(null)
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null)

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
      if ('memory' in performance) {
        const perf = performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }
        setMemory({
          used: Math.round(perf.memory.usedJSHeapSize / 1048576),
          total: Math.round(perf.memory.totalJSHeapSize / 1048576)
        })
      }
    }, 1000)

    const updateNetwork = debounce(() => {
      if ('connection' in navigator) {
        const nav = navigator as ExtendedNavigator
        setNetworkInfo({
          type: nav.connection.effectiveType,
          downlink: nav.connection.downlink
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

