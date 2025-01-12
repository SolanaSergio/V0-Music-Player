'use client'

import { createContext, useContext, useRef, useCallback, useEffect, useState } from 'react'

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

export function AudioProvider({ 
  children 
}: { 
  children: React.ReactNode
}) {
  console.log('AudioProvider: Starting initialization')
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Initialize audio context with optimal settings
  const initContext = useCallback(async () => {
    try {
      console.log('AudioProvider: Initializing audio context')
      
      // Always set initial state
      setIsInitialized(false)
      setError(null)
      
      // If context exists but is closed, clean it up
      if (audioContextRef.current?.state === 'closed') {
        audioContextRef.current = null
        masterGainRef.current = null
      }

      // Create new context if needed
      if (!audioContextRef.current) {
        const contextOptions = {
          sampleRate: 48000,
          latencyHint: 'interactive' as AudioContextLatencyCategory
        }

        console.log('AudioProvider: Creating new AudioContext with options:', contextOptions)

        // Create audio context with fallback for Safari
        const AudioContextClass = (
          window.AudioContext || 
          // @ts-expect-error - Safari support
          window.webkitAudioContext
        )

        const ctx = new AudioContextClass(contextOptions)
        audioContextRef.current = ctx

        // Create master gain node immediately
        const masterGain = ctx.createGain()
        masterGain.gain.setValueAtTime(1.0, ctx.currentTime)
        masterGain.connect(ctx.destination)
        masterGainRef.current = masterGain

        console.log('AudioProvider: Initial setup complete')

        // Try to resume context immediately
        if (ctx.state === 'suspended') {
          console.log('AudioProvider: Attempting immediate resume')
          try {
            await ctx.resume()
            console.log('AudioProvider: Context resumed successfully')
            setIsInitialized(true)
            setError(null)
          } catch (resumeError) {
            console.warn('AudioProvider: Initial resume failed (expected) -', resumeError)
            // Don't treat this as an error - it's expected on first load
            setError(new Error('Click Play to start audio'))
          }
        } else if (ctx.state === 'running') {
          setIsInitialized(true)
          setError(null)
        }

        // Register state change handler
        ctx.onstatechange = () => {
          console.log('AudioProvider: Context state changed to:', ctx.state)
          switch (ctx.state) {
            case 'suspended':
              console.warn('Audio context suspended - waiting for user interaction')
              setError(new Error('Click Play to start audio'))
              setIsInitialized(false)
              break
            case 'running':
              console.log('Audio context is running')
              setError(null)
              setIsInitialized(true)
              break
            case 'closed':
              console.error('Audio context closed unexpectedly')
              setError(new Error('Audio system closed - please refresh the page'))
              setIsInitialized(false)
              audioContextRef.current = null
              masterGainRef.current = null
              break
          }
        }
      }

      return true
    } catch (err) {
      console.error('AudioProvider: Critical initialization error:', err)
      setError(err instanceof Error ? err : new Error('Failed to initialize audio system'))
      setIsInitialized(false)
      return false
    }
  }, [])

  // Resume audio context (needed for Safari and after user interaction)
  const resumeContext = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        console.log('AudioProvider: No context exists, initializing...')
        const success = await initContext()
        if (!success) {
          throw new Error('Failed to initialize audio context')
        }
      }

      const ctx = audioContextRef.current
      if (!ctx) {
        throw new Error('Audio context initialization failed')
      }

      if (ctx.state === 'suspended') {
        console.log('AudioProvider: Attempting to resume suspended context')
        await ctx.resume()
        console.log('AudioProvider: Context resumed successfully')
        setIsInitialized(true)
        setError(null)
      } else if (ctx.state === 'running') {
        console.log('AudioProvider: Context already running')
        setIsInitialized(true)
        setError(null)
      } else if (ctx.state === 'closed') {
        throw new Error('Audio context is closed')
      }
    } catch (err) {
      console.error('AudioProvider: Failed to resume audio context:', err)
      setError(new Error('Failed to start audio - please try again'))
      setIsInitialized(false)
      throw err
    }
  }, [initContext])

  // Initialize on mount with proper error handling
  useEffect(() => {
    let mounted = true
    
    const initialize = async () => {
      try {
        console.log('AudioProvider: Running initialization effect')
        await initContext()
      } catch (err) {
        if (mounted) {
          console.error('AudioProvider: Mount initialization failed:', err)
          setError(new Error('Failed to initialize audio system'))
          setIsInitialized(false)
        }
      }
    }

    void initialize()

    // Handle visibility changes with proper error handling
    const handleVisibilityChange = () => {
      const ctx = audioContextRef.current
      if (!ctx) return

      if (document.hidden && ctx.state === 'running') {
        console.log('AudioProvider: Page hidden, suspending context')
        void ctx.suspend()
      } else if (!document.hidden && ctx.state === 'suspended') {
        console.log('AudioProvider: Page visible, attempting resume')
        void resumeContext().catch(err => {
          console.error('AudioProvider: Failed to resume on visibility change:', err)
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      mounted = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      const ctx = audioContextRef.current
      if (ctx && ctx.state !== 'closed') {
        console.log('AudioProvider: Cleaning up context')
        void ctx.close()
      }
    }
  }, [initContext, resumeContext])

  // Create analyzer node with optimal settings for streaming audio
  const createAnalyser = useCallback(() => {
    console.log('AudioProvider: Creating analyser node')
    const ctx = audioContextRef.current
    if (!ctx) {
      console.warn('AudioProvider: Cannot create analyser - audio context not initialized')
      return null
    }

    try {
      const analyser = ctx.createAnalyser()
      
      // Configure for optimal visualization
      analyser.fftSize = 2048 // Higher for frequency resolution
      analyser.smoothingTimeConstant = 0.8 // Smooth transitions
      analyser.minDecibels = -90 // Increase dynamic range
      analyser.maxDecibels = -10 // Prevent clipping

      console.log('AudioProvider: Analyser node created successfully')
      return analyser
    } catch (err) {
      console.error('AudioProvider: Failed to create analyser node:', err)
      return null
    }
  }, [])

  // Set master volume with proper ramping
  const setVolume = useCallback((value: number) => {
    const masterGain = masterGainRef.current
    const ctx = audioContextRef.current
    if (masterGain && ctx) {
      const safeValue = Math.max(0, Math.min(1, value))
      // Ramp volume change over 50ms to avoid clicks
      masterGain.gain.linearRampToValueAtTime(
        safeValue,
        ctx.currentTime + 0.05
      )
      console.log('AudioProvider: Volume set to:', safeValue)
    }
  }, [])

  // Clean up audio context
  const cleanup = useCallback(() => {
    console.log('AudioProvider: Cleaning up')
    const ctx = audioContextRef.current
    if (ctx && ctx.state !== 'closed') {
      // Ramp down volume before closing
      if (masterGainRef.current) {
        masterGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05)
      }
      setTimeout(() => {
        void ctx.close().catch(err => {
          console.error('AudioProvider: Error closing audio context:', err)
        })
        audioContextRef.current = null
        masterGainRef.current = null
        setIsInitialized(false)
        setError(null)
      }, 60)
    }
  }, [])

  // Retry initialization
  const retry = useCallback(async () => {
    console.log('AudioProvider: Retrying initialization')
    cleanup()
    await initContext()
  }, [cleanup, initContext])

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

