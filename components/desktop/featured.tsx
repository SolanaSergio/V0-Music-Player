'use client'

import { useState } from 'react'
import { Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageLoader } from '@/components/shared/image-loader'
import { MusicWave } from '@/components/shared/music-wave'
import { cn } from '@/lib/utils'
import type { Track } from '@/types/audio'

interface FeaturedProps {
  tracks: Track[]
}

export function Featured({ tracks }: FeaturedProps) {
  const [activeTrack, setActiveTrack] = useState<Track | null>(null)

  return (
    <section className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Featured Stations</h2>
        <Button variant="link">See all</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map((track) => (
          <div
            key={track.id}
            className={cn(
              "group relative overflow-hidden rounded-lg bg-card hover:bg-card/80 transition-colors",
              "border border-border/50 hover:border-border/80",
              "cursor-pointer"
            )}
            onClick={() => setActiveTrack(activeTrack?.id === track.id ? null : track)}
          >
            <div className="aspect-square">
              <ImageLoader
                src={track.artwork || '/images/default-album.jpg'}
                alt={track.title}
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 z-20 p-4">
              <div className="h-full flex flex-col justify-end">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                <div className="relative z-10 space-y-1">
                  <h3 className="text-lg font-semibold text-white line-clamp-1">
                    {track.title}
                  </h3>
                  <p className="text-sm text-white/80 line-clamp-1">
                    {track.artist}
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute top-4 right-4 z-30">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-full",
                  "bg-black/20 hover:bg-black/40",
                  "text-white hover:text-white",
                  "opacity-0 group-hover:opacity-100 transition-opacity"
                )}
              >
                {activeTrack?.id === track.id ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
            </div>
            {activeTrack?.id === track.id && (
              <MusicWave
                className="absolute bottom-4 right-4 z-30 text-white/80"
                playing
              />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

