# Project Structure

## Directory Overview

```
V0 Music Player/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── player/            # Player page
│   ├── radio/             # Radio page
│   ├── new/              # New releases page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
│
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── audio-player.tsx  # Main audio player
│   ├── audio-provider.tsx # Audio context provider
│   ├── audio-visualizer.tsx # Audio visualization
│   ├── radio-player.tsx  # Radio player
│   ├── player-view.tsx   # Full player view
│   ├── mini-player.tsx   # Minimized player
│   ├── queue-manager.tsx # Playlist management
│   └── ...               # Other components
│
├── hooks/                # Custom React hooks
│   ├── use-audio.ts     # Audio playback hook
│   ├── use-radio-stream.ts # Radio stream hook
│   ├── use-toast.ts     # Toast notifications
│   └── use-mobile.tsx   # Mobile detection
│
├── types/                # TypeScript definitions
│   └── audio.ts         # Audio-related types
│
├── utils/                # Utility functions
│   ├── stream-handler.ts # Stream processing
│   └── ...
│
├── workers/              # Web Workers
│   └── audio-processor.ts # Audio processing worker
│
├── data/                 # Static data
│   ├── audio.ts         # Audio content
│   └── radio-stations.ts # Radio station list
│
├── config/              # Configuration files
│   └── visualizer.ts    # Visualizer settings
│
├── styles/              # Style-related files
│   └── ...
│
├── public/             # Static assets
│   └── ...
│
└── lib/               # Shared utilities
    └── utils.ts      # Common utilities
```

## Key Components

### Audio Core
- `audio-player.tsx`: Main playback interface
- `audio-provider.tsx`: Global audio context
- `audio-visualizer.tsx`: Real-time visualization with modular system
- `visualizers/*.ts`: Individual visualization implementations
- `radio-player.tsx`: Radio stream handling

### UI Components
- `player-view.tsx`: Full-screen player
- `mini-player.tsx`: Minimized player
- `queue-manager.tsx`: Playlist management
- `volume-equalizer.tsx`: Volume control
- `lyrics-display.tsx`: Lyrics display

### Layout Components
- `header.tsx`: Main navigation
- `sidebar.tsx`: Side navigation
- `mobile-nav.tsx`: Mobile navigation
- `background-effects.tsx`: Visual effects

### Feature Components
- `featured.tsx`: Featured content
- `latest-songs.tsx`: New releases
- `track-recommendations.tsx`: Recommendations
- `genre-explorer.tsx`: Genre navigation

## Custom Hooks

### Audio Hooks
- `use-audio.ts`: Audio playback management
- `use-radio-stream.ts`: Radio stream handling

### Utility Hooks
- `use-toast.ts`: Toast notifications
- `use-mobile.tsx`: Mobile detection

## Configuration Files

### Next.js Config
```typescript
// next.config.mjs
export default {
  // Next.js configuration
}
```

### TypeScript Config
```typescript
// tsconfig.json
{
  "compilerOptions": {
    // TypeScript configuration
  }
}
```

### Tailwind Config
```typescript
// tailwind.config.ts
export default {
  // Tailwind CSS configuration
}
```

## State Management

### Audio Context
- Global audio state
- Playback controls
- Stream management
- Queue management

### Component State
- Local UI state
- Feature-specific state
- Form state

## API Routes

### Audio Endpoints
- `/api/audio/stream`
- `/api/audio/metadata`

### Radio Endpoints
- `/api/radio/stream`
- `/api/radio/stations`

### Track Management
- `/api/tracks`
- `/api/tracks/featured`
- `/api/tracks/recommendations`

## Asset Organization

### Public Assets
- Images
- Icons
- Static audio files

### Styles
- Global CSS
- Component styles
- Theme configuration

## Development Tools

### Package Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

### Dependencies
- Next.js
- React
- TypeScript
- Tailwind CSS
- Audio processing libraries
- UI component libraries

## Testing Structure

### Component Tests
- Unit tests
- Integration tests
- Visual regression tests

### API Tests
- Endpoint tests
- Stream tests
- Error handling tests

## Documentation Organization

### Technical Docs
- API documentation
- Component documentation
- Type definitions

### User Docs
- Usage guides
- Feature documentation
- Troubleshooting guides

## Performance Optimization

### Code Splitting
- Route-based splitting
- Component lazy loading
- Dynamic imports

### Asset Optimization
- Image optimization
- Audio streaming optimization
- Caching strategies 

### Components Directory
```
components/
├── audio-player.tsx      # Main playback interface
├── audio-provider.tsx    # Global audio context
├── audio-visualizer.tsx  # Main visualization component
├── visualizers/         # Visualization implementations
│   ├── types.ts        # Shared visualization types
│   ├── bars.ts         # Frequency bars visualization
│   ├── wave.ts         # Waveform visualization
│   ├── circle.ts       # Circular visualization
│   └── ripples.ts      # Interactive ripple effects
├── radio-player.tsx     # Radio stream handling
└── ui/                  # Shared UI components
    └── ...
``` 