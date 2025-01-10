'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useRadioStream } from '@/hooks/use-radio-stream'
import { cn } from "@/lib/utils"
import type { RadioStation } from '@/types/audio'

interface RadioPlayerProps {
  station: RadioStation
  className?: string
}

export function RadioPlayer({ station, className }: RadioPlayerProps) {
  const [volume, setVolume] = useState(1)
  const { streamState, connect, disconnect } = useRadioStream() // Remove station from initial hook call

  useEffect(() => {
    if (streamState.isConnected && station) {
      connect(station.streamUrl)
    }
  }, [station, streamState.isConnected, connect])

  const togglePlayback = () => {
    if (streamState.isConnected) {
      disconnect()
    } else {
      connect(station.streamUrl)
    }
  }

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <Button
        size="icon"
        variant={streamState.isConnected ? "default" : "outline"}
        onClick={togglePlayback}
        disabled={streamState.isBuffering}
        className={cn(
          "relative h-12 w-12 rounded-full transition-all duration-300",
          "hover:scale-105 active:scale-95",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          streamState.isConnected && "bg-primary hover:bg-primary/90"
        )}
      >
        {streamState.isBuffering ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-primary border-r-transparent" />
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : streamState.isConnected ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5" />
        )}
        {streamState.isConnected && (
          <span className="absolute top-0 right-0 h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary"></span>
          </span>
        )}
      </Button>

      <div className="group flex items-center gap-2 min-w-[140px] relative">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 transition-colors",
            "hover:bg-primary/10 hover:text-primary"
          )}
          onClick={() => setVolume(volume === 0 ? 1 : 0)}
        >
          {volume === 0 ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        <div className="relative w-24">
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            className="transition-opacity"
            onValueChange={([value]) => setVolume(value / 100)}
          />
        </div>
      </div>

      {streamState.error && (
        <p className="text-sm text-destructive">{streamState.error}</p>
      )}
    </div>
  )
}

