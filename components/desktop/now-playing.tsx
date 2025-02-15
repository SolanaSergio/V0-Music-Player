'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, Radio, Heart, Play, Pause, SkipForward, Music2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { RadioStationImage } from '@/components/shared/radio-station-image'
import { useAudio } from '@/hooks/use-audio'
import { useRadioStream } from '@/hooks/use-radio-stream'
import { AudioVisualizer } from '@/components/shared/audio-visualizer'
import { cn } from '@/lib/utils'
import type { RadioStation, Track } from '@/types/audio'

// Type guard to check if the audio source is a radio station
function isRadioStation(source: Track | RadioStation | null): source is RadioStation {
  return source !== null && 'streamUrl' in source
}

export function NowPlaying() {
  const { currentTrack: currentSource, isPlaying, togglePlay, volume, setVolume } = useAudio()
  const { analyser, currentMetadata } = useRadioStream()

  if (!currentSource) {
    return (
      <Card className="overflow-hidden border-border/50 bg-background/50 backdrop-blur-lg">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <Radio className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">No station selected</p>
            <p className="text-sm">Choose a station to start listening</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get display information based on source type
  const displayInfo = {
    title: isRadioStation(currentSource) ? currentSource.name : currentSource.title,
    subtitle: isRadioStation(currentSource) 
      ? currentSource.description 
      : `${currentSource.artist} - ${currentSource.album}`,
    image: currentSource.image,
    icon: isRadioStation(currentSource) ? Radio : Music2,
    type: isRadioStation(currentSource) ? 'Radio Station' : 'Track'
  }

  return (
    <Card className="overflow-hidden border-border/50 bg-background/50 backdrop-blur-lg">
      <CardContent className="p-6">
        <div className="flex flex-col h-full space-y-4">
          {/* Source Info */}
          <div className="flex items-start space-x-4">
            <div className="relative w-24 h-24">
              <RadioStationImage
                src={displayInfo.image}
                alt={displayInfo.title}
                width={96}
                height={96}
                className="rounded-lg object-cover"
              />
              <div className="absolute inset-0 bg-black/20 rounded-lg" />
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: isPlaying ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
              >
                <displayInfo.icon className="w-8 h-8 text-white" />
              </motion.div>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{displayInfo.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {displayInfo.type}
                </Badge>
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentMetadata?.title || 'description'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-sm text-muted-foreground"
                >
                  {currentMetadata?.title || displayInfo.subtitle}
                </motion.p>
              </AnimatePresence>
              {isRadioStation(currentSource) && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Radio className="w-3 h-3 mr-1" />
                  <span>{currentSource.listeners}k listening</span>
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" className="text-primary">
              <Heart className="w-5 h-5" />
            </Button>
          </div>

          {/* Audio Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={togglePlay}
                className={cn(
                  "h-12 w-12 rounded-full",
                  "hover:scale-105 transition-transform",
                  "bg-primary/10 hover:bg-primary/20"
                )}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-1" />
                )}
              </Button>
              {!isRadioStation(currentSource) && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-muted-foreground hover:text-primary"
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                className="w-full"
                onValueChange={([value]) => setVolume(value / 100)}
              />
            </div>
            <div className="h-24 relative overflow-hidden rounded-lg bg-primary/5">
              {analyser ? (
                <AudioVisualizer
                  analyser={analyser}
                  className="w-full h-full"
                  visualizerMode="bars"
                  colorScheme="system"
                  sensitivity={1.2}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center space-x-1">
                  {[...Array(32)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-primary"
                      animate={{
                        height: isPlaying
                          ? [
                              Math.random() * 24 + 4,
                              Math.random() * 24 + 4,
                              Math.random() * 24 + 4,
                            ]
                          : 4,
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.05,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 