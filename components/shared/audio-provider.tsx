'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'

// Add type for webkit prefix
interface Window {
  webkitAudioContext: typeof AudioContext
}

interface AudioContextState {
  audioContext: AudioContext | null
  masterGain: GainNode | null
  isInitialized: boolean
  resumeContext: () => Promise<void>
  createAnalyser: () => AnalyserNode | null
  setMasterVolume: (value: number) => void
}

const AudioContext = createContext<AudioContextState>({
  audioContext: null,
  masterGain: null,
  isInitialized: false,
  resumeContext: async () => {},
  createAnalyser: () => null,
  setMasterVolume: () => {},
})

export function useAudioContext() {
  return useContext(AudioContext)
}

interface AudioProviderProps {
  children: React.ReactNode
}

export function AudioProvider({ children }: AudioProviderProps) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize audio context
  const initializeAudioContext = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        // Create audio context with specific options for mobile compatibility
        const AudioContextClass = window.AudioContext || (window as unknown as Window).webkitAudioContext
        audioContextRef.current = new AudioContextClass({
          latencyHint: 'interactive',
          sampleRate: 44100
        })
      }

      // Create master gain node if it doesn't exist
      if (!masterGainRef.current && audioContextRef.current) {
        masterGainRef.current = audioContextRef.current.createGain()
        masterGainRef.current.connect(audioContextRef.current.destination)
      }

      // Resume context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      setIsInitialized(true)
    } catch (error) {
      console.error('Failed to initialize audio context:', error)
      setIsInitialized(false)
    }
  }, [])

  // Resume context
  const resumeContext = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        await initializeAudioContext()
        return
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }
    } catch (error) {
      console.error('Failed to resume audio context:', error)
    }
  }, [initializeAudioContext])

  // Create analyser node
  const createAnalyser = useCallback(() => {
    if (!audioContextRef.current) return null

    try {
      const analyser = audioContextRef.current.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8
      return analyser
    } catch (error) {
      console.error('Failed to create analyser node:', error)
      return null
    }
  }, [])

  // Set master volume
  const setMasterVolume = useCallback((value: number) => {
    if (!audioContextRef.current || !masterGainRef.current) return

    try {
      const safeValue = Math.max(0, Math.min(1, value))
      masterGainRef.current.gain.setTargetAtTime(
        safeValue,
        audioContextRef.current.currentTime,
        0.01
      )
    } catch (error) {
      console.error('Failed to set master volume:', error)
    }
  }, [])

  // Initialize on mount
  useEffect(() => {
    initializeAudioContext()

    // Cleanup
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
      masterGainRef.current = null
      setIsInitialized(false)
    }
  }, [initializeAudioContext])

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Suspend context when page is hidden
        audioContextRef.current?.suspend()
      } else {
        // Resume context when page becomes visible
        resumeContext()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [resumeContext])

  return (
    <AudioContext.Provider
      value={{
        audioContext: audioContextRef.current,
        masterGain: masterGainRef.current,
        isInitialized,
        resumeContext,
        createAnalyser,
        setMasterVolume,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

