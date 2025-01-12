import { useState, useEffect, useRef, useCallback } from 'react'
import type { RadioStation, StreamState } from '@/types/audio'
import { getStreamUrl } from '@/utils/stream-handler'

const RETRY_ATTEMPTS = 3
const RETRY_DELAY = 2000
const BUFFER_CHECK_INTERVAL = 1000
const CONNECTION_TIMEOUT = 15000

export function useRadioStream() {
  const [streamState, setStreamState] = useState<StreamState>({
    isBuffering: false,
    isConnected: false,
    retryCount: 0,
    error: undefined
  })
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout>()
  const bufferCheckRef = useRef<NodeJS.Timeout>()
  const connectionTimeoutRef = useRef<NodeJS.Timeout>()
  const volumeRef = useRef<number>(1)

  const cleanup = useCallback(() => {
    console.log('Cleaning up audio resources')
    if (audioRef.current) {
      console.log('Stopping audio playback')
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current.load()
    }
    if (sourceNodeRef.current) {
      console.log('Disconnecting source node')
      sourceNodeRef.current.disconnect()
    }
    if (audioContextRef.current?.state !== 'closed') {
      console.log('Closing audio context')
      audioContextRef.current?.close()
    }
    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
    if (bufferCheckRef.current) clearTimeout(bufferCheckRef.current)
    if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current)
    console.log('Cleanup complete')
  }, [])

  const initAudioContext = useCallback(async () => {
    if (!audioRef.current) {
      console.error('No audio element available')
      return
    }

    try {
      console.log('Initializing audio context')
      // Create new audio context if needed
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        audioContextRef.current = new AudioContext({
          latencyHint: 'interactive',
          sampleRate: 44100
        })
        console.log('Created new audio context, state:', audioContextRef.current.state)
      }

      // Resume context if suspended
      if (audioContextRef.current.state === 'suspended') {
        console.log('Resuming suspended audio context')
        await audioContextRef.current.resume()
        console.log('Audio context resumed, state:', audioContextRef.current.state)
      }

      // Create and connect source node if needed
      if (!sourceNodeRef.current) {
        console.log('Creating media element source')
        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current)
        sourceNodeRef.current.connect(audioContextRef.current.destination)
        console.log('Source node connected to destination')
      }
    } catch (error) {
      console.error('Failed to initialize audio context:', error)
      throw error
    }
  }, [])

  const setVolume = useCallback((value: number) => {
    volumeRef.current = value
    if (audioRef.current) {
      audioRef.current.volume = value
    }
  }, [])

  const connectToStream = useCallback(async (url: string) => {
    cleanup()
    console.log('Connecting to stream:', url)

    try {
      if (!audioRef.current) {
        console.log('Creating new Audio element')
        audioRef.current = new Audio()
        audioRef.current.preload = 'auto'
        audioRef.current.crossOrigin = 'anonymous'
        audioRef.current.volume = volumeRef.current
      }

      // Initialize audio context before setting up stream
      console.log('Initializing audio context')
      await initAudioContext()

      setStreamState(prev => ({
        ...prev,
        isBuffering: true,
        error: undefined
      }))

      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        console.log('Connection timeout reached')
        setStreamState(prev => ({
          ...prev,
          error: 'Connection timeout. Please try again.',
          isBuffering: false,
          isConnected: false
        }))
      }, CONNECTION_TIMEOUT)

      // Get stream URL with proper format
      console.log('Getting stream URL...')
      const streamResponse = await getStreamUrl(url)
      console.log('Stream response:', streamResponse)
      
      if (!streamResponse.url) {
        throw new Error('Invalid stream URL received')
      }

      // Configure audio element
      console.log('Setting audio source:', streamResponse.url)
      audioRef.current.src = streamResponse.url
      
      // Create a promise that resolves when the audio can play
      const canPlayPromise = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          console.log('Audio load timeout reached')
          reject(new Error('Audio load timeout'))
        }, 5000)

        const handleCanPlay = () => {
          console.log('Audio can play event received')
          clearTimeout(timeoutId)
          audioRef.current?.removeEventListener('canplay', handleCanPlay)
          audioRef.current?.removeEventListener('error', handleError)
          resolve(true)
        }

        const handleError = (e: Event) => {
          const audioError = audioRef.current?.error
          console.error('Audio error during load:', {
            error: e,
            code: audioError?.code,
            message: audioError?.message
          })
          clearTimeout(timeoutId)
          audioRef.current?.removeEventListener('canplay', handleCanPlay)
          audioRef.current?.removeEventListener('error', handleError)
          reject(new Error(`Audio load failed: ${audioError?.message || 'Unknown error'}`))
        }

        audioRef.current?.addEventListener('canplay', handleCanPlay)
        audioRef.current?.addEventListener('error', handleError)
      })

      // Load and wait for can play
      console.log('Loading audio...')
      audioRef.current.load()
      await canPlayPromise
      console.log('Audio loaded successfully')
      
      // Try to play
      try {
        console.log('Attempting to play...')
        await audioRef.current.play()
        console.log('Playback started successfully')
      } catch (playError) {
        console.error('Play error:', playError)
        if (playError instanceof Error && playError.name === 'NotAllowedError') {
          setStreamState(prev => ({
            ...prev,
            error: 'Playback not allowed. Please click again to start.',
            isBuffering: false,
            isConnected: false
          }))
          return
        }
        throw playError
      }

      // Clear connection timeout on successful connection
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
      }

      setStreamState(prev => ({
        ...prev,
        isBuffering: false,
        isConnected: true,
        retryCount: 0,
        error: undefined
      }))
      console.log('Stream connected successfully')

    } catch (error) {
      console.error('Stream connection error:', error)
      
      // Handle media format error
      if (audioRef.current?.error?.code === 4) {
        setStreamState(prev => ({
          ...prev,
          error: 'Stream format not supported. Please try a different station.',
          isBuffering: false,
          isConnected: false
        }))
        return
      }

      // Handle network errors with retry logic
      if (streamState.retryCount < RETRY_ATTEMPTS) {
        const delay = RETRY_DELAY * Math.pow(2, streamState.retryCount)
        console.log(`Retrying connection in ${delay}ms (attempt ${streamState.retryCount + 1}/${RETRY_ATTEMPTS})`)
        
        retryTimeoutRef.current = setTimeout(() => {
          setStreamState(prev => ({
            ...prev,
            retryCount: prev.retryCount + 1
          }))
          connectToStream(url)
        }, delay)
      } else {
        setStreamState(prev => ({
          ...prev,
          error: 'Unable to connect to stream. Please try again later.',
          isBuffering: false,
          isConnected: false
        }))
      }
    }
  }, [cleanup, streamState.retryCount, initAudioContext])

  const disconnect = useCallback(() => {
    console.log('Disconnecting stream')
    cleanup()
    setStreamState({
      isBuffering: false,
      isConnected: false,
      retryCount: 0
    })
  }, [cleanup])

  useEffect(() => {
    if (!audioRef.current) return

    const audio = audioRef.current

    const handlePlay = () => {
      console.log('Play event received')
      setStreamState(prev => ({
        ...prev,
        isBuffering: false,
        isConnected: true,
        error: undefined
      }))
    }

    const handlePause = () => {
      console.log('Pause event received')
      setStreamState(prev => ({
        ...prev,
        isBuffering: false,
        isConnected: false
      }))
    }

    const handleWaiting = () => {
      console.log('Waiting event received')
      setStreamState(prev => ({
        ...prev,
        isBuffering: true
      }))
    }

    const handlePlaying = () => {
      console.log('Playing event received')
      setStreamState(prev => ({
        ...prev,
        isBuffering: false,
        isConnected: true
      }))
    }

    const handleError = (e: ErrorEvent) => {
      console.error('Audio error event:', e)
      console.log('Audio element error state:', audioRef.current?.error)
      const error = audioRef.current?.error
      let errorMessage = 'Stream playback error. Please try again.'

      if (error) {
        switch (error.code) {
          case 1: // MEDIA_ERR_ABORTED
            errorMessage = 'Playback aborted. Please try again.'
            break
          case 2: // MEDIA_ERR_NETWORK
            errorMessage = 'Network error. Please check your connection.'
            break
          case 3: // MEDIA_ERR_DECODE
            errorMessage = 'Stream decode error. Please try again.'
            break
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            errorMessage = 'Stream format not supported. Please try a different station.'
            break
        }
      }

      setStreamState(prev => ({
        ...prev,
        error: errorMessage,
        isBuffering: false,
        isConnected: false
      }))
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('error', handleError as EventListener)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('error', handleError as EventListener)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return {
    streamState,
    connect: connectToStream,
    disconnect,
    setVolume
  }
}

