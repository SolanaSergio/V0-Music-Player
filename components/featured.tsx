'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AudioPlayer } from '@/components/audio-player'
import { ImageLoader } from '@/components/image-loader'
import { MusicWave } from '@/components/music-wave'
import { cn } from '@/lib/utils'
import type { Track } from '@/types/audio'

interface FeaturedProps {
  tracks: Track[]
}

export function Featured({ tracks }: FeaturedProps) {
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null)
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null)

  return (
    <section className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Featured Stations</h2>
        <Button variant="link">See all</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className={cn(
              "group relative aspect-[4/3] overflow-hidden rounded-lg",
              "transition-transform duration-300 hover:scale-[1.02]",
              "before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/60 before:to-transparent before:z-10",
              selectedTrack === index && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
            onMouseEnter={() => setHoveredTrack(index)}
            onMouseLeave={() => setHoveredTrack(null)}
          >
            <ImageLoader
              src={track.imageUrl}
              fallback={track.fallbackImage}
              alt={track.title}
              fill
              className={cn(
                "object-cover transition-transform duration-700",
                (hoveredTrack === index || selectedTrack === index) && "scale-110"
              )}
            />
            <div className="absolute inset-0 z-20 p-4">
              <div className="h-full flex flex-col justify-end">
                {/* Genre-specific gradient overlay */}
                <div className={cn(
                  "absolute inset-0",
                  track.genre === 'electronic' && "bg-gradient-to-t from-blue-900/90 via-blue-800/50 to-transparent",
                  track.genre === 'classical' && "bg-gradient-to-t from-emerald-900/90 via-emerald-800/50 to-transparent",
                  track.genre === 'ambient' && "bg-gradient-to-t from-indigo-900/90 via-indigo-800/50 to-transparent",
                  track.genre === 'jazz' && "bg-gradient-to-t from-amber-900/90 via-amber-800/50 to-transparent"
                )} />

                {/* Content */}
                <div className="relative space-y-2">
                  <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-sm text-white/90">{track.artist}</p>

                  {/* Genre badge */}
                  {track.genre && (
                    <span className={cn(
                      "inline-block px-2 py-1 rounded-full text-xs font-medium",
                      "bg-white/10 backdrop-blur-sm",
                      track.genre === 'electronic' && "text-blue-200",
                      track.genre === 'classical' && "text-emerald-200",
                      track.genre === 'ambient' && "text-indigo-200",
                      track.genre === 'jazz' && "text-amber-200"
                    )}>
                      {track.genre}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <MusicWave 
                playing={selectedTrack === index} 
                className="opacity-0 group-hover:opacity-100 transition-opacity" 
              />
            </div>
            <Button
              size="icon"
              className={cn(
                "absolute right-4 bottom-4 z-20",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                "hover:scale-110 hover:bg-primary hover:text-primary-foreground"
              )}
              onClick={() => {
                window.location.href = `/player?track=${track.id}`
              }}
            >
              {selectedTrack === index ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span className="sr-only">
                {selectedTrack === index ? 'Pause' : 'Play'} {track.title}
              </span>
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}

