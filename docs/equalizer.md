# Equalizer Documentation

## Overview
The V0 Music Player includes a professional-grade 5-band parametric equalizer with preset management and smooth transitions. The equalizer is implemented using the Web Audio API's BiquadFilterNode for high-quality audio processing.

## Technical Specifications

### Frequency Bands
1. **Sub-bass** (60 Hz, Low Shelf)
   - Range: -12dB to +12dB
   - Q: 1.0
   - Type: lowshelf

2. **Bass** (250 Hz, Peaking)
   - Range: -12dB to +12dB
   - Q: 1.0
   - Type: peaking

3. **Mid** (1 kHz, Peaking)
   - Range: -12dB to +12dB
   - Q: 1.0
   - Type: peaking

4. **Treble** (4 kHz, Peaking)
   - Range: -12dB to +12dB
   - Q: 1.0
   - Type: peaking

5. **Presence** (16 kHz, High Shelf)
   - Range: -12dB to +12dB
   - Q: 1.0
   - Type: highshelf

### Default Presets

1. **Flat**
   - All bands set to 0dB
   - Neutral frequency response

2. **Bass Boost**
   - Sub-bass (60 Hz): +6dB
   - Bass (250 Hz): +4dB
   - Other bands: 0dB

3. **Treble Boost**
   - Treble (4 kHz): +3dB
   - Presence (16 kHz): +6dB
   - Other bands: 0dB

4. **Vocal Boost**
   - Sub-bass (60 Hz): -2dB
   - Mid (1 kHz): +4dB
   - Treble (4 kHz): +3dB
   - Presence (16 kHz): -1dB
   - Bass (250 Hz): 0dB

## Implementation Details

### Audio Processing Chain
```
Source → EQ Input → [Filter Chain] → EQ Output → Master Gain → Destination
```

### Filter Chain
- Each band is implemented as a BiquadFilterNode
- Filters are connected in series
- Smooth transitions using `setTargetAtTime`
- Automatic cleanup on unmount or reconfiguration

### State Management
- Uses React's useState and useRef hooks
- Maintains band settings across toggles
- Preserves preset selection
- Handles audio context lifecycle

### Performance Optimizations
- Efficient filter node reuse
- Smooth parameter transitions
- Proper cleanup of audio nodes
- Memory leak prevention

## User Interface

### Responsive Design
The equalizer features a fully responsive design that adapts to both desktop and mobile interfaces:

#### Desktop Interface
- Popover-based interface
- Compact layout optimized for mouse interaction
- Grid layout for preset buttons
- Standard-sized controls

#### Mobile Interface
- Bottom drawer interface for better touch interaction
- Full-width layout for easier access
- Larger touch targets:
  - Taller sliders (40px increase)
  - Larger preset buttons
  - Increased text size for frequency labels
- Optimized spacing and padding
- Single-column preset layout

### Controls
- On/Off toggle switch
- 5 vertical sliders (-12dB to +12dB)
- Preset selection buttons
- Frequency labels
- Active preset indicator

### Visual Feedback
- Disabled state opacity reduction
- Active preset highlighting
- Smooth slider transitions
- Enable/disable animations
- Mobile-specific touch feedback
- Responsive layout transitions

### Accessibility Features
- Screen reader support
- Touch-friendly targets on mobile
- Clear visual hierarchy
- Keyboard navigation support
- High contrast state indicators

## Browser Support
- Chrome/Edge (full support)
- Firefox (full support)
- Safari (requires webkit prefix)
- Mobile browsers (full support)
- Responsive design breakpoints:
  - Mobile: < 768px
  - Desktop: ≥ 768px

## Known Limitations
- CPU usage increases with filter count
- Some browsers may limit audio processing in background tabs
- Mobile devices may have performance impact
- Touch events may have slight latency on some devices

## Future Improvements
- [ ] Additional presets
- [ ] Custom preset saving
- [ ] Variable Q control
- [ ] Frequency response visualization
- [ ] A/B comparison feature
- [ ] Import/export preset functionality
- [ ] Gesture controls for mobile
- [ ] Haptic feedback on mobile devices
- [ ] Landscape mode optimization
- [ ] Tablet-specific layout 