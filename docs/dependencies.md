# Dependencies Documentation

## Core Dependencies

### Framework
```json
{
  "next": "14.2.16",
  "react": "^18",
  "react-dom": "^18",
  "typescript": "^5"
}
```

### Audio Processing
```json
{
  "tone": "^15.0.4",
  "wavesurfer.js": "^7.8.15",
  "web-audio-beat-detector": "^8.2.20",
  "standardized-audio-context": "^25.3.77",
  "audio-decode": "^2.2.2",
  "@react-hookz/web": "^25.0.1"
}
```

### UI Components
```json
{
  "@radix-ui/react-accordion": "^1.2.2",
  "@radix-ui/react-alert-dialog": "^1.1.4",
  "@radix-ui/react-dialog": "^1.1.4",
  "@radix-ui/react-dropdown-menu": "^2.1.4",
  "@radix-ui/react-slider": "^1.2.2",
  "@radix-ui/react-toast": "^1.2.4",
  "@radix-ui/react-tooltip": "latest",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "framer-motion": "latest",
  "geist": "latest",
  "lucide-react": "^0.454.0",
  "tailwind-merge": "^2.5.5",
  "tailwindcss-animate": "^1.0.7",
  "sonner": "^1.7.1",
  "vaul": "^0.9.6"
}
```

### Form Handling
```json
{
  "@hookform/resolvers": "^3.9.1",
  "react-hook-form": "^7.54.1",
  "zod": "^3.24.1"
}
```

### Styling
```json
{
  "tailwindcss": "^3.4.17",
  "autoprefixer": "^10.4.20",
  "postcss": "^8",
  "tailwind-scrollbar": "^3.1.0"
}
```

### Development Tools
```json
{
  "@types/node": "^22",
  "@types/react": "^18",
  "@types/react-dom": "^18",
  "@types/wavesurfer.js": "^6.0.12"
}
```

## Feature-specific Dependencies

### Audio Visualization
- `wavesurfer.js`: Waveform visualization
- `tone`: Audio synthesis and processing
- `web-audio-beat-detector`: Beat detection
- `standardized-audio-context`: Cross-browser audio support

### UI Framework
- `@radix-ui/*`: Accessible UI components
- `framer-motion`: Animations
- `geist`: UI design system
- `lucide-react`: Icons
- `tailwindcss`: Utility-first CSS

### Form Management
- `react-hook-form`: Form state management
- `@hookform/resolvers`: Form validation
- `zod`: Schema validation

## Version Management

### Major Version Updates
- Keep Next.js, React, and TypeScript up to date
- Test audio libraries thoroughly before updates
- Monitor UI component breaking changes

### Version Constraints
- Use caret (^) for minor version updates
- Pin critical dependencies to exact versions
- Use "latest" sparingly (only for actively maintained packages)

## Development Setup

### Installation
```bash
npm install    # Install all dependencies
npm install --production    # Install production dependencies only
```

### Development Scripts
```bash
npm run dev        # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run linting
```

## Performance Considerations

### Bundle Size Optimization
- Monitor bundle size with audio libraries
- Use dynamic imports for large components
- Tree-shake unused UI components

### Audio Processing
- Load audio libraries on demand
- Use Web Workers for intensive processing
- Implement proper cleanup for audio contexts

## Security Notes

### Package Auditing
```bash
npm audit         # Check for vulnerabilities
npm audit fix     # Fix vulnerabilities
```

### Version Locking
- Use package-lock.json
- Regular dependency updates
- Security patch automation

## Troubleshooting

### Common Issues
1. Audio context initialization
2. Cross-browser compatibility
3. Bundle size warnings
4. Type definition conflicts

### Solutions
1. Use standardized-audio-context
2. Test in multiple browsers
3. Implement code splitting
4. Update @types packages 