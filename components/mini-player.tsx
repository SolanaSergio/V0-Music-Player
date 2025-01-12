'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, Volume2, SkipBack, SkipForward, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ImageLoader } from '@/components/image-loader'
import type { Track } from '@/types/audio'

interface MiniPlayerProps {
  track: Track
  isPlaying: boolean
  onPlayPause: () => void
  onNext: () => void
  onPrevious: () => void
  onExpand: () => void
  progress: number
  volume: number
  onVolumeChange: (value: number) => void
  onProgressChange: (value: number) => void
}

export function MiniPlayer({
  track,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onExpand,
  progress,
  volume,
  onVolumeChange,
  onProgressChange
}: MiniPlayerProps) {
  const [showVolume, setShowVolume] = useState(false)

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-sm border-t border-border/20 z-50"
    >
      <div className="container h-full mx-auto flex items-center gap-4">
        <div className="flex items-center gap-3 w-[30%]">
          <div className="relative h-10 w-10 rounded-md overflow-hidden">
            <ImageLoader
              src={track.imageUrl}
              fallback={track.fallbackImage}
              alt={track.title}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{track.title}</p>
            <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onPrevious}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="h-8 w-8"
              onClick={onPlayPause}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onNext}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            className="w-[60%]"
            onValueChange={([value]) => onProgressChange(value)}
          />
        </div>

        <div className="flex items-center gap-2 w-[30%] justify-end">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowVolume(!showVolume)}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <AnimatePresence>
              {showVolume && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute bottom-full right-0 mb-2 p-4 rounded-lg bg-background border border-border/20 backdrop-blur-sm"
                >
                  <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    orientation="vertical"
                    className="h-24"
                    onValueChange={([value]) => onVolumeChange(value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onExpand}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

