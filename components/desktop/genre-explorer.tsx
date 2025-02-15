'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Disc3, Radio, Music2, Play, ChevronLeft, ChevronRight } from 'lucide-react'
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImageLoader } from '@/components/shared/image-loader'
import { radioStations } from '@/data/audio'
import type { Genre } from '@/types/audio'
import { cn } from '@/lib/utils'

interface GenreExplorerProps {
  genres: Genre[]
  className?: string
}

export function GenreExplorer({ genres, className }: GenreExplorerProps) {
  const router = useRouter()
  const [activeGenre, setActiveGenre] = useState<string | null>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    setScrollPosition(target.scrollLeft)
    setMaxScroll(target.scrollWidth - target.clientWidth)
  }

  const handleGenreClick = (genre: Genre) => {
    const stationsInGenre = radioStations.filter(station => station.genre === genre.id)
    if (stationsInGenre.length > 0) {
      router.push(`/player?station=${stationsInGenre[0].id}`)
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="relative">
        <ScrollArea 
          className="w-full"
          onScroll={handleScroll}
        >
          <div className="flex space-x-4 pb-4">
            {genres.map((genre) => (
              <Card
                key={genre.id}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-300",
                  "hover:bg-background/40",
                  "border-border/50 hover:border-primary/50",
                  "shadow-lg hover:shadow-xl hover:shadow-primary/5",
                  "w-[280px] shrink-0"
                )}
                onClick={() => handleGenreClick(genre)}
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <ImageLoader
                    src={genre.image}
                    alt={genre.name}
                    width={280}
                    height={157}
                    className={cn(
                      "object-cover w-full h-full transition-transform duration-700",
                      "group-hover:scale-105 filter group-hover:brightness-110"
                    )}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
                  
                  {/* Overlay Controls */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className={cn(
                        "h-12 w-12 rounded-full",
                        "bg-primary/90 text-white",
                        "hover:bg-primary hover:scale-105",
                        "transition-all duration-300",
                        "shadow-lg hover:shadow-xl hover:shadow-primary/20"
                      )}
                    >
                      <Play className="h-6 w-6 ml-1" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2 group-hover:text-primary transition-colors">
                      <Music2 className="h-4 w-4" />
                      {genre.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {genre.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "bg-background/50 hover:bg-background/80",
                          "transition-colors duration-300"
                        )}
                      >
                        {radioStations.filter(station => station.genre === genre.id).length} Stations
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Scroll Indicators */}
        {scrollPosition > 0 && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={() => {
                const scrollArea = document.querySelector('[role="region"]') as HTMLDivElement
                if (scrollArea) {
                  scrollArea.scrollBy({ left: -300, behavior: 'smooth' })
                }
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
        {scrollPosition < maxScroll && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={() => {
                const scrollArea = document.querySelector('[role="region"]') as HTMLDivElement
                if (scrollArea) {
                  scrollArea.scrollBy({ left: 300, behavior: 'smooth' })
                }
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

