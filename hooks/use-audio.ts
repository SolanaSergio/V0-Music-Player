'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAudioContext } from '@/components/audio-provider'
import { getStreamUrl } from '@/utils/stream-handler'
import { Track } from '@/types/audio'

export function useAudio(tracks?: Track[], initialTrackIndex = 0) {
  const { audioContext, masterGain, createAnalyser } = useAudioContext()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout>()
  const maxRetries = 3
  const retryDelayMs = 2000

  const [currentTrackIndex, setCurrentTrackIndex] = useState(initialTrackIndex)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [streamInfo, setStreamInfo] = useState<{
    format: string | null
    bitrate: number | null
    sampleRate: number | null
  }>({
    format: null,
    bitrate: null,
    sampleRate: null
  })

  const allTracks = tracks || []
  const currentTrack = allTracks[currentTrackIndex]

  // Track navigation
  const advanceToNextTrack = useCallback(() => {
    if (isLoading || allTracks.length === 0) return
    setCurrentTrackIndex(prev => (prev + 1) % allTracks.length)
  }, [isLoading, allTracks.length])

  const goToPreviousTrack = useCallback(() => {
    if (isLoading || allTracks.length === 0) return
    setCurrentTrackIndex(prev => (prev - 1 + allTracks.length) % allTracks.length)
  }, [isLoading, allTracks.length])

  // Create audio element and connect to audio context
  const connectToStream = useCallback(async (track: Track, retryCount = 0) => {
    if (!audioContext || !masterGain) {
      console.error('Audio context or master gain not initialized')
      setError('Audio system not initialized')
      setIsLoading(false)
      return
    }

    try {
      setError(null)
      setIsLoading(true)
      console.log('Connecting to stream:', track.audioUrl)

      // Get stream URL with format detection
      const { url, format } = await getStreamUrl(track.audioUrl)
      console.log('Stream URL resolved:', { url, format })

      // Create new audio element if needed
      if (!audioRef.current) {
        audioRef.current = new Audio()
        audioRef.current.crossOrigin = 'anonymous'
        audioRef.current.preload = 'auto'
      }

      // Update stream info
      setStreamInfo(prev => ({
        ...prev,
        format: format || null
      }))

      // Set up audio element
      const audio = audioRef.current
      audio.src = url
      audio.volume = volume

      // Wait for audio to be ready
      await new Promise((resolve, reject) => {
        const loadTimeout = setTimeout(() => {
          reject(new Error('Audio load timeout'))
        }, 10000)

        audio.oncanplay = () => {
          clearTimeout(loadTimeout)
          resolve(true)
        }

        audio.onerror = () => {
          clearTimeout(loadTimeout)
          reject(new Error(`Audio load error: ${audio.error?.message || 'Unknown error'}`))
        }
      })

      // Connect to audio context
      if (!sourceRef.current) {
        sourceRef.current = audioContext.createMediaElementSource(audio)
      }

      // Create new analyzer if needed
      if (!analyserRef.current) {
        analyserRef.current = createAnalyser()
      }

      // Connect nodes if we have an analyzer
      const source = sourceRef.current
      const analyser = analyserRef.current
      if (analyser) {
        source.connect(masterGain)
        masterGain.connect(analyser)
        analyser.connect(audioContext.destination)
      } else {
        // Fallback if no analyzer
        source.connect(masterGain)
        masterGain.connect(audioContext.destination)
      }

      // Set up event listeners
      audio.onplay = () => setIsPlaying(true)
      audio.onpause = () => setIsPlaying(false)
      audio.ontimeupdate = () => setCurrentTime(audio.currentTime)
      audio.ondurationchange = () => {
        setDuration(audio.duration)
        setStreamInfo(prev => ({
          ...prev,
          sampleRate: audioContext.sampleRate,
          bitrate: null // We don't know the bitrate
        }))
      }
      audio.onended = () => {
        if (currentTrackIndex < allTracks.length - 1) {
          advanceToNextTrack()
        } else {
          setIsPlaying(false)
        }
      }

      // Clear any existing retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = undefined
      }

      setIsLoading(false)
      console.log('Stream connected successfully')

    } catch (error) {
      console.error('Stream connection error:', error)
      
      // Retry logic for recoverable errors
      if (retryCount < maxRetries) {
        console.log(`Retrying connection (${retryCount + 1}/${maxRetries})...`)
        retryTimeoutRef.current = setTimeout(() => {
          connectToStream(track, retryCount + 1)
        }, retryDelayMs)
        return
      }

      setError(error instanceof Error ? error.message : 'Failed to connect to stream')
      setIsLoading(false)
    }
  }, [audioContext, masterGain, createAnalyser, volume, currentTrackIndex, allTracks.length, advanceToNextTrack])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect()
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect()
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  // Connect to initial track if provided
  useEffect(() => {
    if (currentTrack) {
      connectToStream(currentTrack)
    }
  }, [currentTrack, connectToStream])

  // Add visibility change handler
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!audioRef.current) return

      try {
        if (document.visibilityState === 'visible') {
          // Only attempt to play if it was playing before
          if (isPlaying) {
            if (audioContext?.state === 'suspended') {
              await audioContext.resume()
            }
            // Use play() with catch to handle potential autoplay restrictions
            audioRef.current.play().catch(err => {
              console.warn('Could not auto-resume playback:', err)
              setIsPlaying(false)
            })
          }
        }
      } catch (err) {
        console.warn('Error handling visibility change in audio:', err)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [audioContext, isPlaying])

  // Playback controls
  const play = useCallback(async () => {
    if (!audioRef.current) return
    if (audioContext?.state === 'suspended') {
      await audioContext.resume()
    }
    await audioRef.current.play()
  }, [audioContext])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      pause()
    } else {
      await play()
    }
  }, [isPlaying, pause, play])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }, [])

  const setVolumeLevel = useCallback((level: number) => {
    const newVolume = Math.max(0, Math.min(1, level))
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }, [])

  return {
    isPlaying,
    isLoading,
    error,
    currentTime,
    duration,
    volume,
    streamInfo,
    analyser: analyserRef.current,
    currentTrack,
    currentTrackIndex,
    play,
    pause,
    togglePlay,
    stop,
    seekTo,
    nextTrack: advanceToNextTrack,
    previousTrack: goToPreviousTrack,
    setVolume: setVolumeLevel
  }
}
