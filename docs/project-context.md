# Project Context

## Dependency Roadmap

### 1. Core Framework
```json
{
  "next": "14.2.16",
  "react": "^18",
  "typescript": "^5"
}
```

### 2. UI Foundation
```json
{
  "tailwindcss": "latest",
  "radix-ui/*": "^1.x",
  "framer-motion": "latest",
  "geist": "latest"
}
```

### 3. Audio Processing
```json
{
  "tone": "latest",           // Audio synthesis
  "wavesurfer.js": "latest",  // Waveform display
  "standardized-audio-context": "latest",  // Browser compatibility
  "web-audio-beat-detector": "latest",     // Rhythm analysis
  "audio-decode": "latest",               // Format handling
  "@react-hookz/web": "latest"           // Audio hooks
}
```

### Installation Order
1. Core Framework: Essential for app structure
2. UI Foundation: Required for interface
3. Audio Processing: Needed for music features

## Core Information

### Environment
```
Project: V0 Music Player
Type: Next.js Web Application
Stack: React, TypeScript, Tailwind
Platform: Windows/PowerShell
Node Version: Latest LTS
Browser Support: Modern browsers only
Mobile Support: Progressive enhancement
```

### Key Directories
```
/app          - Routes and pages (player, radio, new)
/components   - UI components and providers
  /ui         - Reusable UI components
/types        - TypeScript definitions
/utils        - Utility functions
/public       - Static assets
/workers      - Audio processing workers
/hooks        - Custom React hooks
/config       - Configuration files
/styles       - Global styles
```

### Critical Files
```
Core:
- audio-player.tsx      - Main audio playback
- audio-processor.ts    - Web Worker for audio
- audio-visualizer.tsx  - Real-time visualization
- audio-provider.tsx    - Audio context/state

Features:
- player-view.tsx       - Main player interface
- queue-manager.tsx     - Playlist handling
- radio-player.tsx      - Radio functionality
- performance-monitor.tsx - System monitoring
```

### Critical Dependencies
```json
{
  "next": "14.2.16",
  "react": "^18",
  "typescript": "^5",
  "tailwindcss": "latest",
  "framer-motion": "latest",
  "geist": "latest",
  
  // Audio Processing
  "tone": "latest",
  "wavesurfer.js": "latest",
  "web-audio-beat-detector": "latest",
  "standardized-audio-context": "latest",
  "audio-decode": "latest",
  "@react-hookz/web": "latest",
  
  // Development
  "tailwind-scrollbar": "^3.1.0"
}
```

### Audio Dependencies Purpose
```
tone                        - Audio synthesis and processing
wavesurfer.js              - Waveform visualization
web-audio-beat-detector    - Rhythm analysis
standardized-audio-context - Cross-browser compatibility
audio-decode              - Audio format handling
@react-hookz/web          - Audio-specific React hooks
```

## Technical Architecture

### Core Patterns
1. Web Workers for audio processing
2. React Context for global state
3. Custom hooks for reusable logic
4. Error boundaries for stability
5. Performance monitoring
6. Progressive enhancement

### Audio Processing Chain
```
Source → audio-provider.tsx → audio-processor.ts (Worker) → audio-visualizer.tsx
     ↓
audio-player.tsx → queue-manager.tsx
```

### Component Hierarchy
```
Layout
├── ThemeProvider
├── AudioProvider
├── Header
├── Sidebar
└── Main Content
    ├── PlayerView
    │   ├── AudioPlayer
    │   ├── AudioVisualizer
    │   └── QueueManager
    ├── RadioPlayer
    └── ErrorBoundary
```

### Performance Considerations
- Audio processing in workers
- Lazy-loaded routes
- Real-time visualization optimization
- Performance monitoring
- Memory cleanup patterns
- Error boundaries

## Development Context

### Core Features
1. Music playback and processing
   - Full audio control
   - Visualization
   - Queue management
2. Radio functionality
   - Station management
   - Live streaming
3. User Interface
   - Theme support
   - Responsive design
   - Performance metrics

### Key Components
1. Audio Core
   - AudioPlayer: Playback control
   - AudioProcessor: Signal processing
   - Visualizer: Real-time display

2. UI Core
   - PlayerView: Main interface
   - QueueManager: Playlist control
   - RadioPlayer: Radio interface

### State Management
- AudioProvider: Audio state
- ThemeProvider: UI themes
- Local state: Component-specific
- Workers: Audio processing

## Common Operations

### 1. Development
```powershell
# Start development
npm run dev

# Build
npm run build

# Type check
npm run typecheck
```

### 2. Testing
```powershell
# Run tests
npm test

# Lint check
npm run lint
```

## Known Limitations & Solutions

### 1. Audio Processing
- Issue: CPU intensive
- Solution: Web Worker offloading
- Monitoring: performance-monitor.tsx

### 2. Browser Support
- Issue: Audio API support
- Solution: Feature detection
- Fallback: Basic playback

### 3. Performance
- Issue: Visualization load
- Solution: Optimized rendering
- Monitoring: Real-time metrics 

## Implementation Status

### Audio Core
```
✓ Audio Context Provider
  - State management
  - Queue handling
  - Volume persistence

✓ Audio Processing Worker
  - Frequency analysis
  - Time domain processing
  - Peak detection

⚠ Audio Player Integration
  - Web Audio API setup needed
  - Stream processing connection
  - Real-time visualization link

⚠ Queue Management
  - Basic state implemented
  - Playback flow needed
  - Auto-advance missing
```

### Radio Features
```
⚠ Radio Player
  - Stream handling needed
  - Station management
  - Error recovery

⚠ Live Features
  - Stream buffering
  - Connection handling
  - Quality management
```

### Core Features Status

#### 1. Audio Playback (In Progress)
- ✓ State management
- ✓ Basic controls
- ⚠ Audio processing
- ⚠ Visualization link

#### 2. Queue System (Partial)
- ✓ Queue state
- ✓ Basic operations
- ⚠ Playback integration
- ⚠ Auto-advance

#### 3. Radio (Pending)
- ⚠ Stream handling
- ⚠ Station management
- ⚠ Error handling

## Implementation Details

### Audio Processing Chain
```typescript
// 1. Audio Source Setup
const audioContext = new AudioContext()
const source = audioContext.createMediaElementSource(audioElement)

// 2. Processing Node
const analyser = audioContext.createAnalyser()
source.connect(analyser)
analyser.connect(audioContext.destination)

// 3. Worker Communication
worker.postMessage({
  type: 'process',
  data: {
    frequencyData: frequencyArray,
    timeData: timeArray
  }
})
```

### Playback Integration
```typescript
// 1. Track Loading
const loadTrack = async (track: Track) => {
  await audioElement.load()
  audioElement.src = track.url
}

// 2. Queue Management
const advanceQueue = () => {
  if (queue.length > 0) {
    const nextTrack = queue[0]
    removeFromQueue(nextTrack.id)
    playTrack(nextTrack)
  }
}

// 3. Event Handling
audioElement.addEventListener('ended', advanceQueue)
```

### Radio Implementation
```typescript
// 1. Stream Setup
const setupStream = async (url: string) => {
  const response = await fetch(url)
  const stream = response.body
  
  if (stream) {
    const reader = stream.getReader()
    processStream(reader)
  }
}

// 2. Buffer Management
const buffer = new RingBuffer(BUFFER_SIZE)
const processStream = async (reader: ReadableStreamReader) => {
  while (true) {
    const {value, done} = await reader.read()
    if (done) break
    buffer.write(value)
  }
}
```

## Next Steps

### 1. Audio Integration
1. Implement Web Audio API setup
2. Connect audio processor worker
3. Link visualization system
4. Add error handling

### 2. Queue System
1. Complete playback integration
2. Implement auto-advance
3. Add shuffle/repeat modes
4. Handle edge cases

### 3. Radio Features
1. Implement stream handling
2. Add station management
3. Setup error recovery
4. Add quality controls

## Known Issues

### Audio Processing
- Worker initialization timing
- Buffer underrun handling
- Memory cleanup on track change

### Playback
- Queue state persistence
- Track loading errors
- Stream connection handling

### Performance
- Worker message frequency
- Visualization frame rate
- Memory usage optimization 