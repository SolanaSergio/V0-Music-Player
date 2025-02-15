'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useRadioStream } from '@/hooks/use-radio-stream'
import { useAudioContext } from '@/components/shared/audio-provider'
import { MusicWave } from '@/components/shared/music-wave'
import { AudioVisualizer } from '@/components/shared/audio-visualizer'
import { ImageLoader } from '@/components/shared/image-loader'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  ChevronDown,
  Loader2,
  Waves,
  FileText
} from 'lucide-react'
import { radioStations } from '@/data/audio'
import type { RadioStation } from '@/types/audio'

export function MobilePlayerView() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const stationId = searchParams.get('station')
  const station = stationId ? radioStations.find((s: RadioStation) => s.id === stationId) : null
  const { isInitialized, resumeContext, setMasterVolume } = useAudioContext()
  
  const { 
    isConnected, 
    isBuffering, 
    error, 
    connectToStream, 
    disconnect,
    analyser
  } = useRadioStream()

  const [localVolume, setLocalVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [initializationError, setInitializationError] = useState<string | null>(null)
  const initAttemptRef = useRef(0)
  const maxInitAttempts = 3
  const hasInteractedRef = useRef(false)

  // Add connection status toast
  useEffect(() => {
    if (error) {
      // Show error toast (implement your toast system)
      console.error('Stream error:', error)
    }
  }, [error])

  // Initialize audio context and connect to stream
  useEffect(() => {
    let mounted = true
    let initTimeout: NodeJS.Timeout

    const initAudio = async () => {
      try {
        if (!mounted) return
        
        // First, ensure audio context is ready
        await resumeContext()
        if (!mounted) return

        // Check if context is initialized
        if (!isInitialized) {
          if (initAttemptRef.current < maxInitAttempts) {
            initAttemptRef.current++
            // Retry after a delay
            initTimeout = setTimeout(() => {
              void initAudio()
            }, 1000)
            return
          }
          setInitializationError('Failed to initialize audio after multiple attempts')
          setIsLoading(false)
          return
        }

        // Reset error state and loading
        setInitializationError(null)
        setIsLoading(false)

        // Only attempt connection if we have a station and user has interacted
        if (station && !isConnected && !isBuffering && hasInteractedRef.current) {
          try {
            await connectToStream(`/api/stream/${station.id}`)
          } catch (err) {
            if (!mounted) return
            console.error('Failed to connect to stream:', err)
            setInitializationError(err instanceof Error ? err.message : 'Failed to connect to stream')
          }
        }
      } catch (err) {
        if (!mounted) return
        console.error('Failed to initialize audio:', err)
        setInitializationError(err instanceof Error ? err.message : 'Failed to initialize audio')
        setIsLoading(false)
      }
    }

    void initAudio()
    
    return () => {
      mounted = false
      if (initTimeout) {
        clearTimeout(initTimeout)
      }
      if (isConnected) {
        disconnect()
      }
    }
  }, [station, resumeContext, connectToStream, disconnect, isConnected, isBuffering, isInitialized])

  // Handle volume changes
  useEffect(() => {
    const volume = isMuted ? 0 : localVolume
    setMasterVolume(volume)
  }, [localVolume, isMuted, setMasterVolume])

  // Handle back button
  const handleBack = useCallback(() => {
    if (isConnected) {
      disconnect()
    }
    router.back()
  }, [disconnect, router, isConnected])

  // Enhanced play button handler with better error recovery and debouncing
  const handlePlayClick = useCallback(async () => {
    try {
      hasInteractedRef.current = true

      if (isConnected) {
        setIsLoading(true)
        // Ensure immediate disconnect and state update
        await disconnect()
        setIsLoading(false)
        return
      }

      if (station && !isConnected && !isBuffering) {
        setIsLoading(true)
        // Ensure audio context is ready
        await resumeContext()
        
        if (!isInitialized) {
          throw new Error('Audio context not initialized')
        }
        
        // Add a small delay to ensure previous connection is fully cleaned up
        await new Promise(resolve => setTimeout(resolve, 100))
        await connectToStream(`/api/stream/${station.id}`)
      }
    } catch (err) {
      console.error('Playback error:', err)
      setInitializationError(err instanceof Error ? err.message : 'Failed to handle playback')
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, isBuffering, station, disconnect, resumeContext, connectToStream, isInitialized])

  // Cleanup on unmount or station change
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect()
      }
    }
  }, [isConnected, disconnect, station?.id]) // Added station?.id dependency

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        void handlePlayClick()
      } else if (event.code === 'KeyM') {
        event.preventDefault()
        setIsMuted(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handlePlayClick])

  // Add volume persistence
  useEffect(() => {
    const savedVolume = localStorage.getItem('playerVolume')
    if (savedVolume) {
      setLocalVolume(Number(savedVolume))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('playerVolume', localVolume.toString())
  }, [localVolume])

  if (!station) {
    return (
      <div className="flex items-center justify-center h-[100dvh]">
        <p className="text-muted-foreground">No station selected</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Initializing player...</p>
      </div>
    )
  }

  if (initializationError) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] gap-4 px-4 text-center">
        <p className="text-sm text-destructive">{initializationError}</p>
        <Button 
          variant="outline" 
          onClick={() => {
            setInitializationError(null)
            setIsLoading(true)
            initAttemptRef.current = 0
            void resumeContext()
          }}
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col h-[100dvh] bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6">
        {/* Back Button and Station Info */}
        <div className="pt-4 pb-2 flex items-start">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 -ml-2"
            onClick={handleBack}
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
          <div className="flex-1 text-center px-4">
            <h1 className="text-3xl font-bold tracking-tight mb-1">{station.name}</h1>
            <p className="text-sm text-muted-foreground">{station.description}</p>
          </div>
          <div className="w-9" /> {/* Spacer for alignment */}
        </div>

        {/* Background Image with Gradient */}
        <div className="fixed inset-0 -z-10">
          <ImageLoader
            src={station.image}
            alt={station.name}
            fill
            className="object-cover opacity-5"
            fallback="/radio-stations/default-radio.jpg"
            sizes="100vw"
            quality={60}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
        </div>

        {/* Visualizer */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full h-full min-h-[300px] max-h-[450px] relative rounded-3xl overflow-hidden border bg-background/20">
            {analyser && isConnected ? (
              <AudioVisualizer
                analyser={analyser}
                visualizerMode="bars"
                colorScheme="default"
                className="absolute inset-0 w-full h-full"
                sensitivity={1.5}
                quality="high"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                {isBuffering ? (
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
                    </div>
                  </div>
                ) : (
                  <MusicWave className="w-32 h-32 text-muted-foreground/30" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Controls Section */}
        <div className="pb-20 space-y-4">
          {/* Volume Slider */}
          <div className="px-1">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="h-8 w-8"
              >
                {isMuted || localVolume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <div className="relative flex-1">
                <Slider
                  value={[isMuted ? 0 : localVolume * 100]}
                  min={0}
                  max={100}
                  step={1}
                  className="relative z-10"
                  onValueChange={([value]) => setLocalVolume(value / 100)}
                />
              </div>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-between px-8">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 hover:scale-110 transition-transform"
            >
              <Waves className="h-6 w-6" />
            </Button>

            <Button
              variant="default"
              size="lg"
              onClick={handlePlayClick}
              disabled={isBuffering || !isInitialized}
              className="h-14 w-14 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform bg-primary"
            >
              {isBuffering ? (
                <Loader2 className="h-7 w-7 animate-spin" />
              ) : isConnected ? (
                <Pause className="h-7 w-7 text-primary-foreground" />
              ) : (
                <Play className="h-7 w-7 text-primary-foreground translate-x-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 hover:scale-110 transition-transform"
            >
              <FileText className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-28 left-6 right-6 z-50">
          <div className="bg-destructive/10 border border-destructive rounded-xl p-4 animate-in slide-in-from-bottom-5 duration-300">
            <p className="text-sm text-destructive text-center">{error.message}</p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-background/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-4 px-4 text-center animate-in zoom-in duration-300">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Connecting to stream...</p>
          </div>
        </div>
      )}
    </div>
  )
}