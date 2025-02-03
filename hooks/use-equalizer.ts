import { useCallback, useEffect, useRef, useState } from 'react'
import { useAudioContext } from '@/components/shared/audio-provider'

export interface EqualizerBand {
  frequency: number
  gain: number
  Q: number
  type: BiquadFilterType
}

export interface EqualizerPreset {
  name: string
  bands: EqualizerBand[]
}

// Standard frequencies for a 5-band equalizer
const DEFAULT_BANDS: EqualizerBand[] = [
  { frequency: 60, gain: 0, Q: 1.0, type: 'lowshelf' },      // Sub-bass
  { frequency: 250, gain: 0, Q: 1.0, type: 'peaking' },      // Bass
  { frequency: 1000, gain: 0, Q: 1.0, type: 'peaking' },     // Mid
  { frequency: 4000, gain: 0, Q: 1.0, type: 'peaking' },     // Treble
  { frequency: 16000, gain: 0, Q: 1.0, type: 'highshelf' },  // Presence
]

export const DEFAULT_PRESETS: EqualizerPreset[] = [
  {
    name: 'Flat',
    bands: DEFAULT_BANDS.map(band => ({ ...band, gain: 0 }))
  },
  {
    name: 'Bass Boost',
    bands: DEFAULT_BANDS.map((band, i) => ({
      ...band,
      gain: i === 0 ? 6 : i === 1 ? 4 : 0
    }))
  },
  {
    name: 'Treble Boost',
    bands: DEFAULT_BANDS.map((band, i) => ({
      ...band,
      gain: i === 3 ? 3 : i === 4 ? 6 : 0
    }))
  },
  {
    name: 'Vocal Boost',
    bands: DEFAULT_BANDS.map((band, i) => ({
      ...band,
      gain: i === 0 ? -2 : i === 2 ? 4 : i === 3 ? 3 : i === 4 ? -1 : 0
    }))
  }
]

/**
 * Custom hook for managing a 5-band audio equalizer.
 * Provides controls for frequency bands and preset management.
 */
export function useEqualizer() {
  const { audioContext, masterGain } = useAudioContext()
  const [bands, setBands] = useState<EqualizerBand[]>(DEFAULT_BANDS)
  const [activePreset, setActivePreset] = useState('Flat')
  const [isEnabled, setIsEnabled] = useState(false)
  const filtersRef = useRef<BiquadFilterNode[]>([])
  const bypassGainRef = useRef<GainNode | null>(null)

  // Initialize or update filters when audio context, bands, or enabled state changes
  useEffect(() => {
    if (!audioContext || !masterGain) return

    // Clean up old filters
    const cleanup = () => {
      filtersRef.current.forEach(filter => filter.disconnect())
      filtersRef.current = []
    }

    cleanup()

    // Create bypass gain node if it doesn't exist
    if (!bypassGainRef.current) {
      bypassGainRef.current = audioContext.createGain()
    }

    // Create new filters
    let lastNode: AudioNode = masterGain

    // Create the filter chain
    bands.forEach((band, index) => {
      const filter = audioContext.createBiquadFilter()
      filter.type = band.type
      filter.frequency.value = band.frequency
      filter.gain.value = isEnabled ? band.gain : 0
      filter.Q.value = band.Q

      // Connect the filter
      lastNode.disconnect()
      lastNode.connect(filter)
      filter.connect(audioContext.destination)
      
      lastNode = filter
      filtersRef.current[index] = filter
    })

    return cleanup
  }, [audioContext, masterGain, isEnabled, bands]) // Added bands to dependencies

  // Update individual band with smooth transition
  const updateBand = useCallback((index: number, gain: number) => {
    if (filtersRef.current[index] && isEnabled) {
      const filter = filtersRef.current[index]
      // Smooth transition for gain change
      filter.gain.setTargetAtTime(gain, audioContext?.currentTime || 0, 0.1)
      setBands(prev => prev.map((band, i) => 
        i === index ? { ...band, gain } : band
      ))
      setActivePreset('Custom')
    }
  }, [isEnabled, audioContext])

  // Apply preset with smooth transitions
  const applyPreset = useCallback((preset: EqualizerPreset) => {
    if (!isEnabled || !audioContext) return

    preset.bands.forEach((band, index) => {
      if (filtersRef.current[index]) {
        const filter = filtersRef.current[index]
        // Smooth transition when applying preset
        filter.gain.setTargetAtTime(band.gain, audioContext.currentTime, 0.1)
      }
    })
    setBands(preset.bands)
    setActivePreset(preset.name)
  }, [isEnabled, audioContext])

  // Reset to flat response
  const reset = useCallback(() => {
    const flatPreset = DEFAULT_PRESETS.find(p => p.name === 'Flat')
    if (flatPreset) {
      applyPreset(flatPreset)
    }
  }, [applyPreset])

  // Toggle equalizer with smooth transition
  const toggleEqualizer = useCallback(() => {
    if (!audioContext) return

    setIsEnabled(prev => {
      const newState = !prev
      // Update all filter gains with smooth transition
      filtersRef.current.forEach((filter, index) => {
        const targetGain = newState ? bands[index].gain : 0
        filter.gain.setTargetAtTime(targetGain, audioContext.currentTime, 0.1)
      })
      return newState
    })
  }, [bands, audioContext])

  return {
    bands,
    activePreset,
    isEnabled,
    updateBand,
    applyPreset,
    reset,
    toggleEqualizer
  }
} 