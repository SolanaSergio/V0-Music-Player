'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAudioContext } from '@/components/audio-provider'
import type { StreamState } from '@/types/audio'

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

  useEffect(() => {
    if (audioContext && !analyserRef.current) {
      analyserRef.current = createAnalyser()
    }
  }, [audioContext, createAnalyser])

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
      console.log('Audio context resumed')

      // Create audio element with proper configuration
      console.log('Creating new Audio element')
      const audio = new Audio()
      audio.crossOrigin = 'anonymous'
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
        cleanup()
      }, 30000) // 30 seconds timeout

      try {
        // Get stream URL with proper format
        console.log('Setting audio source:', url)
        audio.src = url

        // Create and connect nodes in the correct order
        if (sourceNodeRef.current) {
          sourceNodeRef.current.disconnect()
        }
        sourceNodeRef.current = audioContext.createMediaElementSource(audio)

        // Ensure analyser exists
        if (!analyserRef.current) {
          analyserRef.current = createAnalyser()
        }

        // Proper connection chain: source -> gain -> analyser -> destination
        if (masterGain && analyserRef.current) {
          console.log('Connecting audio nodes')
          sourceNodeRef.current.connect(masterGain)
          masterGain.connect(analyserRef.current)
          analyserRef.current.connect(audioContext.destination)
        } else {
          // Fallback connection if nodes are missing
          console.log('Fallback: Connecting source directly to destination')
          sourceNodeRef.current.connect(audioContext.destination)
        }
        
        // Create a promise that resolves when the audio can play
        const canPlayPromise = new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            console.log('Audio load timeout reached')
            reject(new Error('Audio load timeout'))
          }, 10000)

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
        await canPlayPromise
        console.log('Audio loaded successfully')
        
        // Try to play
        try {
          console.log('Attempting to play...')
          await audio.play()
          console.log('Playback started successfully')

          // Clear connection timeout on successful connection
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current)
          }

          setStreamState(prev => ({
            ...prev,
            isBuffering: false,
            isConnected: true,
            error: undefined
          }))

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
              cleanup()
              return
            } else if (playError.name === 'NotSupportedError') {
              setStreamState(prev => ({
                ...prev,
                error: 'Stream format not supported. Please try a different station.',
                isBuffering: false,
                isConnected: false
              }))
              cleanup()
              return
            }
          }
          throw playError
        }

      } catch (error) {
        console.error('Stream connection error:', error)
        setStreamState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to connect to stream',
          isBuffering: false,
          isConnected: false
        }))
        cleanup()
      }

    } catch (error) {
      console.error('Stream setup error:', error)
      setStreamState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to setup audio',
        isBuffering: false,
        isConnected: false
      }))
      cleanup()
    }
  }, [audioContext, masterGain, createAnalyser, resumeContext, cleanup])

  const disconnect = useCallback(() => {
    console.log('Disconnecting stream')
    cleanup()
    setStreamState({
      isBuffering: false,
      isConnected: false,
      retryCount: 0,
      error: undefined
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
    isConnected: streamState.isConnected,
    isBuffering: streamState.isBuffering,
    error: streamState.error,
    connectToStream,
    disconnect,
    setVolume,
    analyser: analyserRef.current
  }
}

