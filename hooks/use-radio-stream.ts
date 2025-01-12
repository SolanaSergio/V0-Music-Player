import { useState, useEffect, useRef, useCallback } from 'react'
import type { StreamState } from '@/types/audio'
import { getStreamUrl } from '@/utils/stream-handler'
import { useAudioContext } from '@/components/audio-provider'

const RETRY_ATTEMPTS = 3
const RETRY_DELAY = 2000
const CONNECTION_TIMEOUT = 15000

export function useRadioStream() {
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
  const volumeRef = useRef<number>(1)

  const cleanup = useCallback(() => {
    console.log('Cleaning up radio stream resources')
    if (audioRef.current) {
      console.log('Stopping audio playback')
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current.load()
    }
    if (sourceNodeRef.current) {
      console.log('Disconnecting source node')
      sourceNodeRef.current.disconnect()
      sourceNodeRef.current = null
    }
    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
    if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current)
    console.log('Cleanup complete')
  }, [])

  const connectToStream = useCallback(async (url: string) => {
    cleanup()
    console.log('Connecting to stream:', url)

    try {
      if (!audioContext) {
        throw new Error('Audio context not initialized')
      }

      await resumeContext()

      // Create audio element with proper configuration
      console.log('Creating new Audio element')
      const audio = new Audio()
      audio.crossOrigin = 'anonymous' // Set before any other operations
      audio.preload = 'auto'
      audio.volume = volumeRef.current
      audioRef.current = audio

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
      audio.src = streamResponse.url

      // Create and connect nodes in the correct order
      if (!sourceNodeRef.current) {
        sourceNodeRef.current = audioContext.createMediaElementSource(audio)
      }

      if (!analyserRef.current) {
        analyserRef.current = createAnalyser()
      }

      // Proper connection chain: source -> gain -> analyser -> destination
      if (masterGain && analyserRef.current) {
        console.log('Connecting audio nodes')
        sourceNodeRef.current.disconnect() // Ensure clean connections
        sourceNodeRef.current.connect(masterGain)
        masterGain.disconnect() // Ensure clean connections
        masterGain.connect(analyserRef.current)
        analyserRef.current.connect(audioContext.destination)
      } else {
        // Fallback connection if nodes are missing
        console.log('Fallback: Connecting source directly to destination')
        sourceNodeRef.current.disconnect()
        sourceNodeRef.current.connect(audioContext.destination)
      }
      
      // Create a promise that resolves when the audio can play
      const canPlayPromise = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          console.log('Audio load timeout reached')
          reject(new Error('Audio load timeout'))
        }, 5000)

        const handleCanPlay = () => {
          console.log('Audio can play event received')
          clearTimeout(timeoutId)
          audio.removeEventListener('canplay', handleCanPlay)
          audio.removeEventListener('error', handleError)
          resolve(true)
        }

        const handleError = (e: Event) => {
          const audioError = audio.error
          console.error('Audio error during load:', {
            error: e,
            code: audioError?.code,
            message: audioError?.message
          })
          clearTimeout(timeoutId)
          audio.removeEventListener('canplay', handleCanPlay)
          audio.removeEventListener('error', handleError)
          reject(new Error(`Audio load failed: ${audioError?.message || 'Unknown error'}`))
        }

        audio.addEventListener('canplay', handleCanPlay)
        audio.addEventListener('error', handleError)
      })

      // Load and wait for can play
      console.log('Loading audio...')
      audio.load()
      await canPlayPromise
      console.log('Audio loaded successfully')
      
      // Try to play
      try {
        console.log('Attempting to play...')
        await audio.play()
        console.log('Playback started successfully')
      } catch (playError) {
        console.error('Play error:', playError)
        if (playError instanceof Error) {
          if (playError.name === 'NotAllowedError') {
            setStreamState(prev => ({
              ...prev,
              error: 'Playback not allowed. Please click again to start.',
              isBuffering: false,
              isConnected: false
            }))
            return
          } else if (playError.name === 'NotSupportedError') {
            setStreamState(prev => ({
              ...prev,
              error: 'Stream format not supported. Please try a different station.',
              isBuffering: false,
              isConnected: false
            }))
            return
          }
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
  }, [cleanup, streamState.retryCount, audioContext, masterGain, createAnalyser, resumeContext])

  const disconnect = useCallback(() => {
    console.log('Disconnecting stream')
    cleanup()
    setStreamState({
      isBuffering: false,
      isConnected: false,
      retryCount: 0
    })
  }, [cleanup])

  const setVolume = useCallback((value: number) => {
    volumeRef.current = value
    if (audioRef.current) {
      audioRef.current.volume = value
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return {
    ...streamState,
    connectToStream,
    disconnect,
    setVolume,
    analyser: analyserRef.current
  }
}

