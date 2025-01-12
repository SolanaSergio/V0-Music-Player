'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Share2, ListMusic, Mic2, Maximize2, ChevronDown, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, VolumeX, Minimize2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AudioVisualizer } from '@/components/audio-visualizer'
import { VolumeEqualizer } from '@/components/volume-equalizer'
import { QueueManager } from '@/components/queue-manager'
import { ShareModal } from '@/components/share-modal'
import { LyricsDisplay } from '@/components/lyrics-display'
import { cn } from "@/lib/utils"
import { featuredTracks } from '@/data/audio'
import { radioStations } from '@/data/radio-stations'
import { visualizerModes, colorSchemes } from '@/config/visualizer'
import type { VisualizerMode, ColorScheme, Track, GenreIconType } from '@/types/audio'
import { useRadioStream } from '@/hooks/use-radio-stream'

export function PlayerView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const trackId = searchParams.get('track')
  const stationId = searchParams.get('station')

  // Find the requested track/station or default to the first track
  const initialTrack = stationId 
    ? {
        id: stationId,
        title: radioStations.find(s => s.id === stationId)?.name || 'Unknown Station',
        artist: 'Live Radio',
        album: radioStations.find(s => s.id === stationId)?.description || '',
        duration: 0,
        genre: 'electronic' as GenreIconType,
        image: radioStations.find(s => s.id === stationId)?.image || '',
        audioUrl: `/api/stream/${stationId}`,
        isLive: true
      }
    : trackId 
      ? featuredTracks.find(track => track.id === trackId) 
      : featuredTracks[0]

  const station = stationId ? radioStations.find(s => s.id === stationId) : null
  const { isConnected, isBuffering, error, connectToStream, disconnect, analyser } = useRadioStream()

  const [currentTrack, setCurrentTrack] = useState<Track>(initialTrack || featuredTracks[0])
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
  const [currentColorScheme, setCurrentColorScheme] = useState(colorSchemes[0])
  const [sensitivity, setSensitivity] = useState(1.5)

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

  // Update current track when URL parameter changes
  useEffect(() => {
    if (trackId) {
      const track = featuredTracks.find(t => t.id === trackId)
      if (track) {
        setCurrentTrack(track)
        setIsPlaying(true) // Auto-play when track changes
      }
    }
  }, [trackId])

  // Update URL when track changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (currentTrack.id !== params.get('track')) {
      params.set('track', currentTrack.id)
      router.replace(`/player?${params.toString()}`)
    }
  }, [currentTrack, router, searchParams])

  return (
    <div className={cn(
      "relative min-h-[calc(100vh-4rem)] overflow-hidden transition-all duration-700",
      isFullscreen ? "fixed inset-0 z-50 bg-background" : ""
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

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-primary/20"
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Now Playing</h1>
              <p className="text-muted-foreground">{currentTrack.title} • {currentTrack.artist}</p>
            </div>
          </div>
        </div>

        {/* Player Section */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-5xl mx-auto w-full">
          {/* Visualizer */}
          <motion.div
            layout
            className={cn(
              "relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-border/5 bg-background/50 backdrop-blur-sm shadow-xl group",
              "transition-transform duration-700",
              isFullscreen ? "hover:scale-105" : "hover:scale-[1.02]"
            )}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AudioVisualizer
              analyser={analyser}
              className="absolute inset-0 z-10 w-full h-full"
              visualizerMode={currentVisualizer.id}
              colorScheme={currentColorScheme.id}
              sensitivity={sensitivity}
              quality="high"
              showControls={false}
            />

            {/* Visualizer Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-wrap items-center gap-2 bg-background/60 backdrop-blur-md p-3 transition-opacity duration-200 opacity-0 group-hover:opacity-100">
              <Select 
                value={currentVisualizer.id} 
                onValueChange={(value: VisualizerMode['id']) => setCurrentVisualizer(visualizerModes.find(v => v.id === value) || visualizerModes[0])}
              >
                <SelectTrigger className="w-[140px] bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visualizerModes.map(visualizer => (
                    <SelectItem key={visualizer.id} value={visualizer.id}>
                      <div className="flex items-center">
                        <visualizer.icon className="mr-2 h-4 w-4" />
                        {visualizer.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={currentColorScheme.id} 
                onValueChange={(value: ColorScheme['id']) => setCurrentColorScheme(colorSchemes.find(c => c.id === value) || colorSchemes[0])}
              >
                <SelectTrigger className="w-[140px] bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorSchemes.map(scheme => (
                    <SelectItem key={scheme.id} value={scheme.id}>
                      <div className="flex items-center gap-2">
                        <div className="flex h-4 items-center gap-px">
                          {scheme.colors.map((color, i) => (
                            <div
                              key={i}
                              className="h-full w-1"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        {scheme.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-muted-foreground">Sensitivity</span>
                <Slider
                  value={[sensitivity]}
                  min={0.5}
                  max={2.5}
                  step={0.1}
                  className="w-24"
                  onValueChange={([value]) => setSensitivity(value)}
                />
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="ml-2"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </motion.div>

          {/* Track Info */}
          <motion.div
            className="text-center space-y-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold tracking-tight">{currentTrack.title}</h2>
            <p className="text-xl text-muted-foreground">{currentTrack.artist}</p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            className="w-full max-w-3xl space-y-1.5"
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
            className="space-y-4 w-full max-w-lg"
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
                onClick={async () => {
                  if (station) {
                    try {
                      if (isConnected) {
                        disconnect()
                        setIsPlaying(false)
                      } else {
                        await connectToStream(`/api/stream/${station.id}`)
                        setIsPlaying(true)
                      }
                    } catch (err) {
                      console.error('Playback toggle failed:', err)
                    }
                  } else {
                    setIsPlaying(!isPlaying)
                  }
                }}
                disabled={isBuffering}
              >
                <AnimatePresence mode="wait">
                  {(station ? isConnected : isPlaying) ? (
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
                  "h-4 w-4 transition-transform duration-300",
                  isLiked && "fill-current scale-110"
                )} />
              </Button>
              <ShareModal
                title={currentTrack.title}
                url={window.location.href}
                description="music track"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full transition-all duration-300 hover:scale-110"
                >
                  <Share2 className="h-4 w-4" />
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
                <Mic2 className="h-4 w-4" />
              </Button>
              <VolumeEqualizer className="h-10 w-10 rounded-full transition-all duration-300" />
              <div className="group flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full transition-all duration-300"
                  onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
                >
                  {volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
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
                  <ListMusic className="h-4 w-4" />
                </Button>
              </QueueManager>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Lyrics Sheet */}
      <AnimatePresence>
        {showLyrics && !isFullscreen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            className="fixed inset-x-0 bottom-0 h-96 bg-background/95 backdrop-blur-sm border-t border-border/20 z-50"
          >
            <LyricsDisplay
              lyrics={[
                "Loading lyrics...",
                "This is a placeholder for lyrics display",
                "Real lyrics would be fetched from an API",
              ]}
              currentTime={0}
              onClose={() => setShowLyrics(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error and Loading States */}
      {error && (
        <div className="fixed bottom-4 left-0 right-0 text-sm text-destructive text-center">
          {error}
        </div>
      )}
      {isBuffering && (
        <div className="fixed bottom-4 left-0 right-0 text-sm text-muted-foreground text-center">
          Buffering...
        </div>
      )}

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

