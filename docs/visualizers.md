# Audio Visualizers

## Overview
The audio visualization system provides real-time visual representations of audio data using the Web Audio API and Canvas. The system is built with modularity, performance, and extensibility in mind.

## Directory Structure
```
components/
├── audio-visualizer.tsx     # Main visualizer component
└── visualizers/            # Modular visualization implementations
    ├── types.ts           # Shared types and interfaces
    ├── bars.ts           # Frequency bars visualization
    ├── wave.ts           # Waveform visualization
    ├── circle.ts         # Circular frequency visualization
    └── ripples.ts        # Interactive ripple effects
```

## Core Components

### AudioVisualizer
The main component that handles:
- Canvas setup and management
- Audio data processing
- Visualization mode switching
- User interaction
- Performance optimization

### Visualization Modes

#### 1. Bars Visualization
- Classic frequency bar representation
- Configurable bar width and spacing
- Color gradient support
- Sensitivity controls

#### 2. Wave Visualization
- Oscilloscope-style waveform display
- Smooth line rendering
- Adjustable line width
- Time-domain data visualization

#### 3. Circle Visualization
- Circular frequency spectrum
- Radius-based amplitude mapping
- Rotating color patterns
- Center-aligned design

#### 4. Ripple Effects
- Interactive click/touch response
- Frequency-based ripple size
- Opacity decay
- Color scheme integration

## Implementation Details

### Drawing Context
```typescript
interface DrawContext {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  scheme: ColorScheme
  sensitivity: number
}
```

### Performance Optimizations
- High DPI canvas support
- RequestAnimationFrame for smooth rendering
- Reusable data arrays
- Quality settings (low/medium/high)
- Efficient clearing with alpha blending

### Interactive Features
- Mouse/touch event handling
- Real-time ripple generation
- Sensitivity adjustment
- Color scheme selection

## Usage Example
```tsx
<AudioVisualizer
  analyser={audioContext.analyser}
  visualizerMode="bars"
  colorScheme="default"
  sensitivity={1.5}
  quality="medium"
  showControls={true}
  interactive={true}
/>
```

## Configuration

### Quality Settings
- Low: 128 FFT size
- Medium: 256 FFT size
- High: 512 FFT size

### Animation Config
```typescript
interface AnimationConfig {
  speed: number    // Animation speed multiplier
  smoothing: number // Audio data smoothing
  decay: number    // Effect decay rate
  blend: number    // Visual trail blend factor
}
```

### Color Schemes
Predefined color schemes available in `config/visualizer.ts`:
- Default (Green)
- Rainbow
- Monochrome
- Gradient
- Neon
- Sunset
- Ocean
- Cyberpunk
- Forest
- Aurora

## Best Practices

### Performance
1. Use appropriate quality settings based on device capabilities
2. Implement cleanup on component unmount
3. Optimize canvas operations
4. Use requestAnimationFrame for smooth rendering

### Accessibility
1. Provide alternative representations for screen readers
2. Support keyboard controls for interactive features
3. Ensure sufficient color contrast
4. Add ARIA labels for controls

### Mobile Support
1. Touch event handling
2. Responsive canvas sizing
3. Battery-efficient quality defaults
4. Touch-friendly control layout 