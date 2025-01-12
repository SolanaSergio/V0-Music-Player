'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { debounce } from '@/utils/performance'
import { getStreamUrl, checkStreamStatus } from '@/utils/stream-handler'
import type { Track, AudioState } from '@/types/audio'

const RETRY_ATTEMPTS = 3
const RETRY_DELAY = 2000
const BUFFER_SIZE = 2048
const CONNECTION_TIMEOUT = 10000

export function useAudio(tracks: Track[], initialTrackIndex = 0) {
  // State declarations
  const [currentTrackIndex, setCurrentTrackIndex] = useState(initialTrackIndex)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [progress, setProgress] = useState(0)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [audioState, setAudioState] = useState<AudioState>({
    isLoading: true,
    error: null,
    currentTime: 0,
    duration: 0,
    isBuffering: false,
    streamInfo: {
      connected: false
    }
  })

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const retryAttemptsRef = useRef(0)
  const retryTimeoutRef = useRef<NodeJS.Timeout>()
  const connectionTimeoutRef = useRef<NodeJS.Timeout>()
  const isInitialized = useRef(false)

  // Initialize audio context
  const initializeAudioContext = useCallback(async () => {
    if (!audioRef.current || isInitialized.current) return

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      audioContextRef.current = new AudioContext({
        latencyHint: 'interactive',
        sampleRate: 44100
      })

      const analyserNode = audioContextRef.current.createAnalyser()
      analyserNode.fftSize = BUFFER_SIZE
      analyserNode.smoothingTimeConstant = 0.8
      analyserNode.minDecibels = -90
      analyserNode.maxDecibels = -10

      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current)
      
      const gainNode = audioContextRef.current.createGain()
      sourceRef.current.connect(gainNode)
      gainNode.connect(analyserNode)
      analyserNode.connect(audioContextRef.current.destination)

      setAnalyser(analyserNode)
      isInitialized.current = true
    } catch (error) {
      console.error('Failed to initialize audio context:', error)
      setAudioState(prev => ({
        ...prev,
        error: new Error('Failed to initialize audio system'),
        isLoading: false
      }))
    }
  }, [])

  // Connect to stream
  const connectToStream = useCallback(async (url: string): Promise<void> => {
    if (!audioRef.current) return

    try {
      // Clear existing timeouts
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }

      setAudioState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        streamInfo: { connected: false }
      }))

      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        const timeoutError = new Error('Connection timeout. Please try again.')
        console.error('Stream connection timeout:', timeoutError)
        
        setAudioState(prev => ({
          ...prev,
          error: timeoutError,
          isLoading: false,
          streamInfo: { connected: false }
        }))
        setIsPlaying(false)
      }, CONNECTION_TIMEOUT)

      // Get stream URL and info - skip availability check
      const streamInfo = await getStreamUrl(url)
      
      // Update audio element
      audioRef.current.src = streamInfo.url
      audioRef.current.crossOrigin = 'anonymous'
      
      // Set MIME type using preload instead of deprecated type property
      audioRef.current.preload = 'auto'
      
      // Create a promise that resolves when the audio can play
      const canPlayPromise = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Audio load timeout'))
        }, 5000) // 5 second timeout

        const handleCanPlay = () => {
          clearTimeout(timeoutId)
          audioRef.current?.removeEventListener('canplay', handleCanPlay)
          audioRef.current?.removeEventListener('error', handleError)
          resolve(true)
        }

        const handleError = (e: Event) => {
          clearTimeout(timeoutId)
          audioRef.current?.removeEventListener('canplay', handleCanPlay)
          audioRef.current?.removeEventListener('error', handleError)
          reject(new Error('Audio load failed'))
        }

        audioRef.current?.addEventListener('canplay', handleCanPlay)
        audioRef.current?.addEventListener('error', handleError)
      })
      
      // Load and wait for can play
      audioRef.current.load()
      await canPlayPromise
      
      clearTimeout(connectionTimeoutRef.current)

      if (isPlaying) {
        try {
          const playPromise = audioRef.current.play()
          if (playPromise !== undefined) {
            await playPromise
          }
        } catch (playError) {
          console.error('Playback error:', playError)
          throw new Error(
            playError instanceof Error 
              ? playError.message 
              : 'Failed to start playback'
          )
        }
      }

      // Reset retry counter on success
      retryAttemptsRef.current = 0
      
      setAudioState(prev => ({
        ...prev,
        error: null,
        isLoading: false,
        streamInfo: {
          connected: true,
          format: 'audio/mpeg',
          bitrate: 128 // Default bitrate
        }
      }))
    } catch (error) {
      console.error('Stream connection error:', error instanceof Error ? error.message : error)
      
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
      }

      // Implement retry logic with exponential backoff
      if (retryAttemptsRef.current < RETRY_ATTEMPTS) {
        retryAttemptsRef.current++
        const backoffDelay = RETRY_DELAY * Math.pow(2, retryAttemptsRef.current - 1)
        console.log(`Retrying connection (attempt ${retryAttemptsRef.current}/${RETRY_ATTEMPTS}) in ${backoffDelay}ms...`)
        
        retryTimeoutRef.current = setTimeout(() => {
          connectToStream(url)
        }, backoffDelay)
      } else {
        setAudioState(prev => ({
          ...prev,
          error: new Error(
            error instanceof Error 
              ? error.message 
              : 'Failed to connect to stream'
          ),
          isLoading: false,
          streamInfo: { connected: false }
        }))
        setIsPlaying(false)
      }
    }
  }, [isPlaying])

  // Playback controls
  const togglePlay = useCallback(async () => {
    if (!audioRef.current || audioState.error) return

    try {
      if (!isInitialized.current) {
        await initializeAudioContext()
      }

      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        setAudioState(prev => ({ ...prev, isLoading: true }))
        await connectToStream(tracks[currentTrackIndex].audioUrl)
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('Playback error:', error)
      setAudioState(prev => ({
        ...prev,
        error: new Error('Unable to play audio stream'),
        isLoading: false
      }))
      setIsPlaying(false)
    }
  }, [isPlaying, audioState.error, initializeAudioContext, connectToStream, tracks, currentTrackIndex])

  const nextTrack = useCallback(() => {
    if (audioState.isLoading) return
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length)
  }, [tracks.length, audioState.isLoading])

  const previousTrack = useCallback(() => {
    if (audioState.isLoading) return
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length)
  }, [tracks.length, audioState.isLoading])

  const setVolumeLevel = useCallback((level: number) => {
    if (!audioRef.current) return
    audioRef.current.volume = level
    setVolume(level)
  }, [])

  const seekTo = useCallback(
    debounce((percent: number) => {
      if (!audioRef.current || audioState.error) return
      const time = (percent / 100) * (audioRef.current.duration || 0)
      if (isFinite(time)) {
        audioRef.current.currentTime = time
      }
    }, 100),
    [audioState.error]
  )

  // Initialize audio element
  useEffect(() => {
    if (typeof window === 'undefined') return

    audioRef.current = new Audio()
    audioRef.current.crossOrigin = 'anonymous'
    audioRef.current.preload = 'auto'
    audioRef.current.preservesPitch = true
    audioRef.current.volume = volume

    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current.load()
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect()
      }
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close()
      }
      isInitialized.current = false
    }
  }, [volume])

  // Handle track changes and audio events
  useEffect(() => {
    if (!audioRef.current || !tracks[currentTrackIndex]) return

    const audio = audioRef.current
    const currentTrack = tracks[currentTrackIndex]

    setAudioState(prev => ({ ...prev, isLoading: true, error: null }))
    connectToStream(currentTrack.audioUrl)
    audio.volume = volume

    const handleCanPlay = () => {
      setAudioState(prev => ({ ...prev, isLoading: false, error: null }))
      if (isPlaying) {
        audio.play().catch(() => {
          setIsPlaying(false)
          setAudioState(prev => ({
            ...prev,
            error: new Error('Failed to resume playback'),
            isLoading: false
          }))
        })
      }
    }

    const handleTimeUpdate = () => {
      setAudioState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
        isBuffering: false
      }))
      setProgress((audio.currentTime / (audio.duration || 1)) * 100)
    }

    const handleError = () => {
      console.error('Audio error:', audio.error)
      if (audio.error?.code === MediaError.MEDIA_ERR_NETWORK && retryAttemptsRef.current < RETRY_ATTEMPTS) {
        retryAttemptsRef.current++
        retryTimeoutRef.current = setTimeout(() => {
          connectToStream(currentTrack.audioUrl)
        }, RETRY_DELAY * retryAttemptsRef.current)
      } else {
        setAudioState(prev => ({
          ...prev,
          error: new Error(audio.error?.message || 'Failed to load audio stream'),
          isLoading: false,
          streamInfo: {
            ...prev.streamInfo,
            connected: false
          }
        }))
        setIsPlaying(false)
      }
    }

    const handleWaiting = () => {
      setAudioState(prev => ({ ...prev, isBuffering: true }))
    }

    const handlePlaying = () => {
      setAudioState(prev => ({ 
        ...prev, 
        isBuffering: false, 
        error: null,
        streamInfo: {
          ...prev.streamInfo,
          connected: true
        }
      }))
    }

    const handleEnded = () => {
      if (isPlaying) {
        nextTrack()
      }
    }

    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('error', handleError)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [currentTrackIndex, tracks, volume, isPlaying, nextTrack, connectToStream])

  return {
    currentTrack: tracks[currentTrackIndex],
    isPlaying,
    volume,
    progress,
    analyser,
    audioState,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume: setVolumeLevel,
  }
}

