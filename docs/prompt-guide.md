# Prompt and Context Guide

## Core Project Patterns

### 1. Audio Processing
```
Source → Provider → Worker → Visualization
     └→ Player → Queue Manager
```

### 2. Component Structure
```
Layout → Provider → Content → Feature
     └→ ErrorBoundary → Fallback
```

### 3. Performance Pattern
```
Heavy Task → Worker
UI Update → Optimization
Error → Boundary → Recovery
```

## Essential Context Elements

### 1. System Information
```
OS: Windows
Shell: PowerShell
Project Root: /c%3A/Users/sergi/OneDrive/Desktop/V0%20Music%20Player
Node: Latest LTS
Browser Support: Modern browsers
Mobile: Progressive enhancement
```

### 2. Critical Files
```
Core:
- audio-player.tsx
- audio-processor.ts
- audio-visualizer.tsx
- audio-provider.tsx

Features:
- player-view.tsx
- queue-manager.tsx
- radio-player.tsx
```

### 3. Project State
- Active branch
- Current task/feature
- Known issues
- Recent changes
- Performance metrics
- Browser compatibility

### 4. Technical Constraints
- Audio processing limits
- Browser compatibility needs
- Mobile performance requirements
- Memory management

## Quick Solutions

### 1. Performance Issues
```
CPU Spike    → Move to Worker
Memory Issue → Cleanup Effect
UI Lag       → Optimization
```

### 2. Audio Issues
```
Processing → Worker
Playback   → Feature Detection
Memory     → Cleanup
```

### 3. UI Issues
```
Component Error → Error Boundary
State Issue    → Provider Check
Layout Break   → Responsive Fix
```

## Common Operations

### 1. Development Commands
```powershell
# Development
npm run dev

# Build
npm run build

# Type Check
npm run typecheck
```

### 2. File Operations
```powershell
# View files
Get-Content filename

# Find files
Get-ChildItem -Recurse -Filter "pattern"
```

### 3. Error Handling
```typescript
// Component errors
try {
  // Logic
} catch {
  // ErrorBoundary fallback
}

// Audio operations
try {
  // Processing
} catch {
  // Degraded mode
}
```

## Best Practices

### 1. Audio Features
- Use Workers for processing
- Implement fallbacks
- Monitor performance
- Clean up resources

### 2. UI Components
- Error boundaries
- Performance monitoring
- Progressive enhancement
- Memory management

### 3. Development Flow
- Check existing patterns
- Consider constraints
- Test performance
- Document changes 