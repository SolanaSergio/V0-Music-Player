'use client'

import { useState } from 'react'
import { Music2, Play, Shuffle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageLoader } from '@/components/shared/image-loader'
import { ScrollArea } from "@/components/ui/scroll-area"
import { MusicWave } from '@/components/shared/music-wave'
import type { Track } from '@/types/audio'
import { cn } from '@/lib/utils'

interface TrackRecommendationsProps {
  tracks: Track[]
  onPlay: (track: Track) => void
  className?: string
}

export function TrackRecommendations({ tracks, onPlay, className }: TrackRecommendationsProps) {
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null)

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Recommended for You</CardTitle>
        <Button variant="ghost" size="icon" className="hover:bg-primary/20">
          <Shuffle className="h-4 w-4" />
          <span className="sr-only">Shuffle recommendations</span>
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="group relative flex items-center gap-4 rounded-lg p-2 hover:bg-primary/10 transition-colors"
                onMouseEnter={() => setHoveredTrack(track.id)}
                onMouseLeave={() => setHoveredTrack(null)}
              >
                <div className="relative aspect-square h-12 overflow-hidden rounded-md">
                  <ImageLoader
                    src={track.artwork || '/images/default-album.jpg'}
                    alt={track.title}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                  <Button
                    size="icon"
                    className={cn(
                      "absolute inset-0 m-auto h-8 w-8 transition-all",
                      hoveredTrack === track.id
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-75"
                    )}
                    onClick={() => onPlay(track)}
                  >
                    <Play className="h-4 w-4" />
                    <span className="sr-only">Play {track.title}</span>
                  </Button>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="truncate">
                      <p className="font-medium truncate">{track.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artist}
                      </p>
                    </div>
                    <MusicWave
                      className={cn(
                        "transition-opacity",
                        hoveredTrack === track.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                  {track.album && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Music2 className="h-3 w-3" />
                      <span>{track.album}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

