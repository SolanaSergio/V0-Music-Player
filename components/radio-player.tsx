'use client'

import { useEffect, useState } from 'react'
import { useAudioContext } from '@/components/audio-provider'
import { useRadioStream } from '@/hooks/use-radio-stream'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { RadioStation } from '@/data/radio-stations'
import { cn } from '@/lib/utils'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface RadioPlayerProps {
  station: RadioStation
  className?: string
}

export function RadioPlayer({ station, className }: RadioPlayerProps) {
  const { resumeContext } = useAudioContext()
  const [volume, setVolume] = useState(0.75)
  const [isMuted, setIsMuted] = useState(false)

  const {
    isConnected,
    isBuffering,
    error,
    connectToStream,
    disconnect,
    setVolume: setStreamVolume
  } = useRadioStream()

  useEffect(() => {
    setStreamVolume(isMuted ? 0 : volume)
  }, [volume, isMuted, setStreamVolume])

  const togglePlayback = async () => {
    try {
      if (isConnected) {
        disconnect()
      } else {
        await resumeContext()
        await connectToStream(station.streamUrl)
      }
    } catch (err) {
      console.error('Playback toggle failed:', err)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlayback}
        disabled={isBuffering}
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

      {isBuffering && (
        <div className="text-sm text-muted-foreground">Buffering...</div>
      )}

      {error && (
        <div className="text-sm text-destructive">
          {error || 'Failed to connect to stream'}
        </div>
      )}
    </div>
  )
}

