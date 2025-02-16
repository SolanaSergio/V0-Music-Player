'use client'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ImageLoader } from '@/components/shared/image-loader'
import { useAudio } from '@/hooks/use-audio'
import type { AudioSource } from '@/types/audio'
import { cn } from '@/lib/utils'
import { PlayIcon, PauseIcon, VolumeIcon } from 'lucide-react'

interface AudioPlayerProps {
  className?: string
}

export function AudioPlayer({ className }: AudioPlayerProps) {
  const { currentTrack, isPlaying, volume, currentTime, duration, togglePlay, setVolume, seekTo } = useAudio()

  if (!currentTrack) return null

  const getTrackImage = (track: AudioSource): string | undefined => {
    if ('artwork' in track) return track.artwork // Track
    if ('image' in track) return track.image // RadioStation
    return undefined
  }

  const getTrackTitle = (track: AudioSource): string => {
    if ('title' in track) return track.title // Track
    return track.name // RadioStation
  }

  const getTrackArtist = (track: AudioSource): string => {
    if ('artist' in track) return track.artist // Track
    return '' // RadioStation doesn't have artist
  }

  return (
    <div className={cn('fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t', className)}>
      <div className="container flex items-center justify-between h-24 px-4">
        {/* Track Info */}
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg shadow-md">
            <ImageLoader
              src={getTrackImage(currentTrack) || '/images/default-album.jpg'}
              alt={getTrackTitle(currentTrack)}
              width={80}
              height={80}
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium line-clamp-1">
              {getTrackTitle(currentTrack)}
            </span>
            {getTrackArtist(currentTrack) && (
              <span className="text-xs text-muted-foreground line-clamp-1">
                {getTrackArtist(currentTrack)}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-[500px] px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <PauseIcon className="h-5 w-5" />
              ) : (
                <PlayIcon className="h-5 w-5" />
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-muted-foreground w-9 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              className="flex-1"
              onValueChange={([value]) => seekTo(value)}
            />
            <span className="text-xs text-muted-foreground w-9">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 w-[140px]">
          <VolumeIcon className="h-5 w-5 text-muted-foreground" />
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            className="flex-1"
            onValueChange={([value]) => setVolume(value / 100)}
          />
        </div>
      </div>
    </div>
  )
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

