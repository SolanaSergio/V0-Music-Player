import type { LucideIcon } from 'lucide-react'
import type { IAudioContext } from 'standardized-audio-context'

export type GenreIconType = 'electronic' | 'classical' | 'jazz' | 'ambient'

export interface Genre {
  id: string
  name: string
  description: string
  imageUrl: string
  icon: GenreIconType
}

export interface RadioStation {
  id: string
  name: string
  genre: string
  imageUrl: string
  fallbackImage: string
  streamUrl: string
  description: string
  isLive: boolean
  tags: string[]
  // New fields for stream info
  format?: string
  bitrate?: number
  region?: string
  language?: string
}

export interface Track {
  id: string
  title: string
  artist: string
  genre?: string
  imageUrl: string
  fallbackImage: string
  audioUrl: string
  isLive?: boolean
}

export interface AudioState {
  isLoading: boolean
  error: Error | null
  currentTime: number
  duration: number
  isBuffering: boolean
  streamInfo?: {
    bitrate?: number
    format?: string
    connected: boolean
  }
  audioFeatures?: AudioFeatures
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

export interface StreamState {
  isBuffering: boolean
  isConnected: boolean
  metadata?: {
    title?: string
    artist?: string
    show?: string
  }
  error?: string
  retryCount: number
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

