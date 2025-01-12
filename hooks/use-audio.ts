'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { debounce } from '@/utils/performance'
import { getStreamUrl } from '@/utils/stream-handler'
import { useAudioContext } from '@/components/audio-provider'
import type { Track, AudioState } from '@/types/audio'

const RETRY_ATTEMPTS = 3
const RETRY_DELAY = 2000
const CONNECTION_TIMEOUT = 10000

export function useAudio(tracks: Track[], initialTrackIndex = 0) {
  const { audioContext, masterGain, createAnalyser, resumeContext, setVolume: setMasterVolume } = useAudioContext()
  
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
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const retryAttemptsRef = useRef(0)
  const retryTimeoutRef = useRef<NodeJS.Timeout>()
  const connectionTimeoutRef = useRef<NodeJS.Timeout>()

  // Connect to stream
  const connectToStream = useCallback(async (url: string): Promise<void> => {
    if (!audioRef.current || !audioContext) return

    try {
      // Clear existing timeouts
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }

      // Disconnect existing nodes
      if (sourceRef.current) {
        sourceRef.current.disconnect()
      }

      setAudioState((prev: AudioState) => ({
        ...prev,
        isLoading: true,
        error: null,
        streamInfo: { connected: false }
      }))

      await resumeContext()

      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        const timeoutError = new Error('Connection timeout. Please try again.')
        console.error('Stream connection timeout:', timeoutError)
        
        setAudioState((prev: AudioState) => ({
          ...prev,
          error: timeoutError,
          isLoading: false,
          streamInfo: { connected: false }
        }))
        setIsPlaying(false)
      }, CONNECTION_TIMEOUT)

      // Get stream URL and info
      const streamInfo = await getStreamUrl(url)
      
      if (!streamInfo.url) {
        throw new Error('Invalid stream URL received')
      }

      // Update audio element
      audioRef.current.src = streamInfo.url
      audioRef.current.crossOrigin = 'anonymous'
      audioRef.current.preload = 'auto'
      
      // Create and connect nodes in proper order
      sourceRef.current = audioContext.createMediaElementSource(audioRef.current)
      
      // Create new analyser if needed
      if (!analyser) {
        const newAnalyser = createAnalyser()
        if (newAnalyser) {
          setAnalyser(newAnalyser)
        }
      }

      // Connect nodes in order: source -> gain -> analyser -> destination
      if (masterGain && analyser) {
        sourceRef.current.connect(masterGain)
        masterGain.connect(analyser)
        analyser.connect(audioContext.destination)
      } else if (masterGain) {
        // Fallback if no analyser
        sourceRef.current.connect(masterGain)
        masterGain.connect(audioContext.destination)
      } else {
        // Direct connection if no effects
        sourceRef.current.connect(audioContext.destination)
      }
      
      // Create a promise that resolves when the audio can play
      const canPlayPromise = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Audio load timeout'))
        }, 5000)

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
      
      setAudioState((prev: AudioState) => ({
        ...prev,
        error: null,
        isLoading: false,
        streamInfo: {
          connected: true,
          format: 'audio/mpeg',
          bitrate: 128
        }
      }))
    } catch (error) {
      console.error('Stream connection error:', error instanceof Error ? error.message : error)
      
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
      }

      // Clean up nodes on error
      if (sourceRef.current) {
        sourceRef.current.disconnect()
      }

      // Handle error with retry logic
      if (retryAttemptsRef.current < RETRY_ATTEMPTS) {
        const currentAttempts = retryAttemptsRef.current
        retryAttemptsRef.current = currentAttempts + 1
        
        console.log(`Retrying connection (attempt ${currentAttempts + 1}/${RETRY_ATTEMPTS})`)
        
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current)
        }
        
        retryTimeoutRef.current = setTimeout(async () => {
          try {
            await resumeContext()
            await connectToStream(url)
          } catch (retryError) {
            console.error('Retry failed:', retryError)
            setAudioState((prev: AudioState) => ({
              ...prev,
              error: new Error('Failed to reconnect after error'),
              isLoading: false
            }))
            setIsPlaying(false)
          }
        }, RETRY_DELAY * (currentAttempts + 1))
      } else {
        setAudioState((prev: AudioState) => ({
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
  }, [audioContext, masterGain, analyser, createAnalyser, isPlaying, resumeContext])

  // Volume control
  const setVolumeLevel = useCallback((level: number) => {
    if (!audioRef.current) return
    setVolume(level)
    setMasterVolume(level)
  }, [setMasterVolume])

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('Performing audio cleanup')
    
    // Clear all timeouts
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current)
      connectionTimeoutRef.current = undefined
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = undefined
    }

    // Reset audio element
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current.load()
    }

    // Clean up audio nodes
    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }

    // Reset state
    retryAttemptsRef.current = 0
    
    setAudioState((prev: AudioState) => ({
      ...prev,
      isLoading: false,
      error: null,
      currentTime: 0,
      duration: 0,
      isBuffering: false,
      streamInfo: {
        connected: false
      }
    }))
  }, [])

  // Track navigation
  const nextTrack = useCallback(() => {
    if (audioState.isLoading) return
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length)
  }, [tracks.length, audioState.isLoading])

  const previousTrack = useCallback(() => {
    if (audioState.isLoading) return
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length)
  }, [tracks.length, audioState.isLoading])

  // Seek control
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
    audioRef.current.volume = volume

    return cleanup
  }, [volume, cleanup])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioContext?.close()
      clearTimeout(connectionTimeoutRef.current)
      clearTimeout(retryTimeoutRef.current)
    }
  }, [])

  // Track change handler
  useEffect(() => {
    if (!audioRef.current || !tracks[currentTrackIndex]) return

    const audio = audioRef.current
    const currentTrack = tracks[currentTrackIndex]

    setAudioState((prev: AudioState) => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      currentTime: 0,
      duration: 0
    }))

    void connectToStream(currentTrack.audioUrl)
    audio.volume = volume

    const handleTimeUpdate = () => {
      setAudioState((prev: AudioState) => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
        isBuffering: false
      }))
      setProgress((audio.currentTime / (audio.duration || 1)) * 100)
    }

    const handleWaiting = () => {
      setAudioState((prev: AudioState) => ({ ...prev, isBuffering: true }))
    }

    const handlePlaying = () => {
      setAudioState((prev: AudioState) => ({ 
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

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [currentTrackIndex, tracks, volume, isPlaying, connectToStream, nextTrack])

  // Playback controls
  const togglePlay = useCallback(async () => {
    if (!audioRef.current || audioState.error) return

    try {
      await resumeContext()

      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        setAudioState((prev: AudioState) => ({ ...prev, isLoading: true }))
        await connectToStream(tracks[currentTrackIndex].audioUrl)
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('Playback error:', error)
      setAudioState((prev: AudioState) => ({
        ...prev,
        error: new Error('Unable to play audio stream'),
        isLoading: false
      }))
      setIsPlaying(false)
    }
  }, [isPlaying, audioState.error, resumeContext, connectToStream, tracks, currentTrackIndex])

  return {
    currentTrackIndex,
    isPlaying,
    volume,
    progress,
    audioState,
    analyser,
    togglePlay,
    nextTrack,
    previousTrack,
    setVolume: setVolumeLevel,
    seekTo
  }
}
