'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { RadioTower, Play, Users, Signal, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ImageLoader } from '@/components/shared/image-loader'
import { radioStations } from '@/data/audio'
import { cn } from '@/lib/utils'

export function FeaturedStations() {
  const router = useRouter()
  const featuredStations = radioStations.filter(station => station.featured)

  const handleStationClick = (stationId: string) => {
    router.push(`/player?station=${stationId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Featured Stations</h2>
          <p className="text-muted-foreground">
            Hand-picked stations with exceptional content and quality
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredStations.map((station, index) => (
          <motion.div
            key={station.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
              {/* Background Image with Gradient */}
              <div className="absolute inset-0 -z-10">
                <ImageLoader
                  src={station.image || ''}
                  alt={station.name}
                  width={400}
                  height={225}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/50" />
              </div>

              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                    <Signal className="w-3 h-3 mr-1 text-primary animate-pulse" />
                    Live
                  </Badge>
                  <Star className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="line-clamp-1">{station.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {station.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {station.listeners && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {station.listeners}k
                      </div>
                    )}
                    {station.country && (
                      <div className="text-sm text-muted-foreground">
                        {station.country}
                      </div>
                    )}
                  </div>
                  <Button size="icon" variant="ghost" className="shrink-0">
                    <Play className="w-4 h-4" />
                  </Button>
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