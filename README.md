# V0 Music Player

A modern music streaming platform built with Next.js, featuring live radio stations and a beautiful UI.

## Features

- 🎵 Live radio streaming
- 🎨 Beautiful, responsive UI
- 🎧 Audio visualizer
- 📱 Mobile-friendly design
- 🎼 Genre-based exploration
- ❤️ Favorites and playlists
- 🔍 Search functionality
- 🌙 Dark mode support

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- An Unsplash API key (for downloading station images)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/v0-music-player.git
cd v0-music-player
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
UNSPLASH_ACCESS_KEY=your_unsplash_api_key_here
NEXT_PUBLIC_CDN_URL=
```

4. Download station images:
```bash
npm run download-images
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
v0-music-player/
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── desktop/          # Desktop-specific components
│   ├── mobile/           # Mobile-specific components
│   ├── shared/           # Shared components
│   └── ui/               # UI components
├── config/               # Configuration files
├── data/                 # Static data and content
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── public/              # Static assets
│   ├── stations/        # Radio station images
│   └── genres/          # Genre images
├── scripts/             # Build and utility scripts
├── styles/              # Global styles
├── types/               # TypeScript type definitions
└── workers/             # Web Workers for audio processing
```

## Development

### Code Style

The project uses TypeScript with strict mode enabled and follows the Next.js recommended patterns. ESLint and Prettier are configured for code quality.

### Adding New Features

1. Create new components in the appropriate directory
2. Update types as needed
3. Add tests for new functionality
4. Update documentation

### Building for Production

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Radix UI for accessible components
- Tailwind CSS for the utility-first CSS framework
- Unsplash for providing high-quality images
