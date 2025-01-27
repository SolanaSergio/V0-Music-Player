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
  // Add equalizer chain access
  equalizerInput: GainNode | null
  equalizerOutput: GainNode | null
}

const AudioContext = createContext<AudioContextValue | null>(null)

export function useAudioContext() {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider')
  }
  return context
}

interface EnhancedAnalyserNode extends AnalyserNode {
  setSensitivity: (value: number) => void;
}

export function AudioProvider({ 
  children 
}: { 
  children: React.ReactNode
}) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const equalizerInputRef = useRef<GainNode | null>(null)
  const equalizerOutputRef = useRef<GainNode | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const initializationPromiseRef = useRef<Promise<boolean> | null>(null)

  // Type guard for AudioContext state
  const isContextRunning = (state: AudioContextState): state is 'running' => state === 'running'
  const isContextSuspended = (state: AudioContextState): state is 'suspended' => state === 'suspended'

  // Initialize audio context with optimal settings
  const initContext = useCallback(async () => {
    // Return existing initialization promise if one is in progress
    if (initializationPromiseRef.current) {
      return initializationPromiseRef.current
    }

    // Create new initialization promise
    initializationPromiseRef.current = (async () => {
      try {
        // If context exists and is not closed, try to resume it
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          if (isContextSuspended(audioContextRef.current.state)) {
            try {
              await audioContextRef.current.resume()
            } catch (err) {
              console.warn('Could not resume existing context:', err)
            }
          }
          return true
        }

        // Reset state
        setIsInitialized(false)
        setError(null)
        
        const contextOptions = {
          sampleRate: 44100,
          latencyHint: 'interactive' as AudioContextLatencyCategory
        }

        // Create audio context with fallback for Safari
        const AudioContextClass = window.AudioContext || ((window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
        if (!AudioContextClass) {
          throw new Error('Web Audio API is not supported in this browser')
        }

        // Create and store the context
        const ctx = new AudioContextClass(contextOptions)
        audioContextRef.current = ctx

        // Create master gain node
        const masterGain = ctx.createGain()
        masterGain.gain.setValueAtTime(1.0, ctx.currentTime)
        masterGainRef.current = masterGain

        // Create equalizer input/output nodes
        const eqInput = ctx.createGain()
        const eqOutput = ctx.createGain()
        equalizerInputRef.current = eqInput
        equalizerOutputRef.current = eqOutput

        // Set up audio chain:
        // Source -> EQ Input -> [Equalizer Filters] -> EQ Output -> Master Gain -> Destination
        eqInput.connect(eqOutput)
        eqOutput.connect(masterGain)
        masterGain.connect(ctx.destination)

        // Handle state changes
        ctx.onstatechange = () => {
          if (!audioContextRef.current) return
          
          const state = audioContextRef.current.state
          if (isContextRunning(state)) {
            setIsInitialized(true)
            setError(null)
          } else if (isContextSuspended(state)) {
            setIsInitialized(false)
          } else if (state === 'closed') {
            setError(new Error('Audio system closed - please refresh'))
            setIsInitialized(false)
            audioContextRef.current = null
            masterGainRef.current = null
            equalizerInputRef.current = null
            equalizerOutputRef.current = null
          }
        }

        // Initial resume attempt
        if (isContextSuspended(ctx.state)) {
          try {
            await ctx.resume()
          } catch (err) {
            console.warn('Initial resume failed (expected):', err)
          }
        }

        setIsInitialized(isContextRunning(ctx.state))
        return true

      } catch (err) {
        console.error('Audio context initialization failed:', err)
        setError(err instanceof Error ? err : new Error('Failed to initialize audio'))
        setIsInitialized(false)
        return false
      }
    })()

    const result = await initializationPromiseRef.current
    initializationPromiseRef.current = null
    return result
  }, [])

  // Optimized resume context function
  const resumeContext = useCallback(async () => {
    try {
      // Initialize if needed
      if (!audioContextRef.current) {
        const success = await initContext()
        if (!success) {
          throw new Error('Failed to initialize audio context')
        }
        // Check again after initialization
        if (!audioContextRef.current) {
          throw new Error('Audio context initialization failed')
        }
      }

      const ctx = audioContextRef.current
      // Attempt to resume if suspended
      if (isContextSuspended(ctx.state)) {
        await ctx.resume()
        
        // Verify the state after resume
        if (isContextRunning(ctx.state)) {
          setIsInitialized(true)
          setError(null)
        } else {
          throw new Error('Failed to resume audio context')
        }
      } else if (isContextRunning(ctx.state)) {
        setIsInitialized(true)
        setError(null)
      }
    } catch (err) {
      console.error('Resume context failed:', err)
      setError(err instanceof Error ? err : new Error('Failed to start audio - please try again'))
      setIsInitialized(false)
      throw err
    }
  }, [initContext])

  // Create analyzer with optimized settings
  const createAnalyser = useCallback(() => {
    const ctx = audioContextRef.current
    if (!ctx || !equalizerOutputRef.current) return null

    try {
      const analyser = ctx.createAnalyser() as EnhancedAnalyserNode
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.85
      analyser.minDecibels = -90
      analyser.maxDecibels = -10
      
      // Create a gain node specifically for the analyzer to control sensitivity
      const analyzerGain = ctx.createGain()
      analyzerGain.gain.setValueAtTime(1.0, ctx.currentTime)
      
      // Connect through the analyzer gain node after the equalizer chain
      analyzerGain.connect(analyser)
      if (equalizerOutputRef.current) {
        equalizerOutputRef.current.connect(analyzerGain)
      }
      
      // Add sensitivity control method
      analyser.setSensitivity = (value: number) => {
        const normalizedValue = Math.max(0.1, Math.min(2.0, value))
        const scaledValue = Math.pow(normalizedValue, 2)
        analyzerGain.gain.setTargetAtTime(scaledValue, ctx.currentTime, 0.1)
      }
      
      return analyser
    } catch (err) {
      console.error('Failed to create analyser:', err)
      return null
    }
  }, [])

  // Optimized volume control
  const setVolume = useCallback((value: number) => {
    const masterGain = masterGainRef.current
    const ctx = audioContextRef.current
    if (masterGain && ctx) {
      const safeValue = Math.max(0, Math.min(1, value))
      masterGain.gain.setTargetAtTime(safeValue, ctx.currentTime, 0.01)
    }
  }, [])

  // Efficient cleanup
  const cleanup = useCallback(() => {
    const ctx = audioContextRef.current
    if (ctx && ctx.state !== 'closed') {
      if (masterGainRef.current) {
        masterGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.01)
      }
      setTimeout(() => {
        ctx.close().catch(console.error)
        audioContextRef.current = null
        masterGainRef.current = null
        equalizerInputRef.current = null
        equalizerOutputRef.current = null
        setIsInitialized(false)
        setError(null)
      }, 20)
    }
  }, [])

  // Initialize once on mount
  useEffect(() => {
    void initContext()
    
    // Efficient visibility change handling
    const handleVisibilityChange = () => {
      const ctx = audioContextRef.current
      if (!ctx) return

      // Only resume if suspended, but never suspend when hidden
      if (!document.hidden && ctx.state === 'suspended') {
        void resumeContext().catch(console.error)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      cleanup()
    }
  }, [initContext, resumeContext, cleanup])

  const retry = useCallback(async () => {
    cleanup()
    await initContext()
  }, [cleanup, initContext])

  return (
    <AudioContext.Provider value={{
      audioContext: audioContextRef.current,
      masterGain: masterGainRef.current,
      createAnalyser,
      resumeContext,
      setVolume,
      cleanup,
      isInitialized,
      error,
      retry,
      equalizerInput: equalizerInputRef.current,
      equalizerOutput: equalizerOutputRef.current
    }}>
      {children}
    </AudioContext.Provider>
  )
}

