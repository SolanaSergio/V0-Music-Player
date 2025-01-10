import { useState, useEffect, useRef, useCallback } from 'react'
import type { RadioStation, StreamState } from '@/types/audio'

const RETRY_ATTEMPTS = 3
const RETRY_DELAY = 2000
const BUFFER_CHECK_INTERVAL = 1000
const CONNECTION_TIMEOUT = 10000

export function useRadioStream(station?: RadioStation) {
  const [streamState, setStreamState] = useState<StreamState>({
    isBuffering: true,
    isConnected: false,
    retryCount: 0
  })
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout>()
  const bufferCheckRef = useRef<NodeJS.Timeout>()
  const connectionTimeoutRef = useRef<NodeJS.Timeout>()

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current.load()
    }
    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
    if (bufferCheckRef.current) clearTimeout(bufferCheckRef.current)
    if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current)
  }, [])

  const connectToStream = useCallback(async (url: string) => {
    cleanup()

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio()
        audioRef.current.preload = 'auto'
        audioRef.current.crossOrigin = 'anonymous'
        // Add CORS headers for stream requests
        audioRef.current.addEventListener('error', (e) => {
          console.error('Audio error:', e)
          if (audioRef.current?.error?.code === 2) {
            // Try fallback CORS proxy if available
            const corsProxy = 'https://cors-anywhere.herokuapp.com/'
            audioRef.current.src = corsProxy + url
          }
        })
      }

      setStreamState(prev => ({
        ...prev,
        isBuffering: true,
        error: undefined
      }))

      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        setStreamState(prev => ({
          ...prev,
          error: 'Connection timeout. Please try again.',
          isBuffering: false,
          isConnected: false
        }))
      }, CONNECTION_TIMEOUT)

      audioRef.current.src = url
      await audioRef.current.play()

      // Clear connection timeout on successful connection
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
      }

      setStreamState(prev => ({
        ...prev,
        isBuffering: false,
        isConnected: true,
        retryCount: 0
      }))

    } catch (error) {
      console.error('Stream connection error:', error)
  
      setStreamState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to connect to stream',
        isBuffering: false,
        isConnected: false
      }))

      // Only retry on network errors
      if (error instanceof Error && error.name === 'NotAllowedError') {
        setStreamState(prev => ({
          ...prev,
          error: 'Please interact with the page first before playing audio.',
          isBuffering: false,
          isConnected: false
        }))
        return
      }
      if (streamState.retryCount < RETRY_ATTEMPTS) {
        retryTimeoutRef.current = setTimeout(() => {
          setStreamState(prev => ({
            ...prev,
            retryCount: prev.retryCount + 1
          }))
          connectToStream(url)
        }, RETRY_DELAY * Math.pow(2, streamState.retryCount))
      } else {
        setStreamState(prev => ({
          ...prev,
          error: 'Failed to connect to stream. Please try again later.',
          isBuffering: false,
          isConnected: false
        }))
      }
    }
  }, [cleanup, streamState.retryCount])

  const disconnect = useCallback(() => {
    cleanup()
    setStreamState({
      isBuffering: false,
      isConnected: false,
      retryCount: 0
    })
  }, [cleanup])

  useEffect(() => {
    if (station?.streamUrl && streamState.isConnected) {
      connectToStream(station.streamUrl)
    }
    return cleanup
  }, [station, streamState.isConnected, connectToStream, cleanup])

  // Set up audio event listeners
  useEffect(() => {
    if (!audioRef.current) return

    const audio = audioRef.current

    const handlePlay = () => {
      setStreamState(prev => ({
        ...prev,
        isBuffering: false,
        isConnected: true
      }))
    }

    const handlePause = () => {
      setStreamState(prev => ({
        ...prev,
        isBuffering: false
      }))
    }

    const handleWaiting = () => {
      setStreamState(prev => ({
        ...prev,
        isBuffering: true
      }))
    }

    const handleError = (e: ErrorEvent) => {
      console.error('Audio error:', e)
      setStreamState(prev => ({
        ...prev,
        error: 'Stream playback error. Please try again.',
        isBuffering: false,
        isConnected: false
      }))
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('error', handleError as EventListener)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('error', handleError as EventListener)
    }
  }, [])

  return {
    streamState,
    connect: connectToStream,
    disconnect
  }
}

