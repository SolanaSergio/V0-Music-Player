import Image from "next/image"
import { MoreVertical, Play, Music2, Heart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { MusicWave } from '@/components/shared/music-wave'

const songs = [
  { 
    id: 1, 
    title: "Smile", 
    artist: "Morgan Wallen",
    genre: "Country",
    duration: "3:45",
    plays: "1.2M"
  },
  { 
    id: 2, 
    title: "Drama", 
    artist: "Rex Orange County",
    genre: "Indie Pop",
    duration: "4:12",
    plays: "856K"
  },
  { 
    id: 3, 
    title: "This Time Around", 
    artist: "Miya Folick",
    genre: "Alternative",
    duration: "3:58",
    plays: "542K"
  },
  { 
    id: 4, 
    title: "PIToRRO DE COCO", 
    artist: "Bad Bunny",
    genre: "Reggaeton",
    duration: "3:30",
    plays: "2.1M"
  },
]

export function LatestSongs() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <h2 className="text-2xl font-bold">Latest Songs</h2>
        <Button variant="link">See all</Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {songs.map((song) => (
            <div
              key={song.id}
              className="group flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="relative shrink-0">
                <Image
                  src={`/placeholder.svg?height=48&width=48&text=Song${song.id}`}
                  alt={song.title}
                  width={48}
                  height={48}
                  className="rounded-md object-cover"
                />
                <Button
                  size="icon"
                  className="absolute inset-0 m-auto h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  variant="secondary"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="font-medium leading-none group-hover:text-primary transition-colors">
                      {song.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{song.artist}</p>
                  </div>
                  <MusicWave className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Music2 className="h-3 w-3" />
                    <span>{song.genre}</span>
                  </div>
                  <span>{song.duration}</span>
                  <span>{song.plays} plays</span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                >
                  <Heart className="h-4 w-4" />
                  <span className="sr-only">Like</span>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

