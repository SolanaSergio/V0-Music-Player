'use client'

import { useEffect, useState } from 'react'
import { useAudioContext } from '@/components/shared/audio-provider'
import { useRadioStream } from '@/hooks/use-radio-stream'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { AudioVisualizer } from '@/components/shared/audio-visualizer'
import { LyricsDisplay } from '@/components/desktop/lyrics-display'
import type { RadioStation, VisualizerMode, ColorScheme } from '@/types/audio'
import { cn } from '@/lib/utils'
import { Play, Pause, Volume2, VolumeX, Settings2 } from 'lucide-react'
import { visualizerModes, colorSchemes } from '@/config/visualizer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RadioPlayerProps {
  station: RadioStation
  className?: string
}

export function RadioPlayer({ station, className }: RadioPlayerProps) {
  const { resumeContext, isInitialized, setVolume: setMasterVolume } = useAudioContext()
  const [volume, setVolume] = useState(0.75)
  const [isMuted, setIsMuted] = useState(false)
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode['id']>('bars')
  const [colorScheme, setColorScheme] = useState<ColorScheme['id']>('default')
  const [showSettings, setShowSettings] = useState(false)
  const [initializationStatus, setInitializationStatus] = useState<string>('Waiting for audio context...')

  const {
    isConnected,
    isBuffering,
    error: streamError,
    connectToStream,
    disconnect,
    setVolume: setStreamVolume,
    analyser,
    currentMetadata,
    isRecognizing
  } = useRadioStream()

  // Initialize audio context and connect to stream
  useEffect(() => {
    let mounted = true
    const initAudio = async () => {
      try {
        if (!mounted) return
        setInitializationStatus('Initializing audio context...')
        
        // First, ensure audio context is ready
        await resumeContext()
        if (!mounted) return
        
        // Wait a bit to ensure context is fully initialized
        await new Promise(resolve => setTimeout(resolve, 100))
        if (!mounted) return

        if (!isInitialized) {
          setInitializationStatus('Audio context not ready. Please wait...')
          return
        }

        // Only attempt connection if we're not already connected or buffering
        if (!isConnected && !isBuffering) {
          setInitializationStatus('Connecting to stream...')
          await connectToStream(`/api/stream/${station.id}`)
          if (!mounted) return
          setInitializationStatus('Stream connected successfully')
        }
      } catch (err) {
        if (!mounted) return
        console.error('Failed to initialize audio:', err)
        setInitializationStatus(`Initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    void initAudio()
    
    return () => {
      mounted = false
      setInitializationStatus('Cleaning up audio resources...')
      disconnect()
    }
  }, [station.id, resumeContext, connectToStream, disconnect, isConnected, isBuffering, isInitialized])

  // Handle volume changes
  useEffect(() => {
    const effectiveVolume = isMuted ? 0 : volume
    // Ensure volume is within valid range
    const safeVolume = Math.max(0, Math.min(1, effectiveVolume))
    setStreamVolume(safeVolume)
    setMasterVolume(safeVolume)
  }, [volume, isMuted, setStreamVolume, setMasterVolume])

  const togglePlayback = async () => {
    try {
      if (isConnected) {
        setInitializationStatus('Disconnecting from stream...')
        disconnect()
      } else {
        setInitializationStatus('Resuming audio context...')
        await resumeContext()
        
        // Wait a bit to ensure context is fully initialized
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (!isInitialized) {
          throw new Error('Audio context not ready')
        }
        
        setInitializationStatus('Connecting to stream...')
        await connectToStream(`/api/stream/${station.id}`)
      }
    } catch (err) {
      console.error('Playback toggle failed:', err)
      setInitializationStatus(`Playback failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  // Determine what status/error message to show
  const getStatusMessage = () => {
    if (streamError) return `Stream error: ${streamError}`
    if (!isInitialized) return 'Audio context not initialized'
    if (isBuffering) return 'Buffering stream...'
    return initializationStatus
  }

  const statusMessage = getStatusMessage()

  return (
    <div className="space-y-4">
      <div className={cn('flex items-center gap-4', className)}>
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlayback}
          disabled={isBuffering || !isInitialized}
          aria-label={isConnected ? 'Pause' : 'Play'}
        >
          {isConnected ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>

        {/* Track Info */}
        {isConnected && currentMetadata && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{currentMetadata.title}</p>
            <p className="text-xs text-muted-foreground truncate">{currentMetadata.artist}</p>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="h-6 w-6" />
          ) : (
            <Volume2 className="h-6 w-6" />
          )}
        </Button>

        <Slider
          value={[volume * 100]}
          min={0}
          max={100}
          step={1}
          className="w-[120px]"
          onValueChange={([value]) => {
            const newVolume = value / 100
            setVolume(Math.max(0, Math.min(1, newVolume)))
          }}
          aria-label="Volume"
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(!showSettings)}
          aria-label="Visualizer Settings"
        >
          <Settings2 className="h-6 w-6" />
        </Button>

        {isBuffering && (
          <div className="text-sm text-muted-foreground">Buffering...</div>
        )}

        {streamError && (
          <div className="text-sm text-destructive">
            {streamError.message || 'Failed to connect to stream'}
          </div>
        )}
      </div>

      {showSettings && (
        <div className="flex items-center gap-4 p-4 rounded-lg border bg-background/95">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Mode:</span>
            <Select
              value={visualizerMode}
              onValueChange={(value: VisualizerMode['id']) => {
                const mode = visualizerModes.find(m => m.id === value)
                if (mode) {
                  setVisualizerMode(value)
                }
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {visualizerModes.map(mode => (
                  <SelectItem key={mode.id} value={mode.id}>
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Theme:</span>
            <Select
              value={colorScheme}
              onValueChange={(value: ColorScheme['id']) => {
                const scheme = colorSchemes.find(s => s.id === value)
                if (scheme) {
                  setColorScheme(value)
                }
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colorSchemes.map(scheme => (
                  <SelectItem key={scheme.id} value={scheme.id}>
                    {scheme.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {isConnected && analyser && (
        <div className="h-48 w-full rounded-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <AudioVisualizer
            analyser={analyser}
            visualizerMode={visualizerMode}
            colorScheme={colorScheme}
            sensitivity={1.2}
            className="h-full w-full"
          />
        </div>
      )}

      {/* Lyrics Display */}
      {isConnected && (
        <LyricsDisplay
          metadata={currentMetadata ? {
            id: station.id,
            title: currentMetadata.title,
            artist: currentMetadata.artist,
            duration: 0,
            streamUrl: `/api/stream/${station.id}`,
            lyrics: currentMetadata.lyrics
          } : null}
          isRecognizing={isRecognizing}
          className="mt-4"
        />
      )}

      {/* Status message display */}
      {statusMessage && (
        <div className={cn(
          "text-sm p-2 rounded-md",
          {
            'bg-destructive/10 text-destructive': streamError,
            'bg-muted text-muted-foreground': !streamError
          }
        )}>
          {statusMessage}
        </div>
      )}
    </div>
  )
}

