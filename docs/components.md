# Component Documentation

## Core Audio Components

### AudioPlayer
```typescript
interface AudioPlayerProps {
  tracks: Track[]
  initialTrackIndex?: number
  onClose?: () => void
  className?: string
}
```
Primary component for audio playback control. Uses the `useAudio` hook for state management and audio processing.

**Key Features:**
- Multi-track playback support
- Keyboard controls (Space, Escape, Arrow keys)
- Audio visualization
- Progress tracking
- Volume control
- Error handling with retry capability

**Usage Example:**
```tsx
<AudioPlayer
  tracks={[/* track array */]}
  initialTrackIndex={0}
  onClose={() => {}}
  className="custom-class"
/>
```

### AudioVisualizer
```typescript
interface AudioVisualizerProps {
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
```
Real-time audio visualization component using Canvas API.

**Features:**
- Multiple visualization modes (bars, wave, circle, etc.)
- Color scheme support
- Quality settings
- Interactive controls
- Performance optimized

### RadioPlayer
```typescript
interface RadioPlayerProps {
  station: RadioStation
  className?: string
}
```
Specialized component for handling radio stream playback.

**Features:**
- Live stream handling
- Buffering states
- Auto-reconnection
- Volume control
- Error recovery

## Provider Components

### AudioProvider
```typescript
interface AudioProviderProps {
  children: React.ReactNode
  config?: Partial<AudioProcessorConfig>
}

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
```
Global audio context provider for managing audio state and playback.

## UI Components

### MiniPlayer
```typescript
interface MiniPlayerProps {
  track: Track
  isPlaying: boolean
  onPlayPause: () => void
  onNext: () => void
  onPrevious: () => void
  onExpand: () => void
  progress: number
  volume: number
  onVolumeChange: (value: number) => void
  onProgressChange: (value: number) => void
}
```
Compact player control interface with basic playback controls.

### PlayerView
Full-screen player view with advanced controls and visualizations.

**Features:**
- Full track information display
- Advanced playback controls
- Visualization options
- Queue management
- Keyboard shortcuts
- Fullscreen mode

## Types

### Track
```typescript
interface Track {
  id: string
  title: string
  artist: string
  genre?: string
  imageUrl: string
  fallbackImage: string
  audioUrl: string
  isLive?: boolean
}
```

### AudioState
```typescript
interface AudioState {
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
```

### AudioFeatures
```typescript
interface AudioFeatures {
  frequency: FrequencyData
  time: TimeData
  beat: BeatData
}

interface FrequencyData {
  average: number
  peaks: number[]
  bands: {
    bass: number
    midrange: number
    treble: number
  }
}

interface TimeData {
  waveform: Float32Array
  volume: number
  zeroCrossings: number
}

interface BeatData {
  isBeat: boolean
  energy: number
  interval: number
}
```

## Integration Patterns

### Audio Processing Chain
```
AudioProvider
└── useAudio Hook
    ├── Web Audio API Context
    │   ├── MediaElementSource
    │   ├── GainNode
    │   └── AnalyserNode
    └── Audio Worker
        └── Feature Extraction
```

### Component Hierarchy
```
AudioProvider
└── PlayerView
    ├── AudioPlayer
    │   ├── AudioVisualizer
    │   └── Controls
    └── MiniPlayer
```

## Performance Considerations

### AudioVisualizer
- Uses `requestAnimationFrame` for smooth rendering
- Quality settings for different performance levels
- Throttled analysis for lower CPU usage
- WebGL acceleration when available

### Audio Processing
- Web Worker for intensive processing
- Buffered audio analysis
- Optimized state updates
- Memory cleanup on unmount

## Error Handling

### Common Patterns
```typescript
// Error boundary usage
<ErrorBoundary fallback={<PlayerError />}>
  <AudioPlayer />
</ErrorBoundary>

// Stream error handling
try {
  await connectToStream(url)
} catch (error) {
  setAudioState(prev => ({
    ...prev,
    error: new Error('Stream connection failed'),
    isLoading: false
  }))
}
```

## Accessibility

### ARIA Attributes
```typescript
// Standard accessibility pattern
<Button
  aria-label="Play"
  aria-pressed={isPlaying}
  onClick={handlePlay}
>
  {isPlaying ? <Pause /> : <Play />}
  <span className="sr-only">
    {isPlaying ? 'Pause' : 'Play'}
  </span>
</Button>
```

## Mobile Support

### Touch Events
- Touch-friendly controls
- Mobile-optimized layouts
- Responsive visualizations
- Battery-efficient processing 