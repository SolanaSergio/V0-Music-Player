'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Music2, Users, Signal, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ImageLoader } from '@/components/shared/image-loader'
import type { Genre } from '@/types/audio'
import { radioStations } from '@/data/audio'
import { cn } from '@/lib/utils'

interface StationsByGenreProps {
  genres: Genre[]
}

export function StationsByGenre({ genres }: StationsByGenreProps) {
  const router = useRouter()
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)

  const handleStationClick = (stationId: string) => {
    router.push(`/player?station=${stationId}`)
  }

  const filteredStations = selectedGenre
    ? radioStations.filter(station => station.genre === selectedGenre)
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Browse by Genre</h2>
          <p className="text-muted-foreground">
            Explore stations by your favorite music genres
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Genre List */}
        <Card className="lg:col-span-1 overflow-hidden border-border/50">
          <ScrollArea className="h-[600px]">
            <div className="p-4 space-y-2">
              {genres.map((genre) => (
                <Button
                  key={genre.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left",
                    selectedGenre === genre.id && "bg-primary/10 text-primary"
                  )}
                  onClick={() => setSelectedGenre(genre.id)}
                >
                  <Music2 className="mr-2 h-4 w-4" />
                  {genre.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Stations List */}
        <Card className="lg:col-span-2 overflow-hidden border-border/50">
          <ScrollArea className="h-[600px]">
            <div className="p-4">
              <AnimatePresence mode="wait">
                {selectedGenre ? (
                  <motion.div
                    key={selectedGenre}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Genre Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {genres.find(g => g.id === selectedGenre)?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {filteredStations.length} stations available
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-background/50">
                        <Music2 className="w-3 h-3 mr-1" />
                        {selectedGenre}
                      </Badge>
                    </div>

                    {/* Stations Grid */}
                    <div className="grid gap-4">
                      {filteredStations.map((station, index) => (
                        <motion.div
                          key={station.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Card 
                            className={cn(
                              "group relative overflow-hidden cursor-pointer transition-all duration-300",
                              "hover:bg-accent/50 hover:shadow-lg hover:shadow-primary/5",
                              "border-border/50"
                            )}
                            onClick={() => handleStationClick(station.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                {/* Station Image */}
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                                  <ImageLoader
                                    src={station.image || ''}
                                    alt={station.name}
                                    width={64}
                                    height={64}
                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
                                </div>

                                {/* Station Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                                      <Signal className="w-3 h-3 mr-1 text-primary animate-pulse" />
                                      Live
                                    </Badge>
                                  </div>
                                  <h3 className="text-lg font-semibold mt-1 line-clamp-1">
                                    {station.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {station.description}
                                  </p>
                                </div>

                                {/* Stats & Action */}
                                <div className="flex items-center gap-4">
                                  {station.listeners && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <Users className="w-4 h-4" />
                                      {station.listeners}k
                                    </div>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>

                            {/* Hover Effect */}
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-[500px] text-muted-foreground"
                  >
                    <Music2 className="h-12 w-12 mb-4" />
                    <p className="text-lg font-medium">Select a genre</p>
                    <p className="text-sm">Choose a genre to see available stations</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  )
} 