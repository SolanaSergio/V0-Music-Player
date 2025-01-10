import { ActivitySquare, AudioWaveformIcon as Waveform, Circle, Activity, Sparkles, Waves, Orbit, Mountain, SplineIcon as Spiral, Star, Droplets, TerminalSquare, CircleDot, BoxIcon as Box3D } from 'lucide-react'
import type { VisualizerMode, ColorScheme } from '@/types/audio'

export const visualizerModes: VisualizerMode[] = [
  {
    id: 'bars',
    label: 'Bars',
    icon: ActivitySquare,
    description: 'Classic frequency visualization'
  },
  {
    id: 'wave',
    label: 'Wave',
    icon: Waveform,
    description: 'Oscilloscope-style waveform'
  },
  {
    id: 'circle',
    label: 'Circle',
    icon: Circle,
    description: 'Circular frequency visualization'
  },
  {
    id: 'spectrum',
    label: 'Spectrum',
    icon: Activity,
    description: 'Detailed frequency spectrum'
  },
  {
    id: 'particles',
    label: 'Particles',
    icon: Sparkles,
    interactive: true,
    description: 'Interactive particle system'
  },
  {
    id: 'frequency',
    label: 'Frequency',
    icon: Waves,
    description: 'Advanced frequency analysis'
  },
  {
    id: 'orbit',
    label: 'Orbit',
    icon: Orbit,
    description: 'Orbital frequency visualization'
  },
  {
    id: 'terrain',
    label: 'Terrain',
    icon: Mountain,
    description: 'Terrain-like visualization'
  },
  {
    id: 'spiral',
    label: 'Spiral',
    icon: Spiral,
    description: 'Spiral frequency pattern'
  },
  {
    id: 'starburst',
    label: 'Starburst',
    icon: Star,
    interactive: true,
    description: 'Interactive starburst effect'
  },
  {
    id: 'ripple',
    label: 'Ripple',
    icon: Droplets,
    interactive: true,
    description: 'Interactive ripple effect with wave propagation',
    defaultConfig: {
      speed: 1,
      smoothing: 0.8,
      decay: 0.98,
      blend: 0.1
    }
  },
  {
    id: 'rings',
    label: 'Rings',
    icon: CircleDot,
    description: 'Concentric audio rings',
    defaultConfig: {
      speed: 1,
      smoothing: 0.7,
      decay: 0.95,
      blend: 0.2
    }
  },
  {
    id: 'tunnel',
    label: 'Tunnel',
    icon: Box3D,
    description: '3D audio tunnel effect',
    defaultConfig: {
      speed: 1,
      smoothing: 0.8,
      decay: 0.97,
      blend: 0.15
    }
  },
  {
    id: 'matrix',
    label: 'Matrix',
    icon: TerminalSquare,
    description: 'Matrix-style digital rain'
  }
]

export const colorSchemes: ColorScheme[] = [
  {
    id: 'default',
    label: 'Default',
    colors: ['#22c55e', '#16a34a', '#15803d'],
    background: '#0a0a0a'
  },
  {
    id: 'rainbow',
    label: 'Rainbow',
    colors: ['#ef4444', '#f59e0b', '#22c55e', '#06b6d4', '#6366f1'],
    background: '#0a0a0a'
  },
  {
    id: 'monochrome',
    label: 'Monochrome',
    colors: ['#f8fafc', '#e2e8f0', '#94a3b8'],
    background: '#0a0a0a'
  },
  {
    id: 'gradient',
    label: 'Gradient',
    colors: ['#818cf8', '#c084fc', '#e879f9'],
    background: '#0a0a0a'
  },
  {
    id: 'neon',
    label: 'Neon',
    colors: ['#22d3ee', '#818cf8', '#f472b6'],
    background: '#0f0f0f'
  },
  {
    id: 'sunset',
    label: 'Sunset',
    colors: ['#f87171', '#fb923c', '#fbbf24'],
    background: '#0a0a0a'
  },
  {
    id: 'ocean',
    label: 'Ocean',
    colors: ['#0ea5e9', '#22d3ee', '#67e8f9'],
    background: '#0c0c0c'
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    colors: ['#f472b6', '#818cf8', '#22d3ee'],
    background: '#0a0a0a'
  },
  {
    id: 'forest',
    label: 'Forest',
    colors: ['#22c55e', '#84cc16', '#eab308'],
    background: '#0a0a0a'
  },
  {
    id: 'aurora',
    label: 'Aurora',
    colors: ['#22d3ee', '#22c55e', '#818cf8', '#f472b6'],
    background: '#0a0a0a'
  }
]

