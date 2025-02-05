'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Radio, Music2, Play } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ImageLoader } from '@/components/shared/image-loader'
import { Loading } from '@/components/ui/loading'
import { genres, radioStations } from '@/data/audio'
import type { RadioStation } from '@/types/audio'
import { cn } from "@/lib/utils"

interface RadioStationsProps {
  initialGenre?: string
}

export function RadioStations({ initialGenre = 'all' }: RadioStationsProps) {
  const router = useRouter()
  const [activeGenre, setActiveGenre] = useState(initialGenre)
  const [isPending, startTransition] = useTransition()

  const filteredStations = activeGenre === 'all' 
    ? radioStations
    : radioStations.filter(station => station.genre === activeGenre)

  const handleGenreChange = (value: string) => {
    startTransition(() => {
      setActiveGenre(value)
    })
  }

  const handleStationClick = (station: RadioStation) => {
    router.push(`/player?station=${station.id}`)
  }

  return (
    <div className="space-y-8 w-full">
      <Tabs defaultValue={activeGenre} onValueChange={handleGenreChange}>
        <ScrollArea className="w-full [&>div]:!px-0 animate-in fade-in slide-in-from-top-4 duration-700">
          <TabsList aria-label="Radio genres" className="h-10 w-full relative overflow-hidden rounded-lg bg-gradient-to-r from-background/90 via-background/50 to-background/90 backdrop-blur-md border-border/20 border shadow-[0_0_15px_rgba(0,0,0,0.1)] before:absolute before:inset-0 before:pointer-events-none before:bg-gradient-to-r before:from-primary/10 before:via-primary/5 before:to-primary/10 before:animate-pulse before:duration-3000 after:absolute after:inset-0 after:pointer-events-none after:bg-gradient-to-b after:from-white/5 after:to-transparent hover:shadow-[0_0_20px_rgba(0,0,0,0.15)] transition-shadow duration-300">
            <TabsTrigger 
              value="all" 
              className="relative text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all hover:text-primary data-[state=active]:before:absolute data-[state=active]:before:bottom-0 data-[state=active]:before:left-0 data-[state=active]:before:right-0 data-[state=active]:before:h-[2px] data-[state=active]:before:bg-primary"
            >
              <Radio className="mr-2 h-4 w-4 animate-pulse" />
              All Stations
            </TabsTrigger>
            {genres.map(genre => (
              <TabsTrigger 
                key={genre.id} 
                value={genre.id}
                className="relative text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all hover:text-primary data-[state=active]:before:absolute data-[state=active]:before:bottom-0 data-[state=active]:before:left-0 data-[state=active]:before:right-0 data-[state=active]:before:h-[2px] data-[state=active]:before:bg-primary group"
              >
                <Music2 className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                {genre.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar />
        </ScrollArea>

        <TabsContent value={activeGenre} className="mt-6">
          {isPending ? (
            <Loading text="Loading stations..." />
          ) : filteredStations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No stations found for this genre.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStations.map((station) => (
                <Card 
                  key={station.id} 
                  className={cn(
                    "overflow-hidden transition-all duration-500 cursor-pointer",
                    "hover:bg-background/40 group",
                    "border border-border/50 hover:border-primary/50",
                    "shadow-lg hover:shadow-xl hover:shadow-primary/5",
                  )}
                  onClick={() => handleStationClick(station)}
                >
                  <div className="relative">
                    <div className="aspect-video relative overflow-hidden">
                      <ImageLoader
                        src={station.image}
                        alt={station.name}
                        width={640}
                        height={360}
                        className={cn(
                          "object-cover transition-transform duration-700",
                          "group-hover:scale-105 filter group-hover:brightness-110"
                        )}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg group-hover:text-primary transition-colors">
                        {station.name}
                        {station.isLive && (
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "font-normal text-xs transition-colors",
                              "bg-primary/10 text-primary border-primary/20"
                            )}
                          >
                            <span className="mr-1 h-2 w-2 rounded-full bg-primary animate-pulse inline-block" />
                            Live
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-2 text-sm">
                        {station.description}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 overflow-x-auto">
                      {station.tags.map(tag => (
                        <Badge 
                          key={tag} 
                          variant="outline"
                          className="capitalize whitespace-nowrap text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

