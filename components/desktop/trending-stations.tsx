'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Signal, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ImageLoader } from '@/components/shared/image-loader'
import { radioStations } from '@/data/audio'
import { cn } from '@/lib/utils'

export function TrendingStations() {
  const router = useRouter()
  const trendingStations = radioStations.filter(station => station.trending)

  const handleStationClick = (stationId: string) => {
    router.push(`/player?station=${stationId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Trending Now</h2>
          <p className="text-muted-foreground">
            Most popular stations with active listeners
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {trendingStations.map((station, index) => (
          <motion.div
            key={station.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
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
                      {station.trending && (
                        <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                          <TrendingUp className="w-3 h-3 mr-1 text-primary" />
                          Trending
                        </Badge>
                      )}
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
    </div>
  )
} 