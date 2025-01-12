'use client'

import { useEffect, useState } from 'react'
import { useAudioContext } from '@/components/audio-provider'
import { useRadioStream } from '@/hooks/use-radio-stream'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { AudioVisualizer } from '@/components/audio-visualizer'
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
  const { resumeContext, isInitialized, error: contextError } = useAudioContext()
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
    analyser
  } = useRadioStream()

  // Initialize audio context and connect to stream
  useEffect(() => {
    const initAudio = async () => {
      try {
        setInitializationStatus('Initializing audio context...')
        await resumeContext()
        
        if (!isInitialized) {
          setInitializationStatus('Audio context not ready. Please wait...')
          return
        }

        if (!isConnected && !isBuffering) {
          setInitializationStatus('Connecting to stream...')
          await connectToStream(`/api/stream/${station.id}`)
          setInitializationStatus('Stream connected successfully')
        }
      } catch (err) {
        console.error('Failed to initialize audio:', err)
        setInitializationStatus(`Initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    initAudio()
    return () => {
      setInitializationStatus('Cleaning up audio resources...')
      disconnect()
    }
  }, [station.id, resumeContext, connectToStream, disconnect, isConnected, isBuffering, isInitialized])

  // Handle volume changes
  useEffect(() => {
    setStreamVolume(isMuted ? 0 : volume)
  }, [volume, isMuted, setStreamVolume])

  const togglePlayback = async () => {
    try {
      if (isConnected) {
        setInitializationStatus('Disconnecting from stream...')
        disconnect()
      } else {
        setInitializationStatus('Resuming audio context...')
        await resumeContext()
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
    if (contextError) return `Audio system error: ${contextError.message}`
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
          onValueChange={([value]) => setVolume(value / 100)}
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
            {streamError || 'Failed to connect to stream'}
          </div>
        )}
      </div>

      {showSettings && (
        <div className="flex items-center gap-4 p-4 rounded-lg border bg-background/95">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Mode:</span>
            <Select
              value={visualizerMode}
              onValueChange={(value: VisualizerMode['id']) => setVisualizerMode(value)}
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
              onValueChange={(value: ColorScheme['id']) => setColorScheme(value)}
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

      {/* Status message display */}
      {statusMessage && (
        <div className={cn(
          "text-sm p-2 rounded-md",
          {
            'bg-destructive/10 text-destructive': contextError || streamError,
            'bg-muted text-muted-foreground': !contextError && !streamError
          }
        )}>
          {statusMessage}
        </div>
      )}
    </div>
  )
}

