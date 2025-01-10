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
    retryCount: 0
  })
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout>()
  const bufferCheckRef = useRef<NodeJS.Timeout>()
  const connectionTimeoutRef = useRef<NodeJS.Timeout>()
  const volumeRef = useRef<number>(1)

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

  const setVolume = useCallback((value: number) => {
    volumeRef.current = value
    if (audioRef.current) {
      audioRef.current.volume = value
    }
  }, [])

  const connectToStream = useCallback(async (url: string) => {
    cleanup()

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio()
        audioRef.current.preload = 'auto'
        audioRef.current.crossOrigin = 'anonymous'
        audioRef.current.volume = volumeRef.current
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

      // Get stream URL with proper format
      const streamResponse = await getStreamUrl(url)
      
      // Try direct connection first
      try {
        audioRef.current.src = streamResponse.url
        await audioRef.current.play()
      } catch (error) {
        // If direct connection fails, try with CORS proxy
        if (error instanceof Error && (
          error.name === 'NotSupportedError' || 
          error.name === 'NotAllowedError' ||
          (audioRef.current?.error?.code === 2) || // MEDIA_ERR_NETWORK
          (audioRef.current?.error?.code === 4)    // MEDIA_ERR_SRC_NOT_SUPPORTED
        )) {
          const corsProxy = 'https://cors-anywhere.herokuapp.com/'
          const proxyUrl = corsProxy + url
          audioRef.current.src = proxyUrl
          await audioRef.current.play()
        } else {
          throw error
        }
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

      // Handle user interaction requirement
      if (error instanceof Error && error.name === 'NotAllowedError') {
        setStreamState(prev => ({
          ...prev,
          error: 'Please click again to start playback.',
          isBuffering: false,
          isConnected: false
        }))
        return
      }

      // Handle other errors with retry logic
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
    if (!audioRef.current) return

    const audio = audioRef.current

    const handlePlay = () => {
      setStreamState(prev => ({
        ...prev,
        isBuffering: false,
        isConnected: true,
        error: undefined
      }))
    }

    const handlePause = () => {
      setStreamState(prev => ({
        ...prev,
        isBuffering: false,
        isConnected: false
      }))
    }

    const handleWaiting = () => {
      setStreamState(prev => ({
        ...prev,
        isBuffering: true
      }))
    }

    const handlePlaying = () => {
      setStreamState(prev => ({
        ...prev,
        isBuffering: false,
        isConnected: true
      }))
    }

    const handleError = (e: ErrorEvent) => {
      console.error('Audio error:', e)
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

