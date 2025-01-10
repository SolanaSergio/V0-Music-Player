import type { LucideIcon } from 'lucide-react'

export interface Genre {
  id: string
  name: string
  description: string
  imageUrl: string
  icon: LucideIcon
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

