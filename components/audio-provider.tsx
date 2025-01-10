'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { Track, AudioContextState, AudioProviderProps, AudioState, AudioMessage } from '@/types/audio'
import * as Tone from 'tone'

interface AudioContextType {
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  progress: number
  queue: Track[]
  audioContext: AudioContext | null
  analyser: AnalyserNode | null
  playTrack: (track: Track) => void
  pauseTrack: () => void
  togglePlay: () => void
  setVolume: (volume: number) => void
  setProgress: (progress: number) => void
  addToQueue: (track: Track) => void
  removeFromQueue: (trackId: string) => void
  clearQueue: () => void
}

const AudioContext = createContext<AudioContextType | null>(null)

export function AudioProvider({ children, config }: AudioProviderProps) {
  // State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [progress, setProgress] = useState(0)
  const [queue, setQueue] = useState<Track[]>([])
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [audioState, setAudioState] = useState<AudioState>({
    isLoading: false,
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
  const gainNodeRef = useRef<GainNode | null>(null)
  const workerRef = useRef<Worker | null>(null)

  // Initialize Web Audio API
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Create audio context
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
          latencyHint: 'interactive',
          sampleRate: 44100
        })

        // Create audio element
        audioRef.current = new Audio()
        audioRef.current.crossOrigin = 'anonymous'

        // Create nodes
        if (audioRef.current) {
          sourceRef.current = ctx.createMediaElementSource(audioRef.current)
          gainNodeRef.current = ctx.createGain()
          const analyserNode = ctx.createAnalyser()

          // Configure analyser
          analyserNode.fftSize = config?.fftSize ?? 2048
          analyserNode.smoothingTimeConstant = config?.smoothingTimeConstant ?? 0.8
          analyserNode.minDecibels = config?.minDecibels ?? -90
          analyserNode.maxDecibels = config?.maxDecibels ?? -10

          // Connect nodes
          if (sourceRef.current && gainNodeRef.current) {
            sourceRef.current.connect(gainNodeRef.current)
            gainNodeRef.current.connect(analyserNode)
            analyserNode.connect(ctx.destination)
          }

          // Initialize Tone.js
          await Tone.start()
          Tone.setContext(ctx as unknown as Tone.Context)

          // Initialize Web Worker
          workerRef.current = new Worker(
            new URL('@/workers/audio-processor.ts', import.meta.url)
          )

          workerRef.current.onmessage = (e: MessageEvent<AudioMessage>) => {
            const { type, data } = e.data
            if (type === 'processed' && data.features) {
              setAudioState(prev => ({
                ...prev,
                audioFeatures: data.features
              }))
            }
          }

          // Set state
          setAudioContext(ctx)
          setAnalyser(analyserNode)

          // Set volume
          if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = volume
          }
        }
      } catch (error) {
        console.error('Failed to initialize audio context:', error)
        setAudioState(prev => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Failed to initialize audio context')
        }))
      }
    }

    initAudio()

    return () => {
      // Cleanup
      workerRef.current?.terminate()
      audioContext?.close()
    }
  }, [volume, config])

  // Volume effect
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume
    }
  }, [volume])

  // Playback controls
  const playTrack = async (track: Track) => {
    if (!audioRef.current || !audioContext) return

    try {
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      audioRef.current.src = track.audioUrl
      await audioRef.current.play()
      setCurrentTrack(track)
      setIsPlaying(true)

      // Start audio processing
      workerRef.current?.postMessage({
        type: 'start',
        data: { track }
      })
    } catch (error) {
      console.error('Failed to play track:', error)
    }
  }

  const pauseTrack = () => {
    audioRef.current?.pause()
    setIsPlaying(false)
    workerRef.current?.postMessage({ type: 'pause' })
  }

  const togglePlay = () => {
    if (isPlaying) {
      pauseTrack()
    } else if (currentTrack) {
      playTrack(currentTrack)
    }
  }

  // Queue management
  const addToQueue = (track: Track) => {
    setQueue([...queue, track])
  }

  const removeFromQueue = (trackId: string) => {
    setQueue(queue.filter(track => track.id !== trackId))
  }

  const clearQueue = () => {
    setQueue([])
  }

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        progress,
        queue,
        audioContext,
        analyser,
        playTrack,
        pauseTrack,
        togglePlay,
        setVolume,
        setProgress,
        addToQueue,
        removeFromQueue,
        clearQueue
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}

