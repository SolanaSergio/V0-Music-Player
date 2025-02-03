'use client'

import { Sliders } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useEqualizer, DEFAULT_PRESETS, type EqualizerBand } from '@/hooks/use-equalizer'

interface EqualizerSheetProps {
  className?: string
}

export function EqualizerSheet({ className }: EqualizerSheetProps) {
  const { bands, activePreset, isEnabled, updateBand, applyPreset, toggleEqualizer } = useEqualizer()

  // Group bands for better mobile layout
  const bandGroups = {
    low: bands.slice(0, 2),    // Sub-bass and Bass
    mid: bands.slice(2, 3),    // Mid
    high: bands.slice(3, 5),   // Treble and Presence
  }

  const BandSlider = ({ band, index }: { band: EqualizerBand, index: number }) => (
    <div className="flex flex-col items-center gap-3">
      <Slider
        orientation="vertical"
        min={-12}
        max={12}
        step={1}
        value={[band.gain]}
        className="h-44" // Taller for mobile
        onValueChange={([value]) => updateBand(index, value)}
      />
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium">
          {band.frequency < 1000 ? 
            `${band.frequency}Hz` : 
            `${band.frequency/1000}kHz`}
        </span>
        <span className="text-xs text-muted-foreground">
          {band.gain > 0 ? '+' : ''}{band.gain}dB
        </span>
      </div>
    </div>
  )

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(className, isEnabled && "text-primary")}
        >
          <Sliders className="h-4 w-4" />
          <span className="sr-only">Equalizer</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] p-0">
        <SheetHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <SheetTitle>Equalizer</SheetTitle>
            <div className="flex items-center gap-2">
              <Switch
                id="equalizer-toggle-mobile"
                checked={isEnabled}
                onCheckedChange={toggleEqualizer}
              />
              <label
                htmlFor="equalizer-toggle-mobile"
                className="text-sm font-medium"
              >
                {isEnabled ? 'On' : 'Off'}
              </label>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="bands" className="h-full">
          <div className="px-6">
            <TabsList className="w-full">
              <TabsTrigger value="bands" className="flex-1">Bands</TabsTrigger>
              <TabsTrigger value="presets" className="flex-1">Presets</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="bands" className="h-[calc(100%-4rem)] mt-0">
            <ScrollArea className="h-full">
              <div className={cn(
                "p-6 space-y-8 transition-opacity duration-200",
                !isEnabled && "opacity-50 pointer-events-none"
              )}>
                {/* Low Frequencies */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground px-2">Low</h3>
                  <div className="flex justify-around">
                    {bandGroups.low.map((band, groupIndex) => (
                      <BandSlider 
                        key={band.frequency} 
                        band={band} 
                        index={groupIndex} 
                      />
                    ))}
                  </div>
                </div>

                {/* Mid Frequencies */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground px-2">Mid</h3>
                  <div className="flex justify-around">
                    {bandGroups.mid.map((band, groupIndex) => (
                      <BandSlider 
                        key={band.frequency} 
                        band={band} 
                        index={groupIndex + 2} 
                      />
                    ))}
                  </div>
                </div>

                {/* High Frequencies */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground px-2">High</h3>
                  <div className="flex justify-around">
                    {bandGroups.high.map((band, groupIndex) => (
                      <BandSlider 
                        key={band.frequency} 
                        band={band} 
                        index={groupIndex + 3} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="presets" className="h-[calc(100%-4rem)] mt-0">
            <ScrollArea className="h-full">
              <div className={cn(
                "p-6 space-y-4 transition-opacity duration-200",
                !isEnabled && "opacity-50 pointer-events-none"
              )}>
                <div className="text-sm text-muted-foreground mb-4">
                  Current: <span className="font-medium">{activePreset}</span>
                </div>
                <div className="grid gap-3">
                  {DEFAULT_PRESETS.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="lg"
                      className={cn(
                        "h-14 w-full justify-start px-4",
                        activePreset === preset.name && "border-primary"
                      )}
                      onClick={() => applyPreset(preset)}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{preset.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {preset.name === 'Flat' ? 'Neutral response' :
                           preset.name === 'Bass Boost' ? 'Enhanced low frequencies' :
                           preset.name === 'Treble Boost' ? 'Enhanced high frequencies' :
                           'Enhanced vocal clarity'}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
} 