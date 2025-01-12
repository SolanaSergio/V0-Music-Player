'use client'

import { createContext, useContext, useRef, useCallback, useEffect, useState } from 'react'
import type { AudioProcessorConfig } from '@/types/audio'

interface AudioContextValue {
  audioContext: AudioContext | null
  masterGain: GainNode | null
  createAnalyser: () => AnalyserNode | null
  resumeContext: () => Promise<void>
  setVolume: (value: number) => void
  cleanup: () => void
  isInitialized: boolean
  error: Error | null
  retry: () => Promise<void>
}

const AudioContext = createContext<AudioContextValue | null>(null)

export function useAudioContext() {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider')
  }
  return context
}

interface WebkitWindow extends Window {
  webkitAudioContext: typeof AudioContext
}

export function AudioProvider({ 
  children,
  config 
}: { 
  children: React.ReactNode
  config?: Partial<AudioProcessorConfig>
}) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const cleanup = useCallback(() => {
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close()
      audioContextRef.current = null
    }
    masterGainRef.current = null
    setIsInitialized(false)
    console.log('Audio context cleaned up')
  }, [])

  const initializeContext = useCallback(async () => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      return
    }

    try {
      setError(null)
      const AudioContextClass = window.AudioContext || (window as unknown as WebkitWindow).webkitAudioContext
      audioContextRef.current = new AudioContextClass({
        latencyHint: 'interactive',
        sampleRate: 44100
      })

      masterGainRef.current = audioContextRef.current.createGain()
      masterGainRef.current.connect(audioContextRef.current.destination)
      
      setIsInitialized(true)
      console.log('Audio context initialized')
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize audio context')
      console.error('Failed to initialize audio context:', error)
      setError(error)
      setIsInitialized(false)
      throw error
    }
  }, [])

  const retry = useCallback(async () => {
    try {
      await cleanup()
      await initializeContext()
    } catch (err) {
      console.error('Retry failed:', err)
    }
  }, [cleanup, initializeContext])

  const resumeContext = useCallback(async () => {
    if (!audioContextRef.current) {
      await initializeContext()
    }

    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume()
      console.log('Audio context resumed')
    }
  }, [initializeContext])

  const createAnalyser = useCallback(() => {
    if (!audioContextRef.current) return null

    const analyser = audioContextRef.current.createAnalyser()
    analyser.fftSize = config?.fftSize || 2048
    analyser.smoothingTimeConstant = config?.smoothingTimeConstant || 0.8
    analyser.minDecibels = config?.minDecibels || -90
    analyser.maxDecibels = config?.maxDecibels || -10

    return analyser
  }, [config])

  const setVolume = useCallback((value: number) => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = value
    }
  }, [])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  const value = {
    audioContext: audioContextRef.current,
    masterGain: masterGainRef.current,
    createAnalyser,
    resumeContext,
    setVolume,
    cleanup,
    isInitialized,
    error,
    retry
  }

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  )
}

