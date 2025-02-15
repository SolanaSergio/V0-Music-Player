'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { RadioTower, Play, Users, Signal, Globe2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ImageLoader } from '@/components/shared/image-loader'
import { radioStations } from '@/data/audio'
import { cn } from '@/lib/utils'

export function RadioHero() {
  const router = useRouter()
  const featuredStation = radioStations.find(station => station.featured)

  const handleStartListening = () => {
    if (featuredStation) {
      router.push(`/player?station=${featuredStation.id}`)
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 -z-10">
        <ImageLoader
          src={featuredStation?.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1280&h=720&fit=crop&q=90'}
          alt="Radio Hero"
          width={1280}
          height={720}
          className="object-cover w-full h-full"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="container max-w-7xl mx-auto px-4 lg:px-8">
        <div className="relative py-24 lg:py-32">
          {/* Animated Radio Wave Effect */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-30">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-primary rounded-full"
                animate={{
                  height: [20, 40, 20],
                  opacity: [0.2, 1, 0.2],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>

          <div className="max-w-2xl space-y-8">
            {/* Title Section */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                  <Signal className="w-3 h-3 mr-1 text-primary animate-pulse" />
                  Live Radio
                </Badge>
              </motion.div>
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Discover Live Radio <br />
                From Around the World
              </motion.h1>
              <motion.p
                className="text-xl text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Listen to your favorite stations and discover new ones. 
                High-quality streams from every corner of the globe.
              </motion.p>
            </div>

            {/* Stats */}
            <motion.div
              className="flex flex-wrap gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <RadioTower className="w-5 h-5 text-primary" />
                <span className="text-lg font-semibold">{radioStations.length}+ Stations</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-lg font-semibold">
                  {radioStations.reduce((acc, station) => acc + (station.listeners || 0), 0)}k+ Listeners
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-primary" />
                <span className="text-lg font-semibold">
                  {new Set(radioStations.map(station => station.country)).size} Countries
                </span>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button
                size="lg"
                className="h-12 px-8 text-lg"
                onClick={handleStartListening}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Listening
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 