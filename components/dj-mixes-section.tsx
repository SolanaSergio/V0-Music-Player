import Image from "next/image"
import Link from "next/link"
import { Play, Music2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MusicWave } from '@/components/music-wave'

const mixes = [
  { 
    id: 1, 
    title: "Late Night Vibes", 
    type: "Deep House Mix",
    genre: "Electronic",
    duration: "2:45",
    plays: "12.5K",
    imageUrl: "https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=800&h=800&q=80"
  },
  { 
    id: 2, 
    title: "Underground Beats", 
    type: "Bass Mix",
    genre: "Grime",
    duration: "1:30",
    plays: "8.2K",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdaa7543d5d6?w=800&h=800&q=80"
  },
  { 
    id: 3, 
    title: "Summer Groove", 
    type: "Dance Mix",
    genre: "House",
    duration: "2:15",
    plays: "15.3K",
    imageUrl: "https://images.unsplash.com/photo-1516981879613-9f5da904015f?w=800&h=800&q=80"
  },
  { 
    id: 4, 
    title: "Midnight Drive", 
    type: "Synthwave",
    genre: "Electronic",
    duration: "3:00",
    plays: "20.1K",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=800&q=80"
  }
]

export function DJMixesSection() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold tracking-tight">New Year, New DJ Mixes</h2>
        <Button variant="ghost" className="text-primary hover:text-primary/80">See all</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {mixes.map((mix) => (
          <Link
            key={mix.id}
            href={`/mix/${mix.id}`}
            className="group"
          >
            <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-background/50 via-background/80 to-background/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50">
              <div className="relative aspect-square">
                <Image
                  src={mix.imageUrl}
                  alt={mix.title}
                  width={400}
                  height={400}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                <Button
                  size="icon"
                  className="absolute bottom-4 right-4 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2"
                >
                  <Play className="h-4 w-4" />
                </Button>
                <div className="absolute top-4 right-4">
                  <MusicWave className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div>
                    <h3 className="font-medium leading-none group-hover:text-primary transition-colors line-clamp-1">
                      {mix.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{mix.type}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Music2 className="h-3 w-3" />
                      <span>{mix.genre}</span>
                    </div>
                    <span>{mix.duration}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

