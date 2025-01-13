'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAudioContext } from '@/components/audio-provider'
import { throttle } from 'lodash'
import type { StreamState, StreamError, UseRadioStreamReturn } from '@/types/audio'
import { StreamErrorType } from '@/types/audio'

// Constants
const LOAD_TIMEOUT = 5000
const CONNECTION_TIMEOUT = 15000
const MAX_RECONNECT_ATTEMPTS = 5
const VOLUME_THROTTLE_MS = 50

// Function type declarations
type HandleStreamErrorFn = (error: Error | null, url: string) => void;
type ConnectToStreamFn = (url: string) => Promise<void>;
type DisconnectFn = () => void;
type SetVolumeFn = (value: number) => void;
type CleanupFn = () => void;

// Extended audio element interface for iOS support
interface ExtendedAudioElement extends HTMLAudioElement {
  playsInline?: boolean;
  webkitPlaysinline?: boolean;
}

export function useRadioStream(): UseRadioStreamReturn {
  const { audioContext, masterGain, createAnalyser, resumeContext } = useAudioContext()
  
  const [streamState, setStreamState] = useState<StreamState>({
    isBuffering: false,
    isConnected: false,
    retryCount: 0,
    error: undefined
  })
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout>()
  const connectionTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectCountRef = useRef<number>(0)
  const currentUrlRef = useRef<string>('')
  const volumeRef = useRef<number>(1)

  // State refs
  const handleStreamErrorRef = useRef<HandleStreamErrorFn>()
  const connectToStreamRef = useRef<ConnectToStreamFn>()

  // Add cleanupRef with explicit type
  const cleanupRef = useRef<CleanupFn | undefined>(undefined)

  // Add connection attempt tracking
  const initialLoadingRef = useRef<boolean>(true)
  const loadingTimeoutRef = useRef<NodeJS.Timeout>()

  // Create analyser when audio context is available
  useEffect(() => {
    if (audioContext && !analyserRef.current) {
      try {
        const newAnalyser = createAnalyser()
        if (newAnalyser) {
          newAnalyser.minDecibels = -90
          newAnalyser.maxDecibels = -10
          newAnalyser.smoothingTimeConstant = 0.85
          analyserRef.current = newAnalyser

          // Reconnect nodes with analyzer if source exists
          if (sourceNodeRef.current && masterGain) {
            sourceNodeRef.current.disconnect()
            masterGain.disconnect()
            
            sourceNodeRef.current.connect(newAnalyser)
            newAnalyser.connect(masterGain)
            masterGain.connect(audioContext.destination)
          }
        }
      } catch (error) {
        console.error('Failed to create analyzer:', error)
      }
    }

    return () => {
      if (analyserRef.current) {
        analyserRef.current.disconnect()
        analyserRef.current = null
      }
    }
  }, [audioContext, createAnalyser, masterGain])

  // Connect source to analyzer when source is created
  useEffect(() => {
    const source = sourceNodeRef.current
    const analyser = analyserRef.current
    
    if (source && analyser && masterGain && audioContext) {
      source.disconnect()
      masterGain.disconnect()
      
      source.connect(analyser)
      analyser.connect(masterGain)
      masterGain.connect(audioContext.destination)
    }
  }, [audioContext, masterGain])

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current.load()
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect()
      sourceNodeRef.current = null
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect()
    }
    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
    if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current)
  }, [])

  const ensureAudioContext = useCallback(async (): Promise<boolean> => {
    try {
      if (!audioContext) {
        await resumeContext()
        if (!audioContext) {
          throw new Error('Failed to initialize audio context')
        }
      }

      if (audioContext.state === 'suspended') {
        await resumeContext()
      }

      return true
    } catch (error) {
      console.error('Audio context initialization error:', error)
      throw new Error(`Audio context initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [audioContext, resumeContext])

  const disconnect = useCallback<DisconnectFn>(() => {
    cleanup()
    currentUrlRef.current = ''
    reconnectCountRef.current = 0
    setStreamState({
      isBuffering: false,
      isConnected: false,
      retryCount: 0,
      error: undefined
    })
  }, [cleanup])

  handleStreamErrorRef.current = useCallback<HandleStreamErrorFn>((error: Error | null, url: string) => {
    // Clear any existing loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }

    // Don't show errors during initial loading period unless it's a critical error
    if (initialLoadingRef.current) {
      if (error?.name === 'NotAllowedError') {
        // Handle permission errors immediately
        const streamError: StreamError = {
          type: StreamErrorType.PLAYBACK_NOT_ALLOWED,
          message: 'Playback not allowed. Please click again to start.'
        }
        setStreamState(prev => ({
          ...prev,
          error: streamError,
          isBuffering: false,
          isConnected: false
        }))
      } else {
        // For other errors, wait for the loading period
        loadingTimeoutRef.current = setTimeout(() => {
          initialLoadingRef.current = false
          if (!streamState.isConnected) {
            handleStreamErrorRef.current?.(error, url)
          }
        }, LOAD_TIMEOUT)
        return
      }
    }

    let streamError: StreamError = {
      type: StreamErrorType.UNKNOWN,
      message: 'An unknown error occurred'
    }

    if (error) {
      if (error.name === 'NotAllowedError') {
        streamError = {
          type: StreamErrorType.PLAYBACK_NOT_ALLOWED,
          message: 'Playback not allowed. Please click again to start.'
        }
      } else if (error.name === 'NotSupportedError') {
        streamError = {
          type: StreamErrorType.FORMAT_NOT_SUPPORTED,
          message: 'Stream format not supported. Please try a different station.'
        }
      } else {
        streamError = {
          type: StreamErrorType.NETWORK_ERROR,
          message: error.message
        }
      }
    }

    setStreamState(prev => ({
      ...prev,
      error: streamError,
      isBuffering: false,
      isConnected: false
    }))

    // Only attempt reconnection for network errors and when not in initial loading
    if (!initialLoadingRef.current && 
        streamError.type === StreamErrorType.NETWORK_ERROR && 
        reconnectCountRef.current < MAX_RECONNECT_ATTEMPTS) {
      reconnectCountRef.current++
      const backoffDelay = Math.min(1000 * Math.pow(2, reconnectCountRef.current), 30000)
      
      retryTimeoutRef.current = setTimeout(() => {
        if (connectToStreamRef.current) {
          connectToStreamRef.current(url)
        }
      }, backoffDelay)
    }
  }, [streamState.isConnected])

  // Throttled volume control to prevent performance issues
  const throttledVolumeSet = useCallback(() => {
    const throttled = throttle((value: number) => {
      volumeRef.current = value
      if (audioRef.current) {
        audioRef.current.volume = value
      }
    }, VOLUME_THROTTLE_MS)
    
    return {
      set: throttled,
      cancel: throttled.cancel
    }
  }, [])

  const volumeController = useRef(throttledVolumeSet())

  // Update volume controller when throttledVolumeSet changes
  useEffect(() => {
    volumeController.current = throttledVolumeSet()
    return () => volumeController.current.cancel()
  }, [throttledVolumeSet])

  const setVolume = useCallback<SetVolumeFn>((value: number) => {
    volumeController.current.set(value)
  }, [])

  connectToStreamRef.current = useCallback(async (url: string) => {
    initialLoadingRef.current = true
    // Run previous cleanup if exists
    const currentCleanup = cleanupRef.current
    if (currentCleanup) {
      currentCleanup()
      cleanupRef.current = undefined
    }

    currentUrlRef.current = url

    try {
      await ensureAudioContext()
      if (!audioContext) {
        throw new Error('Audio context not available')
      }

      // Request background audio permission
      if ('mediaSession' in navigator) {
        try {
          await document.querySelector('audio')?.play()
          document.querySelector('audio')?.pause()
        } catch (e) {
          console.warn('Could not request background audio permission:', e)
        }
      }

      const audio = new Audio()
      audio.crossOrigin = 'anonymous'
      audio.preload = 'auto'
      audio.volume = volumeRef.current
      // Enable background playback
      audio.autoplay = true
      // Handle non-standard attributes for cross-browser background playback
      const audioElement = audio as ExtendedAudioElement
      audioElement.playsInline = true
      audioElement.webkitPlaysinline = true
      audioRef.current = audio

      setStreamState(prev => ({
        ...prev,
        isBuffering: true,
        error: undefined
      }))

      connectionTimeoutRef.current = setTimeout(() => {
        if (handleStreamErrorRef.current) {
          handleStreamErrorRef.current(new Error('Connection timeout'), url)
        }
        if (cleanupRef.current) {
          cleanupRef.current()
        }
      }, CONNECTION_TIMEOUT)

      // Enable background playback with Media Session API
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'Radio Stream',
          artist: 'Live Radio'
        })
        
        // Set playback state
        navigator.mediaSession.playbackState = 'playing'
        
        // Handle media session actions
        navigator.mediaSession.setActionHandler('play', () => {
          audio.play().catch(console.error)
        })
        navigator.mediaSession.setActionHandler('pause', () => {
          audio.pause()
        })
        navigator.mediaSession.setActionHandler('stop', () => {
          audio.pause()
          audio.currentTime = 0
        })
      }

      // Prevent audio context suspension
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          if (audioContext?.state === 'suspended') {
            audioContext.resume().catch(console.error)
          }
          if (audio.paused) {
            audio.play().catch(console.error)
          }
        }
      }

      const handleStall = () => {
        if (streamState.isConnected && handleStreamErrorRef.current) {
          handleStreamErrorRef.current(new Error('Stream stalled'), url)
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)
      audio.addEventListener('stalled', handleStall)
      audio.addEventListener('suspend', handleStall)

      audio.src = url

      if (!sourceNodeRef.current) {
        sourceNodeRef.current = audioContext.createMediaElementSource(audio)
      }

      const source = sourceNodeRef.current
      const analyser = analyserRef.current

      if (source) {
        if (masterGain) {
          if (analyser) {
            source.connect(analyser)
            analyser.connect(masterGain)
            masterGain.connect(audioContext.destination)
          } else {
            source.connect(masterGain)
            masterGain.connect(audioContext.destination)
          }
        } else {
          source.connect(audioContext.destination)
        }
      }

      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Audio load timeout'))
        }, LOAD_TIMEOUT)

        const handleCanPlay = () => {
          clearTimeout(timeoutId)
          resolve(true)
        }

        const handleError = () => {
          clearTimeout(timeoutId)
          if (cleanupRef.current) {
            cleanupRef.current()
          }
          reject(audio.error)
        }

        audio.addEventListener('canplay', handleCanPlay, { once: true })
        audio.addEventListener('error', handleError, { once: true })
      })

      try {
        await audio.play()
        
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current)
        }

        reconnectCountRef.current = 0
        
        setStreamState(prev => ({
          ...prev,
          isBuffering: false,
          isConnected: true,
          error: undefined
        }))

        // Store cleanup function
        cleanupRef.current = () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange)
          audio.removeEventListener('stalled', handleStall)
          audio.removeEventListener('suspend', handleStall)
          audio.pause()
          audio.src = ''
          if (source) {
            source.disconnect()
          }
          if (analyser) {
            analyser.disconnect()
          }
          audioRef.current = null
          sourceNodeRef.current = null
        }

      } catch (playError) {
        if (playError instanceof Error && playError.name === 'NotAllowedError') {
          if (handleStreamErrorRef.current) {
            handleStreamErrorRef.current(new Error('Playback requires user interaction'), url)
          }
        } else {
          if (handleStreamErrorRef.current) {
            handleStreamErrorRef.current(playError instanceof Error ? playError : null, url)
          }
        }
        if (cleanupRef.current) {
          cleanupRef.current()
        }
      }

    } catch (error) {
      if (handleStreamErrorRef.current) {
        handleStreamErrorRef.current(error instanceof Error ? error : null, url)
      }
      const finalCleanup = cleanupRef.current
      if (finalCleanup) {
        finalCleanup()
      }
    }
  }, [audioContext, masterGain, streamState.isConnected, ensureAudioContext])

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && audioContext?.state === 'suspended') {
        audioContext.resume()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [audioContext])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
      volumeController.current.cancel()
    }
  }, [cleanup, volumeController])

  return {
    isConnected: streamState.isConnected,
    isBuffering: streamState.isBuffering,
    error: streamState.error,
    connectToStream: connectToStreamRef.current!,
    disconnect,
    setVolume,
    analyser: analyserRef.current
  }
}

