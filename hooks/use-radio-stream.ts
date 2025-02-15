'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAudioContext } from '@/components/shared/audio-provider'
import { throttle } from 'lodash'
import type { StreamError, TrackMetadata, RadioStation } from '@/types/audio'
import { StreamErrorType } from '@/types/audio'
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
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
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
          analyserRef.current = newAnalyser

          // Only reconnect if we have an existing source
          if (sourceRef.current && masterGain) {
            try {
              sourceRef.current.disconnect()
              sourceRef.current.connect(newAnalyser)
              newAnalyser.connect(masterGain)
            } catch (error) {
              console.error('Failed to reconnect nodes:', error)
            }
          }
        }
      } catch (error) {
        console.error('Failed to create analyzer:', error)
      }
    }

    return () => {
      if (analyserRef.current) {
        try {
          analyserRef.current.disconnect()
        } catch (error) {
          console.error('Failed to disconnect analyzer:', error)
        }
        analyserRef.current = null
      }
    }
  }, [audioContext, createAnalyser, masterGain])

  // Event handlers for audio element
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

  const cleanupAudioNodes = useCallback(() => {
    // First stop any ongoing audio playback
    if (audioRef.current) {
      try {
        const audio = audioRef.current
        // Remove all event listeners first to prevent any callbacks during cleanup
        audio.removeEventListener('canplay', handleCanPlay)
        audio.removeEventListener('waiting', handleWaiting)
        audio.removeEventListener('error', handleError)
        audio.removeEventListener('playing', handlePlaying)
        audio.removeEventListener('loadstart', handleLoadStart)
        audio.removeEventListener('stalled', handleStalled)

        // Stop playback and clear source
        audio.pause()
        audio.currentTime = 0
        const emptyBlob = new Blob([], { type: 'audio/mp3' })
        audio.src = URL.createObjectURL(emptyBlob)
        audio.load() // Force reload to clear buffer
        URL.revokeObjectURL(audio.src)
        audio.src = ''
        audio.remove() // Remove from DOM
        audioRef.current = null
      } catch (err) {
        console.error('Error cleaning up audio element:', err)
      }
    }

    // Clean up audio nodes
    try {
      if (sourceRef.current) {
        sourceRef.current.disconnect()
        sourceRef.current = null
      }
      
      if (analyserRef.current) {
        analyserRef.current.disconnect()
        analyserRef.current = null
      }

      // Reset master gain
      if (masterGain && audioContext) {
        try {
          masterGain.gain.cancelScheduledValues(audioContext.currentTime)
          masterGain.gain.setValueAtTime(1, audioContext.currentTime)
        } catch (err) {
          console.error('Error resetting master gain:', err)
        }
      }
    } catch (err) {
      console.error('Error cleaning up audio nodes:', err)
    }

    // Clear all intervals and timeouts
    [
      metadataIntervalRef.current,
      recognitionIntervalRef.current,
      retryTimeoutRef.current,
      connectionTimeoutRef.current,
      loadingTimeoutRef.current
    ].forEach(timeout => {
      if (timeout) {
        clearTimeout(timeout)
      }
    })
    
    metadataIntervalRef.current = undefined
    recognitionIntervalRef.current = undefined
    retryTimeoutRef.current = undefined
    connectionTimeoutRef.current = undefined
    loadingTimeoutRef.current = undefined
    
    // Reset all state
    setStreamState({
      isConnected: false,
      isBuffering: false,
      error: undefined
    })
    currentUrlRef.current = ''
    reconnectCountRef.current = 0
    initialLoadingRef.current = false
    setCurrentMetadata(null)
    isRecordingRef.current = false
    audioBufferRef.current = []
  }, [masterGain, audioContext, handleCanPlay, handleWaiting, handleError, handlePlaying, handleLoadStart, handleStalled])

  const disconnect = useCallback<DisconnectFn>(() => {
    // Immediately update state to prevent race conditions
    setStreamState(prev => ({
      ...prev,
      isConnected: false,
      isBuffering: false
    }))

    // Stop any ongoing recording
    isRecordingRef.current = false

    // Ensure audio is paused and cleaned up immediately
    if (audioRef.current) {
      try {
        const audio = audioRef.current
        // First pause playback
        audio.pause()
        
        // Then stop all active streams
        if ('mediaKeys' in audio) {
          void audio.setMediaKeys(null)
        }
        
        // Update media session state
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'none'
        }

        // Suspend audio context to properly stop processing
        if (audioContext?.state === 'running') {
          void audioContext.suspend()
        }
        
        // Perform immediate cleanup
        cleanupAudioNodes()
      } catch (error) {
        console.error('Failed to pause audio:', error)
        // Still attempt cleanup if pause fails
        cleanupAudioNodes()
      }
    } else {
      cleanupAudioNodes()
    }
  }, [cleanupAudioNodes, audioContext])

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

  // Initialize audio context and connect to stream
  const connectToStream = useCallback<ConnectToStreamFn>(async (url: string): Promise<void> => {
    if (!audioContext) {
      setStreamState({
        isConnected: false,
        isBuffering: false,
        error: {
          type: StreamErrorType.CONTEXT_INIT_FAILED,
          message: 'Audio context not available'
        }
      })
      return
    }

    // Ensure any existing connection is fully cleaned up first
    await disconnect()
    // Wait for cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 100))

    // Set initial loading state
    initialLoadingRef.current = true
    setStreamState({
      isConnected: false,
      isBuffering: true,
      error: undefined
    })

    try {
      // Resume audio context if needed
      if (audioContext.state === 'suspended') {
        await resumeContext()
        // Wait for context to resume
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Create new audio element with proper settings
      const audio = new Audio()
      audio.crossOrigin = 'anonymous'
      audio.preload = 'auto'
      audio.volume = volumeRef.current

      // Set up event listeners
      audio.addEventListener('canplay', handleCanPlay)
      audio.addEventListener('waiting', handleWaiting)
      audio.addEventListener('error', handleError)
      audio.addEventListener('playing', handlePlaying)
      audio.addEventListener('loadstart', handleLoadStart)
      audio.addEventListener('stalled', handleStalled)
      audio.addEventListener('pause', () => {
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused'
        }
      })

      // Set source and load
      currentUrlRef.current = url
      audio.src = url
      await audio.load()
      
      // Create and connect audio nodes
      if (!sourceRef.current && audioContext) {
        sourceRef.current = audioContext.createMediaElementSource(audio)
        if (analyserRef.current && masterGain) {
          sourceRef.current.connect(analyserRef.current)
          analyserRef.current.connect(masterGain)
        }
      }
      
      audioRef.current = audio // Only set the ref if setup succeeds
      
      // Start playback
      try {
        await audio.play()
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            setStreamState({
              isConnected: false,
              isBuffering: false,
              error: {
                type: StreamErrorType.PLAYBACK_NOT_ALLOWED,
                message: 'Playback not allowed. Please click again to start.'
              }
            })
          } else if (error.name === 'NotSupportedError') {
            setStreamState({
              isConnected: false,
              isBuffering: false,
              error: {
                type: StreamErrorType.FORMAT_NOT_SUPPORTED,
                message: 'Stream format not supported. Please try a different station or refresh the page.'
              }
            })
          } else {
            handleStreamErrorRef.current?.(error, url)
          }
          throw error // Re-throw to trigger cleanup
        }
      }

      // Set up connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (initialLoadingRef.current) {
          setStreamState({
            isConnected: false,
            isBuffering: false,
            error: {
              type: StreamErrorType.CONNECTION_TIMEOUT,
              message: 'Connection timed out. Please check your internet connection and try again.'
            }
          })
          void disconnect()
        }
      }, CONNECTION_TIMEOUT)

    } catch (error) {
      console.error('Stream connection error:', error)
      if (handleStreamErrorRef.current) {
        handleStreamErrorRef.current(
          error instanceof Error ? error : new Error('Failed to connect to stream'),
          url
        )
      }
      await disconnect() // Ensure cleanup on error
      throw error // Re-throw to indicate failure
    }
  }, [audioContext, disconnect, resumeContext, handleCanPlay, handleWaiting, handleError, handlePlaying, handleLoadStart, handleStalled])

  connectToStreamRef.current = connectToStream

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

