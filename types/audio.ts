import type { LucideIcon } from 'lucide-react'

export type GenreIconType = 'electronic' | 'classical' | 'jazz' | 'ambient'

export interface Genre {
  id: string
  name: string
  description?: string
  image?: string
  icon?: string
}

export interface RadioStation {
  id: string
  name: string
  description?: string
  image?: string
  streamUrl: string
  directStreamUrl?: string
  genre?: string
  language?: string
  country?: string
  website?: string
  isLive?: boolean
  listeners?: number
  trending?: boolean
  featured?: boolean
  tags?: string[]
  bitrate?: number
  format?: string
  metadataInterval?: number
}

export interface Track {
  id: string
  title: string
  artist: string
  album?: string
  duration: number
  artwork?: string
  streamUrl: string
  lyrics?: string
  isLive?: boolean
}

export type AudioSource = Track | RadioStation

export interface AudioState {
  isPlaying: boolean
  volume: number
  currentTime: number
  duration: number
  buffered: number
  error: string | null
}

export interface AudioFeatures {
  frequency: FrequencyData
  time: TimeData
  beat: BeatData
}

export interface FrequencyData {
  average: number
  peaks: number[]
  bands: {
    bass: number
    midrange: number
    treble: number
  }
}

export interface TimeData {
  waveform: Float32Array
  volume: number
  zeroCrossings: number
}

export interface BeatData {
  isBeat: boolean
  energy: number
  interval: number
}

export interface AudioProcessorConfig {
  fftSize: number
  smoothingTimeConstant: number
  minDecibels: number
  maxDecibels: number
  beatDetectionThreshold: number
  beatDetectionRange: [number, number]
}

export interface AudioContextState {
  audioContext: AudioContext | null
  analyser: AnalyserNode | null
  gainNode: GainNode | null
  processorNode: AudioWorkletNode | null
  equalizerInput: GainNode | null
  equalizerOutput: GainNode | null
}

export interface AudioPlayerProps {
  tracks: Track[]
  initialTrackIndex?: number
  onClose?: () => void
  className?: string
}

export interface AnimationConfig {
  speed: number
  smoothing: number
  decay: number
  blend: number
}

export interface VisualizerMode {
  id: 'bars' | 'wave' | 'circle' | 'spectrum' | 'particles' | 'frequency' | 'orbit' | 'terrain' | 'spiral' | 'starburst' | 'ripple' | 'matrix' | 'rings' | 'tunnel'
  label: string
  icon: LucideIcon
  interactive?: boolean
  description?: string
  defaultConfig?: Partial<AnimationConfig>
}

export interface ColorScheme {
  id: string
  label: string
  colors: string[]
  background: string
}

export interface AudioVisualizerProps {
  analyser: AnalyserNode | null
  className?: string
  visualizerMode: VisualizerMode['id']
  colorScheme: ColorScheme['id']
  sensitivity?: number
  quality?: 'low' | 'medium' | 'high'
  showControls?: boolean
  interactive?: boolean
  audioFeatures?: AudioFeatures
}

export interface RippleEffect {
  x: number
  y: number
  radius: number
  maxRadius: number
  opacity: number
  color: string
  speed: number
}

export enum StreamErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  DECODE_ERROR = 'DECODE_ERROR',
  ABORTED = 'ABORTED',
  UNKNOWN = 'UNKNOWN'
}

export interface StreamError {
  type: StreamErrorType
  message: string
  timestamp: number
}

export interface StreamState {
  isBuffering: boolean
  isConnected: boolean
  retryCount: number
  error?: StreamError
}

export interface RecognizedSong {
  title: string
  artist: string
  album?: string
  releaseDate?: string
  lyrics?: string
  confidence: number
  timestamp: number
}

export interface TrackMetadata {
  artist: string
  title: string
  timestamp: number
  station?: {
    id: string
    name: string
    format?: string
    bitrate?: number
    language?: string
    country?: string
  }
}

export interface UseRadioStreamReturn {
  isConnected: boolean
  isBuffering: boolean
  error: StreamError | undefined
  connectToStream: (url: string) => Promise<void>
  disconnect: () => void
  setVolume: (value: number) => void
  analyser: AnalyserNode | null
  currentMetadata: TrackMetadata | null
  isRecognizing: boolean
}

export interface AudioProviderProps {
  children: React.ReactNode
  config?: Partial<AudioProcessorConfig>
}

export interface AudioMessage {
  type: 'init' | 'start' | 'pause' | 'process' | 'processed'
  data: {
    fftSize?: number
    frequencyData?: Uint8Array
    timeData?: Uint8Array
    track?: Track
    features?: AudioFeatures
  }
}

export interface LyricsResponse {
  success: boolean
  lyrics?: string
  error?: string
}

export interface GeniusSearchHit {
  result: {
    id: number
    title: string
    primary_artist: {
      name: string
    }
  }
}

export interface AudioVisualizerData {
  frequency: {
    average: number
    peaks: number[]
    bands: {
      bass: number
      midrange: number
      treble: number
    }
  }
  time: {
    waveform: Float32Array
    volume: number
    zeroCrossings: number
  }
  beat: {
    isBeat: boolean
    energy: number
    interval: number
  }
}

