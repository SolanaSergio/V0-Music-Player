'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAudio } from '@/hooks/use-audio'
import { MusicWave } from '@/components/shared/music-wave'
import { AudioVisualizer } from '@/components/shared/audio-visualizer'
import { ImageLoader } from '@/components/shared/image-loader'
import { cn } from '@/lib/utils'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  ChevronDown,
  Repeat,
  ListMusic,
  Heart
} from 'lucide-react'

export function MobilePlayerView() {
  const audio = useAudio()
  const [showFullPlayer, setShowFullPlayer] = useState(false)
  const [localVolume, setLocalVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  // Handle volume changes
  useEffect(() => {
    audio.setVolume(isMuted ? 0 : localVolume)
  }, [localVolume, isMuted, audio])

  if (!audio.currentTrack) return null

  return (
    <>
      {/* Mini Player */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-[4.5rem] left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t"
      >
        <Sheet open={showFullPlayer} onOpenChange={setShowFullPlayer}>
          <SheetTrigger asChild>
            <motion.div 
              className="flex items-center p-3 space-x-3 touch-none active:bg-accent/50 transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted">
                <ImageLoader
                  src={audio.currentTrack.image}
                  alt={audio.currentTrack.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{audio.currentTrack.title}</p>
                <p className="text-sm text-muted-foreground truncate">{audio.currentTrack.artist}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  audio.togglePlay()
                }}
              >
                <AnimatePresence mode="wait">
                  {audio.isPlaying ? (
                    <motion.div
                      key="pause"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Pause className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="play"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Play className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </SheetTrigger>

          {/* Full Screen Player */}
          <SheetContent 
            side="bottom" 
            className="h-[calc(100vh-4.5rem)] p-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          >
            <ScrollArea className="h-full">
              <div className="flex flex-col h-full p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setShowFullPlayer(false)}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-10 w-10"
                  >
                    <ListMusic className="h-5 w-5" />
                  </Button>
                </div>

                {/* Album Art with Visualizer */}
                <motion.div 
                  className="aspect-square relative rounded-2xl overflow-hidden mx-auto max-w-[300px] shadow-xl"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                >
                  <ImageLoader
                    src={audio.currentTrack.image}
                    alt={audio.currentTrack.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  {audio.analyser && (
                    <AudioVisualizer 
                      analyser={audio.analyser}
                      visualizerMode="wave"
                      colorScheme="default"
                      className="absolute inset-0"
                    />
                  )}
                </motion.div>

                {/* Track Info */}
                <div className="text-center space-y-2">
                  <motion.h2 
                    className="text-2xl font-semibold"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    {audio.currentTrack.title}
                  </motion.h2>
                  <motion.p 
                    className="text-base text-muted-foreground"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {audio.currentTrack.artist}
                  </motion.p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <Slider 
                    value={[audio.currentTime]}
                    max={audio.duration}
                    step={1}
                    className="cursor-pointer touch-none"
                    onValueChange={([value]) => audio.seekTo(value)}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatTime(audio.currentTime)}</span>
                    <span>{formatTime(audio.duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between px-6">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={cn(
                      "h-12 w-12 rounded-full transition-all",
                      isLiked && "text-primary"
                    )}
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
                  </Button>
                  <div className="flex items-center space-x-4">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-12 w-12 rounded-full"
                      onClick={audio.previousTrack}
                    >
                      <SkipBack className="h-5 w-5" />
                    </Button>
                    <Button 
                      size="lg" 
                      className="rounded-full h-16 w-16 bg-primary hover:bg-primary/90"
                      onClick={audio.togglePlay}
                    >
                      <AnimatePresence mode="wait">
                        {audio.isPlaying ? (
                          <motion.div
                            key="pause"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Pause className="h-7 w-7" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="play"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Play className="h-7 w-7 translate-x-0.5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-12 w-12 rounded-full"
                      onClick={audio.nextTrack}
                    >
                      <SkipForward className="h-5 w-5" />
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-12 w-12 rounded-full"
                  >
                    <Repeat className="h-5 w-5" />
                  </Button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center space-x-2 px-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted || localVolume === 0 ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>
                  <Slider
                    className="flex-1 cursor-pointer touch-none"
                    value={[isMuted ? 0 : localVolume * 100]}
                    max={100}
                    step={1}
                    onValueChange={([value]) => setLocalVolume(value / 100)}
                  />
                </div>

                {/* Visualizer */}
                <div className="h-16">
                  <MusicWave />
                </div>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </motion.div>
    </>
  )
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
} 