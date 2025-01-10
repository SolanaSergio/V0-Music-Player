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
import { ImageLoader } from '@/components/image-loader'
import { cn } from "@/lib/utils"
import { featuredTracks } from '@/data/audio'
import { visualizerModes } from '@/config/visualizer'

export function PlayerView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stationId = searchParams.get('station')
  const trackId = searchParams.get('track')

  const initialTrack = featuredTracks.find(
    track => track.id === (trackId || stationId)
  ) || featuredTracks[0]

  const [currentTrack, setCurrentTrack] = useState(initialTrack)
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
                  <p className="text-sm text-muted-foreground truncate">{currentTrack.title}</p>
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
          {/* Album Art and Visualizer */}
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
                <ImageLoader
                  src={currentTrack.imageUrl}
                  fallback={currentTrack.fallbackImage}
                  alt={currentTrack.title}
                  fill
                  className={cn(
                    "object-cover transition-opacity duration-1000",
                    isPlaying ? "opacity-40" : "opacity-80"
                  )}
                />
              </motion.div>
            </AnimatePresence>

            {/* Visualizer Controls Overlay */}
            <AnimatePresence>
              {showVisualizerControls && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold">{currentVisualizer.label}</h3>
                    <p className="text-sm text-muted-foreground">{currentVisualizer.description}</p>
                    <Button onClick={handleVisualizerChange}>
                      Change Visualizer
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fullscreen Toggle */}
            <Button
              size="icon"
              className="absolute top-4 right-4 backdrop-blur-sm bg-background/30 hover:bg-background/50 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation()
                setIsFullscreen(!isFullscreen)
              }}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </motion.div>

          {/* Track Info */}
          <motion.div
            className="text-center mt-8 space-y-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold tracking-tight">{currentTrack.title}</h2>
            <p className="text-xl text-muted-foreground">{currentTrack.artist}</p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            className="mt-8 space-y-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Slider
              value={[progress]}
              max={100}
              step={0.1}
              className="w-full"
              onValueChange={([value]) => setProgress(value)}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>1:23</span>
              <span>3:45</span>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            className="mt-8 space-y-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {/* Main Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full transition-all duration-300 hover:scale-110",
                  isShuffle && "text-primary bg-primary/20 hover:bg-primary/30"
                )}
                onClick={() => setIsShuffle(!isShuffle)}
              >
                <Shuffle className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full transition-all duration-300 hover:scale-110"
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                className={cn(
                  "h-16 w-16 rounded-full transition-all duration-300 hover:scale-110",
                  isPlaying ? "bg-primary hover:bg-primary/90" : "bg-primary hover:bg-primary/90"
                )}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                <AnimatePresence mode="wait">
                  {isPlaying ? (
                    <motion.div
                      key="pause"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Pause className="h-8 w-8" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="play"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Play className="h-8 w-8" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full transition-all duration-300 hover:scale-110"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full transition-all duration-300 hover:scale-110",
                  repeatMode !== 'none' && "text-primary bg-primary/20 hover:bg-primary/30"
                )}
                onClick={() => setRepeatMode(
                  repeatMode === 'none' ? 'all' : 
                  repeatMode === 'all' ? 'one' : 
                  'none'
                )}
              >
                <div className="relative">
                  <Repeat className="h-5 w-5" />
                  {repeatMode === 'one' && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold">
                      1
                    </span>
                  )}
                </div>
              </Button>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-full transition-all duration-300",
                  isLiked && "text-primary bg-primary/20 hover:bg-primary/30"
                )}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  isLiked && "fill-current scale-110"
                )} />
              </Button>
              <ShareModal
                title="Share Track"
                url={window.location.href}
                description="music track"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full transition-all duration-300 hover:scale-110"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </ShareModal>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-full transition-all duration-300",
                  showLyrics && "text-primary bg-primary/20 hover:bg-primary/30"
                )}
                onClick={() => setShowLyrics(!showLyrics)}
              >
                <Mic2 className="h-5 w-5" />
              </Button>
              <VolumeEqualizer className="h-10 w-10 rounded-full transition-all duration-300" />
              <div className="group flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full transition-all duration-300"
                  onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
                >
                  <VolumeIcon className="h-5 w-5" />
                </Button>
                <div className="w-0 overflow-hidden transition-all duration-300 group-hover:w-24">
                  <Slider
                    value={[volume * 100]}
                    max={100}
                    step={1}
                    className="w-24"
                    onValueChange={([value]) => setVolume(value / 100)}
                  />
                </div>
              </div>
              <QueueManager
                currentTrack={currentTrack}
                queue={queue}
                onRemoveTrack={(index) => {
                  const newQueue = [...queue]
                  newQueue.splice(index, 1)
                  setQueue(newQueue)
                }}
                onReorderTrack={(from, to) => {
                  const newQueue = [...queue]
                  const [removed] = newQueue.splice(from, 1)
                  newQueue.splice(to, 0, removed)
                  setQueue(newQueue)
                }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full transition-all duration-300 hover:scale-110"
                >
                  <ListMusic className="h-5 w-5" />
                </Button>
              </QueueManager>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Lyrics Panel */}
      <AnimatePresence>
        {showLyrics && !isFullscreen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="fixed bottom-0 left-0 right-0 overflow-hidden"
          >
            <div className="container py-4">
              <div className="h-[200px] rounded-xl border border-border/5 bg-card/20 backdrop-blur-sm overflow-hidden">
                <LyricsDisplay
                  lyrics={[
                    "Loading lyrics...",
                    "This is a placeholder for lyrics display",
                    "Real lyrics would be fetched from an API",
                  ]}
                  currentTime={0}
                  onClose={() => setShowLyrics(false)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes grid-flow {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 24px 24px;
          }
        }
        .animate-grid-flow {
          animation: grid-flow 20s linear infinite;
        }
      `}</style>
    </div>
  )
}

