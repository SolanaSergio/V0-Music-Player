# Project Structure

## Overview
The V0 Music Player follows a modular architecture with clear separation of concerns. Below is the complete directory structure of the project.

## Directory Map
```
└── SolanaSergio-V0-Music-Player/
    ├── README.md
    ├── components.json
    ├── next.config.mjs
    ├── package.json
    ├── postcss.config.mjs
    ├── tailwind.config.js
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── app/                          # Next.js 14 App Router
    │   ├── globals.css
    │   ├── layout.tsx               # Root layout
    │   ├── page.tsx                 # Home page
    │   ├── api/                     # API routes
    │   │   └── mock-image/
    │   │       └── route.ts
    │   ├── new/                     # New music page
    │   │   └── page.tsx
    │   ├── player/                  # Player page
    │   │   └── page.tsx
    │   └── radio/                   # Radio page
    │       └── page.tsx
    ├── components/                   # React components
    │   ├── audio-player.tsx         # Core audio functionality
    │   ├── audio-provider.tsx
    │   ├── audio-visualizer.tsx
    │   ├── background-effects.tsx
    │   ├── daily-mixes.tsx
    │   ├── dj-mixes-section.tsx
    │   ├── error-boundary.tsx
    │   ├── featured.tsx
    │   ├── genre-explorer.tsx
    │   ├── header.tsx
    │   ├── hero-banner.tsx
    │   ├── image-loader.tsx
    │   ├── latest-songs.tsx
    │   ├── lyrics-display.tsx
    │   ├── mini-player.tsx
    │   ├── mobile-nav.tsx
    │   ├── music-wave.tsx
    │   ├── performance-monitor.tsx
    │   ├── player-view.tsx
    │   ├── playlist-creator.tsx
    │   ├── queue-manager.tsx
    │   ├── radio-player.tsx
    │   ├── radio-stations.tsx
    │   ├── recently-played.tsx
    │   ├── share-modal.tsx
    │   ├── sidebar.tsx
    │   ├── theme-provider.tsx
    │   ├── track-recommendations.tsx
    │   ├── user-profile-card.tsx
    │   ├── volume-equalizer.tsx
    │   ├── welcome-message.tsx
    │   └── ui/                      # Reusable UI components
    │       ├── accordion.tsx
    │       ├── alert-dialog.tsx
    │       ├── alert.tsx
    │       ├── aspect-ratio.tsx
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── breadcrumb.tsx
    │       ├── button.tsx
    │       ├── calendar.tsx
    │       ├── card.tsx
    │       ├── carousel.tsx
    │       ├── chart.tsx
    │       ├── checkbox.tsx
    │       ├── collapsible.tsx
    │       ├── command.tsx
    │       ├── context-menu.tsx
    │       ├── dialog.tsx
    │       ├── drawer.tsx
    │       ├── dropdown-menu.tsx
    │       ├── form.tsx
    │       ├── hover-card.tsx
    │       ├── input-otp.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── loading-spinner.tsx
    │       ├── loading.tsx
    │       ├── menubar.tsx
    │       ├── navigation-menu.tsx
    │       ├── pagination.tsx
    │       ├── placeholder-image.tsx
    │       ├── popover.tsx
    │       ├── progress.tsx
    │       ├── radio-group.tsx
    │       ├── resizable.tsx
    │       ├── scroll-area.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── sheet.tsx
    │       ├── sidebar.tsx
    │       ├── skeleton.tsx
    │       ├── slider.tsx
    │       ├── sonner.tsx
    │       ├── switch.tsx
    │       ├── table.tsx
    │       ├── tabs.tsx
    │       ├── textarea.tsx
    │       ├── toast.tsx
    │       ├── toaster.tsx
    │       ├── toggle-group.tsx
    │       ├── toggle.tsx
    │       ├── tooltip.tsx
    │       ├── use-mobile.tsx
    │       └── use-toast.ts
    ├── config/                      # Configuration files
    │   └── visualizer.ts
    ├── data/                        # Static data and constants
    │   ├── audio.ts
    │   └── radio-stations.ts
    ├── docs/                        # Project documentation
    │   ├── README.md
    │   ├── debugging-log.md
    │   ├── dependencies.md
    │   ├── development-workflow.md
    │   ├── project-structure.md
    │   └── prompt-guide.md
    ├── hooks/                       # Custom React hooks
    │   ├── use-audio.ts
    │   ├── use-mobile.tsx
    │   ├── use-radio-stream.ts
    │   └── use-toast.ts
    ├── lib/                         # Library code
    │   └── utils.ts
    ├── public/                      # Static assets
    │   ├── images/
    │   │   └── stations/
    │   └── patterns/
    ├── styles/                      # Global styles
    │   └── globals.css
    ├── types/                       # TypeScript type definitions
    │   └── audio.ts
    ├── utils/                       # Utility functions
    │   ├── canvas-manager.ts
    │   ├── performance.ts
    │   ├── stream-handler.ts
    │   └── visualization-renderer.ts
    └── workers/                     # Web Workers
        └── audio-processor.ts
```

## Key Directories

### `/app`
Next.js 14 App Router implementation with page components and API routes.

### `/components`
React components split into two main categories:
- Root level: Feature-specific components
- `/ui`: Reusable UI components built with Radix UI

### `/config`
Configuration files for various features and services.

### `/data`
Static data and constants used throughout the application.

### `/docs`
Project documentation including:
- Development guides
- Debugging information
- Project structure
- Dependencies management

### `/hooks`
Custom React hooks for:
- Audio handling
- Mobile detection
- Radio streaming
- Toast notifications

### `/utils`
Utility functions for:
- Canvas management
- Performance optimization
- Stream handling
- Visualization rendering

### `/workers`
Web Workers for handling CPU-intensive tasks:
- Audio processing
- Real-time visualization

## Configuration Files
- `next.config.mjs`: Next.js configuration
- `tailwind.config.js/ts`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `postcss.config.mjs`: PostCSS configuration
- `components.json`: UI components configuration 