'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Track } from '@/types/audio'

interface AudioContextType {
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  progress: number
  queue: Track[]
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

export function AudioProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [progress, setProgress] = useState(0)
  const [queue, setQueue] = useState<Track[]>([])

  const playTrack = (track: Track) => {
    setCurrentTrack(track)
    setIsPlaying(true)
  }

  const pauseTrack = () => {
    setIsPlaying(false)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const addToQueue = (track: Track) => {
    setQueue([...queue, track])
  }

  const removeFromQueue = (trackId: string) => {
    setQueue(queue.filter(track => track.id !== trackId))
  }

  const clearQueue = () => {
    setQueue([])
  }

  // Persist audio state
  useEffect(() => {
    const savedVolume = localStorage.getItem('audio-volume')
    if (savedVolume) {
      setVolume(parseFloat(savedVolume))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('audio-volume', volume.toString())
  }, [volume])

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        progress,
        queue,
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

