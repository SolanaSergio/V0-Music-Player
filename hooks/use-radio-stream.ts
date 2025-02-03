'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAudioContext } from '@/components/shared/audio-provider'
import { throttle } from 'lodash'
import { StreamErrorType, RadioStation } from '@/types/audio'
import type { StreamError, TrackMetadata } from '@/types/audio'
import { recognizeAudio } from '@/lib/audio-recognition'
import { fetchLyrics } from '@/lib/lyrics-fetcher'
import { radioStations } from '@/data/audio'

// Constants for timeouts and retry limits
const CONNECTION_TIMEOUT = 10000 // 10 seconds
const MAX_RECONNECT_ATTEMPTS = 5
const VOLUME_THROTTLE_MS = 50
const METADATA_UPDATE_INTERVAL = 5000
const RECOGNITION_INTERVAL = 20000 // Try to recognize every 20 seconds
const RECOGNITION_DURATION = 10 // Record 10 seconds of audio for recognition

// Type definitions
type ConnectToStreamFn = (url: string) => Promise<void>
type DisconnectFn = () => void
type SetVolumeFn = (value: number) => void
type HandleStreamErrorFn = (error: Error | null, url: string) => void

interface StreamState {
  isConnected: boolean
  isBuffering: boolean
  error?: StreamError
}

interface UseRadioStreamReturn {
  isConnected: boolean
  isBuffering: boolean
  error: StreamError | undefined
  connectToStream: ConnectToStreamFn
  disconnect: DisconnectFn
  setVolume: SetVolumeFn
  analyser: AnalyserNode | null
  currentMetadata: TrackMetadata | null
  isRecognizing: boolean
}

export function useRadioStream(): UseRadioStreamReturn {
  const { audioContext, masterGain, createAnalyser, resumeContext } = useAudioContext()
  
  // State and refs
  const [streamState, setStreamState] = useState<StreamState>({
    isConnected: false,
    isBuffering: false,
    error: undefined
  })
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout>()
  const connectionTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectCountRef = useRef<number>(0)
  const currentUrlRef = useRef<string>('')
  const volumeRef = useRef<number>(0.75)
  const [currentMetadata, setCurrentMetadata] = useState<TrackMetadata | null>(null)
  const metadataIntervalRef = useRef<NodeJS.Timeout>()
  const [isRecognizing, setIsRecognizing] = useState(false)
  const recognitionIntervalRef = useRef<NodeJS.Timeout>()
  const audioBufferRef = useRef<Float32Array[]>([])
  const isRecordingRef = useRef(false)

  // State refs
  const handleStreamErrorRef = useRef<HandleStreamErrorFn>()
  const connectToStreamRef = useRef<ConnectToStreamFn>()

  // Add connection attempt tracking
  const initialLoadingRef = useRef<boolean>(false)
  const loadingTimeoutRef = useRef<NodeJS.Timeout>()

  // Create analyser when audio context is available
  useEffect(() => {
    if (audioContext && !analyserRef.current) {
      try {
        const newAnalyser = createAnalyser()
        if (newAnalyser) {
          newAnalyser.minDecibels = -90
          newAnalyser.maxDecibels = -10
          newAnalyser.smoothingTimeConstant = 0.85
          analyserRef.current = newAnalyser

          // Reconnect nodes with analyzer if source exists
          if (sourceNodeRef.current && masterGain) {
            sourceNodeRef.current.disconnect()
            masterGain.disconnect()
            
            sourceNodeRef.current.connect(newAnalyser)
            newAnalyser.connect(masterGain)
            masterGain.connect(audioContext.destination)
          }
        }
      } catch (error) {
        console.error('Failed to create analyzer:', error)
      }
    }

    return () => {
      if (analyserRef.current) {
        analyserRef.current.disconnect()
        analyserRef.current = null
      }
    }
  }, [audioContext, createAnalyser, masterGain])

  // Connect source to analyzer when source is created
  useEffect(() => {
    const source = sourceNodeRef.current
    const analyser = analyserRef.current
    
    if (source && analyser && masterGain && audioContext) {
      source.disconnect()
      masterGain.disconnect()
      
      source.connect(analyser)
      analyser.connect(masterGain)
      masterGain.connect(audioContext.destination)
    }
  }, [audioContext, masterGain])

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current.load()
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect()
      sourceNodeRef.current = null
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect()
    }
    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
    if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current)
  }, [])

  const ensureAudioContext = useCallback(async (): Promise<boolean> => {
    try {
      if (!audioContext) {
        await resumeContext()
        if (!audioContext) {
          throw new Error('Failed to initialize audio context')
        }
      }

      if (audioContext.state === 'suspended') {
        await resumeContext()
      }

      return true
    } catch (error) {
      console.error('Audio context initialization error:', error)
      throw new Error(`Audio context initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [audioContext, resumeContext])

  const disconnect = useCallback<DisconnectFn>(() => {
    // Clear any existing timeouts first
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current)
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }

    // Perform cleanup
    cleanup()
    currentUrlRef.current = ''
    reconnectCountRef.current = 0
    initialLoadingRef.current = true

    // Reset stream state without showing buffering
    setStreamState({
      isBuffering: false,
      isConnected: false,
      error: undefined
    })
  }, [cleanup])

  handleStreamErrorRef.current = useCallback<HandleStreamErrorFn>((error: Error | null, url: string) => {
    // Clear any existing loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }

    // Ignore empty src errors (these happen during cleanup)
    if (error?.message?.includes('Empty src')) {
      return
    }

    // During initial loading, keep showing buffering unless it's a permission error
    if (initialLoadingRef.current) {
      if (error?.name === 'NotAllowedError') {
        setStreamState({
          isBuffering: false,
          isConnected: false,
          error: {
            type: StreamErrorType.PLAYBACK_NOT_ALLOWED,
            message: 'Playback not allowed. Please click again to start.'
          }
        })
      }
      return
    }

    // For all other cases, show error if we're not connected
    if (error && !streamState.isConnected) {
      let streamError: StreamError = {
        type: StreamErrorType.UNKNOWN,
        message: 'An unknown error occurred'
      }

      if (error.name === 'NotAllowedError') {
        streamError = {
          type: StreamErrorType.PLAYBACK_NOT_ALLOWED,
          message: 'Playback not allowed. Please click again to start.'
        }
      } else if (error.name === 'NotSupportedError') {
        streamError = {
          type: StreamErrorType.FORMAT_NOT_SUPPORTED,
          message: 'Stream format not supported. Please try a different station.'
        }
      } else {
        streamError = {
          type: StreamErrorType.NETWORK_ERROR,
          message: error.message
        }
      }

      setStreamState({
        isBuffering: false,
        isConnected: false,
        error: streamError
      })

      // Only attempt reconnection for network errors
      if (streamError.type === StreamErrorType.NETWORK_ERROR && 
          reconnectCountRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectCountRef.current++
        const backoffDelay = Math.min(1000 * Math.pow(2, reconnectCountRef.current), 30000)
        
        retryTimeoutRef.current = setTimeout(() => {
          if (connectToStreamRef.current) {
            connectToStreamRef.current(url)
          }
        }, backoffDelay)
      }
    }
  }, [streamState.isConnected])

  // Throttled volume control to prevent performance issues
  const throttledVolumeSet = useCallback(() => {
    const throttled = throttle((value: number) => {
      volumeRef.current = value
      if (audioRef.current) {
        audioRef.current.volume = value
      }
    }, VOLUME_THROTTLE_MS)
    
    return {
      set: throttled,
      cancel: throttled.cancel
    }
  }, [])

  const volumeController = useRef(throttledVolumeSet())

  // Update volume controller when throttledVolumeSet changes
  useEffect(() => {
    volumeController.current = throttledVolumeSet()
    return () => volumeController.current.cancel()
  }, [throttledVolumeSet])

  const setVolume = useCallback<SetVolumeFn>((value: number) => {
    const safeValue = Math.max(0, Math.min(1, value))
    volumeRef.current = safeValue

    // Update HTML audio element volume
    if (audioRef.current) {
      audioRef.current.volume = safeValue
    }

    // Update Web Audio API gain node
    if (masterGain && audioContext) {
      masterGain.gain.setTargetAtTime(safeValue, audioContext.currentTime, 0.01)
    }
  }, [audioContext, masterGain])

  // Remove throttled volume control as it's causing issues
  useEffect(() => {
    // Set initial volume when audio element is created
    if (audioRef.current) {
      audioRef.current.volume = volumeRef.current
    }
  }, [])

  // Event handlers for audio element
  const handleLoadStart = useCallback(() => {
    const audio = audioRef.current
    // Only show buffering on initial load and when actively trying to connect
    setStreamState(prev => ({
      ...prev,
      isBuffering: !audio?.paused && !prev.isConnected,
      error: undefined
    }))
  }, [])

  const handleCanPlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    // Only attempt playback if we're not already connected
    if (!streamState.isConnected) {
      audio.play().catch(error => {
        handleStreamErrorRef.current?.(error, audio.src)
      })
    }
  }, [streamState.isConnected])

  const handlePlaying = useCallback(() => {
    // Clear any existing timeouts since we're now playing
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = undefined
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current)
      connectionTimeoutRef.current = undefined
    }

    // Reset reconnect count and mark as connected
    reconnectCountRef.current = 0
    initialLoadingRef.current = false

    // Update stream state to indicate successful connection and not buffering
    setStreamState({
      isBuffering: false,
      isConnected: true,
      error: undefined
    })

    // Update media session state
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing'
    }
  }, [])

  const handleStalled = useCallback(() => {
    const audio = audioRef.current
    // Only show buffering if we're connected, not paused, and actively trying to play
    if (audio && streamState.isConnected && !audio.paused && audio.currentTime > 0) {
      setStreamState(prev => ({
        ...prev,
        isBuffering: true
      }))
    }
  }, [streamState.isConnected])

  const handleWaiting = useCallback(() => {
    const audio = audioRef.current
    // Only show buffering if we're connected, not paused, and actively trying to play
    if (audio && streamState.isConnected && !audio.paused && audio.currentTime > 0) {
      setStreamState(prev => ({
        ...prev,
        isBuffering: true
      }))
    }
  }, [streamState.isConnected])

  const handleError = useCallback(() => {
    const audio = audioRef.current
    if (audio?.error && !audio.error.message?.includes('Empty src')) {
      const error = new Error(audio.error.message || 'Media playback error')
      handleStreamErrorRef.current?.(error, audio.src)
    }
  }, [])

  connectToStreamRef.current = useCallback(async (url: string) => {
    try {
      // Set initial state
      setStreamState({
        isBuffering: true,
        isConnected: false,
        error: undefined
      })

      // Ensure we have an audio context
      await ensureAudioContext()
      if (!audioContext) return

      // Clean up any existing connection first
      cleanup()

      // Create and configure audio element
      const audio = new Audio()
      audio.crossOrigin = 'anonymous'
      audio.preload = 'auto'
      audioRef.current = audio

      // Set up audio routing before setting source
      const source = audioContext.createMediaElementSource(audio)
      sourceNodeRef.current = source

      // Connect audio nodes
      if (analyserRef.current && masterGain) {
        source.connect(analyserRef.current)
        analyserRef.current.connect(masterGain)
        masterGain.connect(audioContext.destination)
      } else if (masterGain) {
        source.connect(masterGain)
        masterGain.connect(audioContext.destination)
      } else {
        source.connect(audioContext.destination)
      }

      // Set up event listeners
      audio.addEventListener('loadstart', handleLoadStart)
      audio.addEventListener('canplay', handleCanPlay)
      audio.addEventListener('playing', handlePlaying)
      audio.addEventListener('waiting', handleWaiting)
      audio.addEventListener('stalled', handleStalled)
      audio.addEventListener('error', handleError)
      audio.addEventListener('pause', () => {
        setStreamState(prev => ({
          ...prev,
          isBuffering: false
        }))
      })

      // Set initial volume
      audio.volume = volumeRef.current

      // Start loading the stream
      currentUrlRef.current = url
      audio.src = url

      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (!streamState.isConnected) {
          handleStreamErrorRef.current?.(
            new Error('Connection timeout'),
            url
          )
        }
      }, CONNECTION_TIMEOUT)

      // Attempt playback
      try {
        await audio.play()
      } catch (error) {
        if (error instanceof Error && error.name === 'NotAllowedError') {
          handleStreamErrorRef.current?.(error, url)
        }
      }
    } catch (error) {
      handleStreamErrorRef.current?.(error as Error, url)
    }
  }, [
    audioContext,
    masterGain,
    streamState.isConnected,
    cleanup,
    ensureAudioContext,
    handleLoadStart,
    handleCanPlay,
    handlePlaying,
    handleWaiting,
    handleStalled,
    handleError
  ])

  // Function to parse ICY metadata
  const parseICYMetadata = useCallback((metadata: string) => {
    try {
      // Try StreamTitle format first
      const streamTitleMatch = metadata.match(/StreamTitle='([^']*)'/)?.[1]
      if (streamTitleMatch) {
        const [artist, title] = streamTitleMatch.split(' - ')
        return {
          artist: artist?.trim() || streamTitleMatch.trim(),
          title: title?.trim() || 'Unknown Track',
          timestamp: Date.now()
        }
      }

      // Try direct format (some stations send "Artist - Title" directly)
      if (metadata.includes(' - ')) {
        const [artist, title] = metadata.split(' - ')
        return {
          artist: artist?.trim() || metadata.trim(),
          title: title?.trim() || 'Unknown Track',
          timestamp: Date.now()
        }
      }

      // If no separator found, use whole string as both artist and title
      // This gives us the best chance of finding lyrics
      const cleanMetadata = metadata.trim()
      return {
        artist: cleanMetadata || 'Unknown Artist',
        title: cleanMetadata || 'Unknown Track',
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Error parsing ICY metadata:', error, 'Raw metadata:', metadata)
      return null
    }
  }, [])

  // Function to update metadata
  const updateMetadata = useCallback(async () => {
    try {
      if (!currentUrlRef.current) return

      // Get the radio station details
      const stationId = currentUrlRef.current.split('/').pop()
      const station = radioStations.find((s: RadioStation) => s.id === stationId)
      
      if (!station?.directStreamUrl) {
        console.warn('No direct stream URL available for metadata fetching')
        return
      }

      console.log('Fetching metadata for station:', station.name)
      const response = await fetch('/api/stream/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: station.directStreamUrl })
      })

      if (!response.ok) {
        console.error('Metadata fetch failed:', await response.text())
        return
      }

      const data = await response.json()
      console.log('Raw metadata response:', data)

      if (data.metadata) {
        const metadata = parseICYMetadata(data.metadata)
        console.log('Parsed metadata:', metadata)
        
        if (metadata) {
          // Always attempt to fetch lyrics
          const lyricsResponse = await fetchLyrics(metadata.artist, metadata.title)
          console.log('Lyrics response:', lyricsResponse)
          
          setCurrentMetadata({
            ...metadata,
            lyrics: lyricsResponse.success ? lyricsResponse.lyrics : undefined
          })
        }
      }
    } catch (error) {
      console.error('Error updating metadata:', error)
      return
    }
  }, [parseICYMetadata])

  // Start metadata polling when connected
  useEffect(() => {
    if (streamState.isConnected) {
      updateMetadata()
      metadataIntervalRef.current = setInterval(updateMetadata, METADATA_UPDATE_INTERVAL)
    }

    return () => {
      if (metadataIntervalRef.current) {
        clearInterval(metadataIntervalRef.current)
      }
    }
  }, [streamState.isConnected, updateMetadata])

  // Function to stop recording and recognize audio
  const stopRecording = useCallback(async () => {
    if (!isRecordingRef.current) return
    
    isRecordingRef.current = false
    setIsRecognizing(true)
    
    try {
      // Combine all recorded buffers
      const totalLength = audioBufferRef.current.reduce((acc, buf) => acc + buf.length, 0)
      const combinedBuffer = new Float32Array(totalLength)
      let offset = 0
      
      for (const buffer of audioBufferRef.current) {
        combinedBuffer.set(buffer, offset)
        offset += buffer.length
      }
      
      // Convert to 16-bit PCM
      const pcmBuffer = new Int16Array(combinedBuffer.length)
      for (let i = 0; i < combinedBuffer.length; i++) {
        const s = Math.max(-1, Math.min(1, combinedBuffer[i]))
        pcmBuffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
      }
      
      // Recognize the audio
      const recognizedSong = await recognizeAudio(pcmBuffer.buffer)
      
      if (recognizedSong) {
        setCurrentMetadata(prev => ({
          ...prev,
          recognized: recognizedSong,
          lyrics: recognizedSong.lyrics,
          artist: recognizedSong.artist,
          title: recognizedSong.title,
          timestamp: recognizedSong.timestamp
        }))
      }
    } catch (error) {
      console.error('Error recognizing audio:', error)
    } finally {
      setIsRecognizing(false)
      audioBufferRef.current = []
    }
  }, [])

  // Function to record audio for recognition
  const startRecording = useCallback(() => {
    if (!analyserRef.current || isRecordingRef.current) return
    
    isRecordingRef.current = true
    audioBufferRef.current = []
    
    const sampleRate = audioContext?.sampleRate || 44100
    const bufferLength = analyserRef.current.frequencyBinCount
    const recordingBuffer = new Float32Array(bufferLength)
    
    const recordFrame = () => {
      if (!isRecordingRef.current || !analyserRef.current) return
      
      analyserRef.current.getFloatTimeDomainData(recordingBuffer)
      audioBufferRef.current.push(new Float32Array(recordingBuffer))
      
      // Stop after RECOGNITION_DURATION seconds
      if (audioBufferRef.current.length >= RECOGNITION_DURATION * (sampleRate / bufferLength)) {
        stopRecording()
        return
      }
      
      requestAnimationFrame(recordFrame)
    }
    
    recordFrame()
  }, [audioContext, stopRecording])

  // Start recognition cycle when connected
  useEffect(() => {
    if (streamState.isConnected && analyserRef.current) {
      // Initial recognition
      startRecording()
      
      // Set up interval for periodic recognition
      recognitionIntervalRef.current = setInterval(() => {
        if (!isRecordingRef.current) {
          startRecording()
        }
      }, RECOGNITION_INTERVAL)
    }
    
    return () => {
      if (recognitionIntervalRef.current) {
        clearInterval(recognitionIntervalRef.current)
      }
      isRecordingRef.current = false
    }
  }, [streamState.isConnected, startRecording])

  return {
    isConnected: streamState.isConnected,
    isBuffering: streamState.isBuffering,
    error: streamState.error,
    connectToStream: connectToStreamRef.current!,
    disconnect,
    setVolume,
    analyser: analyserRef.current,
    currentMetadata,
    isRecognizing
  }
}

