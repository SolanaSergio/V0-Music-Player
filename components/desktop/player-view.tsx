'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, 
  Share2, 
  ListMusic, 
  Mic2, 
  Maximize2, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Shuffle, 
  Minimize2, 
  ChevronDown,
  Signal,
  Gauge,
  Globe2
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AudioVisualizer } from '@/components/shared/audio-visualizer'
import { VolumeEqualizer } from '@/components/desktop/volume-equalizer'
import { QueueManager } from '@/components/desktop/queue-manager'
import { ShareModal } from '@/components/desktop/share-modal'
import { LyricsDisplay } from '@/components/desktop/lyrics-display'
import { VolumeSlider } from '@/components/desktop/volume-slider'
import { useAudioContext } from '@/components/shared/audio-provider'
import { cn } from "@/lib/utils"
import { featuredTracks } from '@/data/audio'
import { radioStations } from '@/data/audio'
import { visualizerModes, colorSchemes } from '@/config/visualizer'
import type { VisualizerMode, ColorScheme, Track, RadioStation } from '@/types/audio'
import { useRadioStream } from '@/hooks/use-radio-stream'

export function PlayerView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const trackId = searchParams.get('track')
  const stationId = searchParams.get('station')
  const { setMasterVolume } = useAudioContext()

  // Find the requested track/station
  const station = stationId ? radioStations.find((s: RadioStation) => s.id === stationId) : null
  const track = trackId ? featuredTracks.find((t: Track) => t.id === trackId) : null
  
  const initialTrack: Track = station 
    ? {
        id: station.id,
        title: station.name,
        artist: 'Live Radio',
        album: station.description || '',
        duration: 0,
        artwork: station.image,
        streamUrl: `/api/stream/${station.id}`,
        isLive: true
      }
    : track || featuredTracks[0]

  const { 
    isConnected, 
    isBuffering, 
    error, 
    connectToStream, 
    disconnect,
    setVolume: setStreamVolume,
    analyser,
    currentMetadata,
    isRecognizing 
  } = useRadioStream()

  const [currentTrack, setCurrentTrack] = useState<Track>(initialTrack)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isShuffle, setIsShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none')
  const [queue, setQueue] = useState(featuredTracks)
  const [currentVisualizer, setCurrentVisualizer] = useState(visualizerModes[0])
  const [currentColorScheme, setCurrentColorScheme] = useState(colorSchemes[0])
  const [sensitivity, setSensitivity] = useState(1.5)

  // Handle volume changes
  useEffect(() => {
    if (!setMasterVolume) return
    
    const safeVolume = Math.max(0, Math.min(1, volume))
    setMasterVolume(safeVolume)
    if (setStreamVolume) {
      setStreamVolume(safeVolume)
    }
  }, [volume, setMasterVolume, setStreamVolume])

  // Handle fullscreen keyboard shortcuts
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
    if (station) {
      const newTrack: Track = {
        id: station.id,
        title: station.name,
        artist: 'Live Radio',
        album: station.description || '',
        duration: 0,
        artwork: station.image,
        streamUrl: `/api/stream/${station.id}`,
        isLive: true
      }
      setCurrentTrack(newTrack)
    } else if (track) {
      setCurrentTrack(track)
    }
  }, [station, track])

  // Handle station switching
  const handleStationChange = useCallback(async (newStation: RadioStation) => {
    if (!newStation) return

    try {
      // Disconnect from current stream if connected
      if (isConnected) {
        disconnect()
      }

      // Update URL
      const params = new URLSearchParams(searchParams.toString())
      params.set('station', newStation.id)
      router.replace(`/player?${params.toString()}`)

      // Connect to new stream
      await connectToStream(`/api/stream/${newStation.id}`)
      setIsPlaying(true)
    } catch (error) {
      console.error('Failed to change station:', error)
    }
  }, [isConnected, disconnect, searchParams, router, connectToStream])

  // Get next/previous stations
  const getNextStation = useCallback((currentStationId: string) => {
    const currentIndex = radioStations.findIndex(s => s.id === currentStationId)
    return radioStations[(currentIndex + 1) % radioStations.length]
  }, [])

  const getPreviousStation = useCallback((currentStationId: string) => {
    const currentIndex = radioStations.findIndex(s => s.id === currentStationId)
    return radioStations[(currentIndex - 1 + radioStations.length) % radioStations.length]
  }, [])

  // Handle play/pause
  const handlePlayPause = useCallback(async () => {
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
      setIsPlaying(prev => !prev)
    }
  }, [station, isConnected, disconnect, connectToStream])

  // Format bitrate display
  const formatBitrate = (bitrate?: number) => {
    if (!bitrate) return 'Unknown'
    return `${bitrate} kbps`
  }

  // Get quality level
  const getQualityInfo = (bitrate?: number) => {
    if (!bitrate) return { level: 'unknown', color: 'text-muted-foreground' }
    if (bitrate >= 256) return { level: 'High', color: 'text-green-500' }
    if (bitrate >= 128) return { level: 'Medium', color: 'text-yellow-500' }
    return { level: 'Low', color: 'text-red-500' }
  }

  const qualityInfo = getQualityInfo(station?.bitrate)

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
      <div className="container max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col py-6">
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
              <h1 className="text-2xl font-bold">{currentTrack.title}</h1>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground">
                  {currentTrack.isLive ? 'Live Radio' : currentTrack.artist}
                </p>
                {station && (
                  <div className="flex items-center gap-2">
                    {station.isLive && (
                      <Badge variant="outline" className="bg-background/50 backdrop-blur-sm animate-pulse">
                        <Signal className="w-3 h-3 mr-1 text-primary" />
                        Live
                      </Badge>
                    )}
                    {station.bitrate && (
                      <Badge variant="outline" className={cn("bg-background/50 backdrop-blur-sm", qualityInfo.color)}>
                        <Gauge className="w-3 h-3 mr-1" />
                        {formatBitrate(station.bitrate)}
                      </Badge>
                    )}
                    {station.country && (
                      <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                        <Globe2 className="w-3 h-3 mr-1" />
                        {station.country}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <VolumeSlider 
              value={volume * 100} 
              onChange={(value: number) => setVolume(value / 100)} 
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hover:bg-primary/20"
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Player Section */}
        <div className="flex-1 flex flex-col items-center justify-start gap-3 max-w-5xl mx-auto w-full">
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
                  {visualizerModes.map((visualizer: VisualizerMode) => (
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
                  {colorSchemes.map((scheme: ColorScheme) => (
                    <SelectItem key={scheme.id} value={scheme.id}>
                      <div className="flex items-center gap-2">
                        <div className="flex h-4 items-center gap-px">
                          {scheme.colors.map((color: string, i: number) => (
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
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            className="w-full max-w-3xl space-y-6 mt-3.5"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {/* Main Controls */}
            <div className="flex items-center justify-center gap-6">
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
                onClick={() => {
                  if (stationId) {
                    const prevStation = getPreviousStation(stationId)
                    handleStationChange(prevStation)
                  }
                }}
                disabled={!stationId}
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                className={cn(
                  "h-16 w-16 rounded-full transition-all duration-300 hover:scale-110",
                  isPlaying ? "bg-primary hover:bg-primary/90" : "bg-primary hover:bg-primary/90"
                )}
                onClick={handlePlayPause}
                disabled={isBuffering}
              >
                <AnimatePresence mode="wait">
                  {(station ? isConnected : isPlaying) ? (
                    <motion.div
                      key="pause"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="flex items-center justify-center"
                    >
                      <Pause className="h-8 w-8" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="play"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="flex items-center justify-center"
                    >
                      <Play className="h-8 w-8 translate-x-0.5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full transition-all duration-300 hover:scale-110"
                onClick={() => {
                  if (stationId) {
                    const nextStation = getNextStation(stationId)
                    handleStationChange(nextStation)
                  }
                }}
                disabled={!stationId}
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
            <div className="flex items-center justify-center gap-4">
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
              <QueueManager
                currentTrack={currentTrack}
                queue={queue}
                onRemoveTrack={(index: number) => {
                  const newQueue = [...queue]
                  newQueue.splice(index, 1)
                  setQueue(newQueue)
                }}
                onReorderTrack={(from: number, to: number) => {
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
            className="fixed inset-x-0 bottom-0 h-72 bg-background/95 backdrop-blur-sm border-t border-border/20 z-50"
          >
            <div className="container max-w-7xl mx-auto relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-2"
                onClick={() => setShowLyrics(false)}
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
              <LyricsDisplay
                metadata={currentMetadata ? {
                  id: currentMetadata.station?.id || 'live',
                  title: currentMetadata.title,
                  artist: currentMetadata.artist,
                  duration: 0,
                  streamUrl: '',
                  lyrics: currentMetadata.lyrics
                } : null}
                isRecognizing={isRecognizing}
                className="mt-4 pr-12"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error and Loading States */}
      {error && (
        <div className="fixed bottom-4 left-0 right-0 text-sm text-destructive text-center">
          {error.message}
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
        @keyframes radioWave {
          0% {
            transform: scaleY(0.2);
          }
          100% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  )
}