'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Share2, ListMusic, Mic2, Maximize2, ChevronDown, Music2, MoreHorizontal, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume, VolumeX, Volume1, Volume2, Minimize2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AudioVisualizer } from '@/components/audio-visualizer'
import { VolumeEqualizer } from '@/components/volume-equalizer'
import { QueueManager } from '@/components/queue-manager'
import { ShareModal } from '@/components/share-modal'
import { LyricsDisplay } from '@/components/lyrics-display'
import { cn } from "@/lib/utils"
import { featuredTracks, radioStations } from '@/data/audio'
import { visualizerModes } from '@/config/visualizer'
import { useRadioStream } from '@/hooks/use-radio-stream'
import type { Track, RadioStation } from '@/types/audio'

export function PlayerView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stationId = searchParams.get('station')
  const trackId = searchParams.get('track')

  // Find either a radio station or a track
  const radioStation = stationId ? radioStations.find(s => s.id === stationId) : null
  const track = trackId ? featuredTracks.find(t => t.id === trackId) : null
  const initialItem = radioStation || track || featuredTracks[0]

  const [currentItem, setCurrentItem] = useState<Track | RadioStation>(initialItem)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [isShuffle, setIsShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none')
  const [progress, setProgress] = useState(0)
  const [queue, setQueue] = useState(featuredTracks)
  const [currentVisualizer, setCurrentVisualizer] = useState(visualizerModes[0])
  const [showVisualizerControls, setShowVisualizerControls] = useState(false)

  // Radio stream handling
  const { streamState, connect, disconnect } = useRadioStream()

  const VolumeIcon = volume === 0 
    ? VolumeX 
    : volume < 0.3 
    ? Volume 
    : volume < 0.7 
    ? Volume1 
    : Volume2

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'f') {
        setIsFullscreen(prev => !prev)
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [isFullscreen])

  const handleVisualizerChange = () => {
    const currentIndex = visualizerModes.findIndex(v => v.id === currentVisualizer.id)
    const nextIndex = (currentIndex + 1) % visualizerModes.length
    setCurrentVisualizer(visualizerModes[nextIndex])
  }

  const handlePlayPause = () => {
    if ('streamUrl' in currentItem) {
      // It's a radio station
      if (streamState.isConnected) {
        disconnect()
      } else {
        connect(currentItem.streamUrl)
      }
    } else {
      // It's a track
      setIsPlaying(!isPlaying)
    }
  }

  // Initialize playback when component mounts
  useEffect(() => {
    if ('streamUrl' in currentItem) {
      connect(currentItem.streamUrl)
    }
    return () => {
      if ('streamUrl' in currentItem) {
        disconnect()
      }
    }
  }, [currentItem])

  // Update playing state based on stream state
  useEffect(() => {
    if ('streamUrl' in currentItem) {
      setIsPlaying(streamState.isConnected)
    }
  }, [streamState.isConnected, currentItem])

  return (
    <div className={cn(
      "relative transition-all duration-700",
      isFullscreen ? "fixed inset-0 z-50 bg-background" : "h-[calc(100vh-4rem)]"
    )}>
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/2 to-background" />
        <div className="absolute inset-0 bg-grid-white/[0.02] animate-grid-flow" />
        <div 
          className="absolute inset-0 opacity-30 transition-opacity duration-1000"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, var(--primary) 0%, transparent 70%)`
          }}
        />
      </div>

      {/* Header */}
      {!isFullscreen && (
        <header className="absolute top-0 left-0 right-0 z-10">
          <div className="container py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="hover:bg-primary/20"
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-semibold truncate">Now Playing</h1>
                  <p className="text-sm text-muted-foreground truncate">
                    {'title' in currentItem ? currentItem.title : currentItem.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className={cn(
          "w-full max-w-3xl mx-auto transition-all duration-700",
          isFullscreen ? "scale-110" : "scale-100"
        )}>
          {/* Visualizer */}
          <motion.div
            layout
            className={cn(
              "relative aspect-square w-full rounded-xl overflow-hidden border border-border/5 bg-card/20 backdrop-blur-sm shadow-2xl",
              "group cursor-pointer transition-transform duration-700",
              isFullscreen ? "hover:scale-105" : "hover:scale-102"
            )}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            onClick={() => setShowVisualizerControls(!showVisualizerControls)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentVisualizer.id}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AudioVisualizer
                  analyser={null}
                  className="h-full w-full"
                  visualizerMode={currentVisualizer.id}
                  colorScheme="default"
                  sensitivity={1.5}
                  quality="high"
                  showControls={showVisualizerControls}
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Track Info */}
          <motion.div
            className="text-center mt-8 space-y-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold tracking-tight">
              {'title' in currentItem ? currentItem.title : currentItem.name}
            </h2>
            <p className="text-xl text-muted-foreground">
              {'artist' in currentItem ? currentItem.artist : 'Radio Station'}
            </p>
          </motion.div>

          {/* Controls */}
          <motion.div
            className="mt-8 flex items-center justify-center gap-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-primary/20"
              onClick={() => setIsShuffle(!isShuffle)}
              disabled={!('title' in currentItem)}
            >
              <Shuffle className={cn("h-5 w-5", isShuffle && "text-primary")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-primary/20"
              disabled={!('title' in currentItem)}
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-14 w-14 rounded-full hover:bg-primary/20"
              onClick={handlePlayPause}
              disabled={streamState.isBuffering}
            >
              {streamState.isBuffering ? (
                <div className="animate-spin">
                  <div className="h-5 w-5 border-2 border-primary border-r-transparent rounded-full" />
                </div>
              ) : isPlaying ? (
                <Pause className="h-7 w-7" />
              ) : (
                <Play className="h-7 w-7" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-primary/20"
              disabled={!('title' in currentItem)}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-primary/20"
              onClick={() => {
                setRepeatMode(current => {
                  if (current === 'none') return 'all'
                  if (current === 'all') return 'one'
                  return 'none'
                })
              }}
              disabled={!('title' in currentItem)}
            >
              <Repeat className={cn(
                "h-5 w-5",
                repeatMode !== 'none' && "text-primary",
                repeatMode === 'one' && "after:content-['1'] after:absolute after:text-[10px] after:font-bold after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2"
              )} />
            </Button>
          </motion.div>

          {/* Additional Controls */}
          <motion.div
            className="mt-4 flex items-center justify-center gap-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-primary/20"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-primary text-primary")} />
            </Button>
            <ShareModal
              title={'title' in currentItem ? currentItem.title : currentItem.name}
              url={window.location.href}
              description="music track"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-primary/20"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </ShareModal>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-primary/20"
              onClick={() => setShowLyrics(!showLyrics)}
              disabled={!('title' in currentItem)}
            >
              <Mic2 className="h-4 w-4" />
            </Button>
            <QueueManager
              currentTrack={'title' in currentItem ? currentItem : undefined}
              queue={queue}
              onRemoveTrack={(index) => {
                setQueue(prev => prev.filter((_, i) => i !== index))
              }}
              onReorderTrack={(from, to) => {
                setQueue(prev => {
                  const newQueue = [...prev]
                  const [removed] = newQueue.splice(from, 1)
                  newQueue.splice(to, 0, removed)
                  return newQueue
                })
              }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-primary/20"
              >
                <ListMusic className="h-4 w-4" />
              </Button>
            </QueueManager>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-primary/20"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </motion.div>

          {/* Volume Control */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-primary/20"
              onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
            >
              <VolumeIcon className="h-4 w-4" />
            </Button>
            <div className="w-32">
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                className="transition-opacity"
                onValueChange={([value]) => setVolume(value / 100)}
              />
            </div>
          </div>

          {/* Error Message */}
          {streamState.error && (
            <motion.div
              className="mt-4 text-center text-sm text-destructive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {streamState.error}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

