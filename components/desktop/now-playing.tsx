'use client'

import { Volume2, Radio, Heart, Play, Pause, Music2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { ImageLoader } from '@/components/shared/image-loader'
import { useAudio } from '@/hooks/use-audio'
import { useRadioStream } from '@/hooks/use-radio-stream'
import { AudioVisualizer } from '@/components/shared/audio-visualizer'
import type { RadioStation, Track } from '@/types/audio'

// Type guard to check if the audio source is a radio station
function isRadioStation(source: Track | RadioStation | null): source is RadioStation {
  return source !== null && 'streamUrl' in source
}

// Helper to get the image URL from either Track or RadioStation
function getSourceImage(source: Track | RadioStation): string | undefined {
  if (isRadioStation(source)) {
    return source.image
  }
  return source.artwork
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

  const displayInfo = {
    title: isRadioStation(currentSource) ? currentSource.name : currentSource.title,
    subtitle: isRadioStation(currentSource) 
      ? currentSource.description 
      : `${currentSource.artist}${currentSource.album ? ` - ${currentSource.album}` : ''}`,
    imageUrl: getSourceImage(currentSource),
    icon: isRadioStation(currentSource) ? Radio : Music2,
    type: isRadioStation(currentSource) ? 'Radio Station' : 'Track'
  }

  return (
    <Card className="overflow-hidden border-border/50 bg-background/50 backdrop-blur-lg">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          {/* Image Section */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            <ImageLoader
              src={displayInfo.imageUrl || '/images/default-album.jpg'}
              alt={displayInfo.title}
              className="object-cover"
              width={300}
              height={300}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            {analyser && (
              <div className="absolute inset-0 flex items-center justify-center">
                <AudioVisualizer 
                  analyser={analyser} 
                  className="w-full h-full opacity-50"
                  visualizerMode="bars"
                  colorScheme="default"
                />
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <Badge variant="outline" className="mb-2">
                  <displayInfo.icon className="h-3 w-3 mr-1" />
                  {displayInfo.type}
                </Badge>
                <h2 className="text-2xl font-bold">{displayInfo.title}</h2>
                {displayInfo.subtitle && (
                  <p className="text-muted-foreground">{displayInfo.subtitle}</p>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-12 w-12 rounded-full bg-primary/10 hover:bg-primary/20"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-2 w-48">
                <Volume2 className="h-5 w-5 text-muted-foreground" />
                <Slider
                  value={[volume * 100]}
                  max={100}
                  step={1}
                  className="flex-1"
                  onValueChange={([value]) => setVolume(value / 100)}
                />
              </div>
            </div>

            {/* Metadata */}
            {currentMetadata?.station && (
              <div className="mt-auto pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {currentMetadata.station.format && (
                    <span className="inline-flex items-center gap-1 mr-4">
                      <Music2 className="h-3 w-3" />
                      {currentMetadata.station.format}
                    </span>
                  )}
                  {currentMetadata.station.bitrate && (
                    <span>{Math.round(currentMetadata.station.bitrate / 1000)} kbps</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 