'use client'

import { useEffect } from 'react'
import { Loader2, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ImageLoader } from '@/components/image-loader'
import { useAudio } from '@/hooks/use-audio'
import { AudioVisualizer } from '@/components/audio-visualizer'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { cn } from '@/lib/utils'
import type { AudioPlayerProps } from '@/types/audio'

export function AudioPlayer({ tracks, initialTrackIndex = 0, onClose, className }: AudioPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    volume,
    progress,
    analyser,
    audioState,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
  } = useAudio(tracks, initialTrackIndex)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.()
      } else if (e.key === ' ') {
        e.preventDefault()
        togglePlay()
      } else if (e.key === 'ArrowLeft') {
        previousTrack()
      } else if (e.key === 'ArrowRight') {
        nextTrack()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, togglePlay, previousTrack, nextTrack])

  if (!currentTrack) return null

  return (
    <div 
      className={cn(
        "bg-background/95 backdrop-blur-md z-50",
        "fixed inset-0 md:relative md:inset-auto",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-title"
    >
      <div className="h-full md:h-auto overflow-auto">
        <div className="min-h-full md:min-h-0 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-4xl space-y-4 md:space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between bg-card/50 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg shadow-md">
                  <ImageLoader
                    src={currentTrack.imageUrl}
                    fallback={currentTrack.fallbackImage}
                    alt=""
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h2 id="player-title" className="text-lg sm:text-xl font-semibold truncate">
                    {currentTrack.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {currentTrack.artist}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="shrink-0 hover:bg-primary/10"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close player</span>
              </Button>
            </div>

            {/* Visualizer */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-card shadow-xl border border-primary/10">
              {audioState.isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-card">
                  <LoadingSpinner size="lg" text="Connecting to stream..." />
                </div>
              ) : audioState.error ? (
                <div className="absolute inset-0 flex items-center justify-center bg-card">
                  <div className="text-center space-y-4 p-4">
                    <p className="text-destructive">{audioState.error.message}</p>
                    <Button variant="outline" onClick={togglePlay}>Retry</Button>
                  </div>
                </div>
              ) : (
                <AudioVisualizer
                  analyser={analyser}
                  className="h-full w-full"
                  visualizerMode="bars"
                  colorScheme="default"
                  sensitivity={1.5}
                  quality="high"
                  showControls
                />
              )}
            </div>

            {/* Controls */}
            <div className="space-y-6 bg-card/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 shadow-lg">
              {/* Progress bar */}
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="w-12 sm:w-16 text-right font-mono text-xs sm:text-sm text-primary">
                  {formatTime(audioState.currentTime)}
                </span>
                <Slider
                  value={[progress]}
                  max={100}
                  step={0.1}
                  onValueChange={([value]) => seekTo(value)}
                  className="w-full"
                  aria-label="Seek time"
                />
                <span className="w-12 sm:w-16 font-mono text-xs sm:text-sm text-primary">
                  {formatTime(audioState.duration)}
                </span>
              </div>

              {/* Playback controls */}
              <div className="flex justify-center gap-4 sm:gap-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={previousTrack}
                  disabled={audioState.isLoading}
                  className="hover:bg-primary/10"
                >
                  <SkipBack className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="sr-only">Previous</span>
                </Button>
                <Button
                  size="icon"
                  onClick={togglePlay}
                  disabled={audioState.isLoading}
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                >
                  {audioState.isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : isPlaying ? (
                    <Pause className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <Play className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                  <span className="sr-only">
                    {isPlaying ? 'Pause' : 'Play'}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextTrack}
                  disabled={audioState.isLoading}
                  className="hover:bg-primary/10"
                >
                  <SkipForward className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="sr-only">Next</span>
                </Button>
              </div>

              {/* Volume control */}
              <div className="flex justify-center items-center gap-2 sm:gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setVolume(volume === 0 ? 1 : 0)}
                  className="hover:bg-primary/10"
                >
                  {volume === 0 ? (
                    <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                  <span className="sr-only">
                    {volume === 0 ? 'Unmute' : 'Mute'}
                  </span>
                </Button>
                <Slider
                  value={[volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={([value]) => setVolume(value / 100)}
                  className="w-[100px] sm:w-[160px]"
                  aria-label="Volume"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTime(seconds: number) {
  if (!isFinite(seconds)) return '--:--'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

