# V0 Music Player

A modern music player application built with Next.js, React, and TypeScript, featuring a beautiful UI powered by Tailwind CSS and Radix UI components. Experience high-quality audio streaming with dynamic visualizations.

## Features

- Modern, responsive user interface
- High-quality audio streaming with robust error handling
- Dynamic audio visualizers with multiple visualization modes
- Volume control with smooth transitions
- Automatic audio context management
- Cross-browser compatibility (including Safari)
- Theme support with next-themes
- Comprehensive UI component library
- TypeScript for type safety

## Tech Stack

- **Framework**: Next.js 14
- **UI Components**: 
  - Radix UI
  - Tailwind CSS
  - Framer Motion
- **Audio Processing**:
  - Web Audio API
  - Audio Worklet Processors
  - Stream Processing
- **State Management**: React Hooks
- **Type System**: TypeScript

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/SolanaSergio/V0-Music-Player.git
```

2. Install dependencies:
```bash
cd V0-Music-Player
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                 # Next.js application routes
├── components/          # Reusable UI components
│   ├── audio/          # Audio-related components
│   ├── visualizers/    # Audio visualization components
│   └── ui/             # General UI components
├── config/             # Configuration files
├── data/               # Data files and constants
├── docs/               # Project documentation
├── hooks/              # Custom React hooks
├── lib/                # Library code
├── public/             # Static assets
├── styles/             # CSS and styling
├── types/              # TypeScript types
├── utils/              # Utility functions
└── workers/            # Web workers
```

## Audio Features

- **High-Quality Streaming**: Efficient audio streaming with automatic quality adjustment
- **Robust Error Handling**: Comprehensive error management for audio context and stream issues
- **Cross-Browser Support**: Works across modern browsers with fallbacks for Safari
- **Dynamic Visualizers**: Multiple visualization modes with customizable themes
- **Volume Control**: Smooth volume transitions with click protection
- **Auto-Recovery**: Automatic recovery from network issues and context interruptions

## Documentation

Comprehensive documentation is available in the `docs` folder:
- Project structure overview
- Audio system architecture
- Visualizer implementation
- Dependency management
- Debugging guides
- Development workflow
- Component documentation

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run linting

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
