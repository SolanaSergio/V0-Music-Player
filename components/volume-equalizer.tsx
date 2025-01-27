'use client'

import { Sliders } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useEqualizer, DEFAULT_PRESETS } from '@/hooks/use-equalizer'

interface VolumeEqualizerProps {
  className?: string
}

export function VolumeEqualizer({ className }: VolumeEqualizerProps) {
  const { bands, activePreset, isEnabled, updateBand, applyPreset, toggleEqualizer } = useEqualizer()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(className, isEnabled && "text-primary")}
        >
          <Sliders className="h-4 w-4" />
          <span className="sr-only">Equalizer</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium">Equalizer</h4>
              <p className="text-sm text-muted-foreground">{activePreset}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="equalizer-toggle"
                checked={isEnabled}
                onCheckedChange={toggleEqualizer}
              />
              <label
                htmlFor="equalizer-toggle"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {isEnabled ? 'On' : 'Off'}
              </label>
            </div>
          </div>
          <div className={cn(
            "flex justify-between gap-2 pt-4 transition-opacity duration-200",
            !isEnabled && "opacity-50 pointer-events-none"
          )}>
            {bands.map((band, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Slider
                  orientation="vertical"
                  min={-12}
                  max={12}
                  step={1}
                  value={[band.gain]}
                  className="h-32"
                  onValueChange={([value]) => updateBand(i, value)}
                />
                <span className="text-xs text-muted-foreground">
                  {band.frequency < 1000 ? 
                    `${band.frequency}Hz` : 
                    `${band.frequency/1000}kHz`}
                </span>
              </div>
            ))}
          </div>
          <div className={cn(
            "grid grid-cols-2 gap-2 transition-opacity duration-200",
            !isEnabled && "opacity-50 pointer-events-none"
          )}>
            {DEFAULT_PRESETS.map((preset) => (
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

