'use client'

import { History, Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ImageLoader } from '@/components/shared/image-loader'
import { MusicWave } from '@/components/shared/music-wave'

const recentTracks = [
  {
    id: 1,
    title: "Last Night",
    artist: "Morgan Wallen",
    timestamp: "2 minutes ago",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&q=80",
  },
  {
    id: 2,
    title: "Flowers",
    artist: "Miley Cyrus",
    timestamp: "15 minutes ago",
    imageUrl: "https://images.unsplash.com/photo-1597075687490-8f673c6c17f6?w=300&h=300&q=80",
  },
  {
    id: 3,
    title: "Anti-Hero",
    artist: "Taylor Swift",
    timestamp: "45 minutes ago",
    imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&h=300&q=80",
  },
  {
    id: 4,
    title: "Rich Flex",
    artist: "Drake & 21 Savage",
    timestamp: "1 hour ago",
    imageUrl: "https://images.unsplash.com/photo-1516981879613-9f5da904015f?w=300&h=300&q=80",
  },
]

export function RecentlyPlayed() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary animate-pulse" />
          Recently Played
        </CardTitle>
        <Button variant="ghost" size="sm" className="hover:bg-primary/20">See all</Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="space-y-1 p-1">
            {recentTracks.map((track) => (
              <div
                key={track.id}
                className="group flex items-center gap-4 rounded-lg p-2 hover:bg-primary/10 transition-all duration-300"
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-md">
                  <ImageLoader
                    src={track.imageUrl}
                    fallback="/placeholder.svg"
                    alt={track.title}
                    width={48}
                    height={48}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Button
                    size="icon"
                    className="absolute inset-0 m-auto h-8 w-8 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 scale-75"
                    variant="secondary"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="truncate">
                      <p className="font-medium truncate group-hover:text-primary transition-colors">
                        {track.title}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artist}
                      </p>
                    </div>
                    <MusicWave className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {track.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

