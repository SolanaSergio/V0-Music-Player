'use client'

import { useState } from 'react'
import { Sliders, Save } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface EqualizerPreset {
  name: string
  values: number[]
}

const defaultPresets: EqualizerPreset[] = [
  { name: 'Flat', values: [0, 0, 0, 0, 0] },
  { name: 'Bass Boost', values: [6, 4, 0, 0, 0] },
  { name: 'Treble Boost', values: [0, 0, 0, 3, 6] },
  { name: 'Vocal Boost', values: [-2, 0, 4, 3, -1] },
]

const frequencies = ['60Hz', '250Hz', '1kHz', '4kHz', '16kHz']

interface VolumeEqualizerProps {
  className?: string
  onBandChange?: (band: number, value: number) => void
}

export function VolumeEqualizer({ className, onBandChange }: VolumeEqualizerProps) {
  const [bands, setBands] = useState(defaultPresets[0].values)
  const [activePreset, setActivePreset] = useState('Flat')

  const handleBandChange = (index: number, value: number) => {
    const newBands = [...bands]
    newBands[index] = value
    setBands(newBands)
    onBandChange?.(index, value)
    setActivePreset('Custom')
  }

  const applyPreset = (preset: EqualizerPreset) => {
    setBands(preset.values)
    setActivePreset(preset.name)
    preset.values.forEach((value, index) => {
      onBandChange?.(index, value)
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Sliders className="h-4 w-4" />
          <span className="sr-only">Equalizer</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Equalizer</h4>
            <div className="text-sm text-muted-foreground">{activePreset}</div>
          </div>
          <div className="flex justify-between gap-2 pt-4">
            {bands.map((value, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Slider
                  orientation="vertical"
                  min={-12}
                  max={12}
                  step={1}
                  value={[value]}
                  className="h-32"
                  onValueChange={([v]) => handleBandChange(i, v)}
                />
                <span className="text-xs text-muted-foreground">
                  {frequencies[i]}
                </span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {defaultPresets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                className={cn(
                  "w-full",
                  activePreset === preset.name && "border-primary"
                )}
                onClick={() => applyPreset(preset)}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

