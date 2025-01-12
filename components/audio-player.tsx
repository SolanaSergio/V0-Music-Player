'use client'

import { useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ImageLoader } from '@/components/image-loader'
import { useAudio } from '@/hooks/use-audio'
import type { Track } from '@/types/audio'
import { cn } from '@/lib/utils'

interface AudioPlayerProps {
  tracks?: Track[]
  track?: Track
  initialTrackIndex?: number
  onClose?: () => void
  className?: string
}

export function AudioPlayer({ tracks, track, initialTrackIndex = 0, className }: AudioPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    error,
    volume,
    togglePlay,
    setVolume,
    nextTrack,
    previousTrack
  } = useAudio(tracks || (track ? [track] : []), initialTrackIndex)

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        void togglePlay()
      } else if (e.code === 'ArrowLeft') {
        previousTrack()
      } else if (e.code === 'ArrowRight') {
        nextTrack()
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [togglePlay, previousTrack, nextTrack])

  if (!currentTrack) return null

  return (
    <div className={cn("p-4 bg-background/95 backdrop-blur-lg border rounded-lg shadow-lg", className)}>
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg shadow-md">
          <ImageLoader
            src={currentTrack.image}
            alt={currentTrack.title}
            width={80}
            height={80}
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-medium">
            {currentTrack.title}
          </h2>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {currentTrack.artist}
          </p>
          {error && (
            <p className="mt-1 text-sm text-red-500">
              Error: {error}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setVolume(volume === 0 ? 1 : 0)}
              className="hover:bg-primary/20"
            >
              {volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            <Slider
              value={[volume]}
              min={0}
              max={1}
              step={0.1}
              className="w-24"
              onValueChange={([value]) => setVolume(value)}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            disabled={isLoading}
            className={cn(
              "h-12 w-12 rounded-full",
              "bg-primary/10 hover:bg-primary/20",
              "text-primary hover:text-primary"
            )}
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

