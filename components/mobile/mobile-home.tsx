'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ImageLoader } from '@/components/shared/image-loader'
import { PlayIcon, PauseIcon, Radio, Mic2, Globe2, Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

interface RadioStationProps {
  title: string
  genre: string
  listeners: string
  imageUrl?: string
  isLive?: boolean
  isPlaying?: boolean
  onPlay?: () => void
}

function RadioStationCard({ title, genre, listeners, imageUrl, isLive, isPlaying, onPlay }: RadioStationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group touch-none"
    >
      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-card hover:bg-accent/50 active:bg-accent transition-colors">
        <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
          <ImageLoader
            src={imageUrl || `/radio-stations/${title.toLowerCase().replace(/\s+/g, '-')}.jpg`}
            alt={title}
            fill
            className="object-cover"
            fallback={`/radio-stations/default-radio.jpg`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-medium truncate">{title}</h3>
            {isLive && (
              <Badge variant="secondary" className="shrink-0 text-[10px] sm:text-xs px-1 py-0 sm:px-2 sm:py-0.5">LIVE</Badge>
            )}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
            <span>{genre}</span>
            <span>•</span>
            <span>{listeners} listeners</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 sm:h-10 sm:w-10 shrink-0"
          onClick={onPlay}
        >
          {isPlaying ? (
            <PauseIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <PlayIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </Button>
      </div>
    </motion.div>
  )
}

interface CategoryCardProps {
  title: string
  icon: React.ElementType
  stationCount: number
  imageUrl: string
  onClick?: () => void
}

function CategoryCard({ title, icon: Icon, stationCount, imageUrl, onClick }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-[140px] sm:w-[160px] shrink-0 touch-none"
    >
      <div className="group">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          <ImageLoader
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            fallback={`/radio-categories/${title.toLowerCase().replace(/\s+/g, '-')}.jpg`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0" />
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
            <div className="flex items-center gap-1.5 sm:gap-2 text-white">
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-sm sm:text-base font-medium">{title}</span>
            </div>
            <div className="text-xs sm:text-sm text-white/80">
              {stationCount} stations
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function LoadingStationCard() {
  return (
    <div className="flex items-center gap-2 p-3">
      <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

function LoadingCategoryCard() {
  return (
    <div className="w-[140px] sm:w-[160px] shrink-0">
      <Skeleton className="aspect-square rounded-lg" />
    </div>
  )
}

function GreetingCard() {
  const [greeting, setGreeting] = useState('')
  const [icon, setIcon] = useState<React.ElementType>(Sun)
  const [bgImage, setBgImage] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      setGreeting('Good Morning')
      setIcon(Sun)
      setBgImage('https://images.unsplash.com/photo-1470252649378-9c29740c9fa8')
    } else if (hour >= 12 && hour < 18) {
      setGreeting('Good Afternoon')
      setIcon(Sun)
      setBgImage('https://images.unsplash.com/photo-1470252649378-9c29740c9fa8')
    } else {
      setGreeting('Good Evening')
      setIcon(Moon)
      setBgImage('https://images.unsplash.com/photo-1493540447904-49763eecb26f')
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative h-28 sm:h-36 rounded-lg overflow-hidden w-full"
    >
      <ImageLoader
        src={bgImage}
        alt={greeting}
        fill
        className="object-cover"
        fallback="https://images.unsplash.com/photo-1470252649378-9c29740c9fa8"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2 text-white">
          {React.createElement(icon, { className: "h-3.5 w-3.5 sm:h-4 sm:w-4" })}
          <span className="text-xs sm:text-sm font-medium">Now Playing</span>
        </div>
        <div>
          <h1 className="text-base sm:text-xl font-semibold text-white mb-1 sm:mb-2">{greeting}</h1>
          <p className="text-xs sm:text-sm text-white/80 line-clamp-1">Discover stations perfect for your mood</p>
        </div>
      </div>
    </motion.div>
  )
}

export function MobileHome() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentStationId, setCurrentStationId] = useState<string | null>(null)

  // Featured radio stations with updated high-quality images
  const featuredStations = [
    { 
      id: '1', 
      title: "Classical Radio Berlin", 
      genre: "Classical",
      listeners: "1.2k",
      isLive: true,
      imageUrl: "https://images.unsplash.com/photo-1507838153414-b4b713384a76" // Symphony orchestra
    },
    { 
      id: '2', 
      title: "Jazz FM London", 
      genre: "Jazz",
      listeners: "3.4k",
      isLive: true,
      imageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629" // Jazz performer
    },
    { 
      id: '3', 
      title: "Electronic Beats FM", 
      genre: "Electronic",
      listeners: "5.1k",
      isLive: true,
      imageUrl: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1" // Electronic music setup
    }
  ]

  // Popular radio stations
  const popularStations: Array<{
    id: string
    title: string
    genre: string
    listeners: string
    isLive: boolean
    imageUrl: string
  }> = [
    { 
      id: '4', 
      title: "Deep House Radio", 
      genre: "Electronic",
      listeners: "4.3k",
      isLive: true,
      imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04"
    },
    { 
      id: '5', 
      title: "World Music Channel", 
      genre: "World",
      listeners: "1.5k",
      isLive: true,
      imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7"
    },
    { 
      id: '6', 
      title: "News Radio 24/7", 
      genre: "News",
      listeners: "8.2k",
      isLive: true,
      imageUrl: "https://images.unsplash.com/photo-1495020689067-958852a7765e"
    }
  ]

  const categories = [
    { 
      id: '1', 
      title: "Classical",
      icon: Radio,
      stationCount: 24,
      imageUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0"
    },
    { 
      id: '2', 
      title: "Jazz & Blues",
      icon: Radio,
      stationCount: 18,
      imageUrl: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f"
    },
    { 
      id: '3', 
      title: "Electronic",
      icon: Radio,
      stationCount: 32,
      imageUrl: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c"
    },
    { 
      id: '4', 
      title: "News & Talk",
      icon: Mic2,
      stationCount: 45,
      imageUrl: "https://images.unsplash.com/photo-1495020689067-958852a7765e"
    },
    { 
      id: '5', 
      title: "International",
      icon: Globe2,
      stationCount: 74,
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa"
    }
  ]

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full pb-20">
      {/* Greeting Card with container padding */}
      <div className="w-full px-4">
        <div className="w-full">
          <GreetingCard />
        </div>
      </div>

      {/* Featured Stations */}
      <div className="mt-3">
        <section>
          <h2 className="text-base font-semibold mb-2 px-4">Featured Stations</h2>
          <div className="space-y-1.5 px-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => <LoadingStationCard key={i} />)
            ) : (
              featuredStations.map(station => (
                <RadioStationCard 
                  key={station.id}
                  {...station}
                  isPlaying={currentStationId === station.id}
                  onPlay={() => setCurrentStationId(currentStationId === station.id ? null : station.id)}
                />
              ))
            )}
          </div>
        </section>
      </div>

      {/* Browse by Category */}
      <section className="mt-3 space-y-2">
        <h2 className="text-base font-semibold px-4">Browse by Category</h2>
        <ScrollArea>
          <div className="flex pb-2 px-4">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="mr-3 last:mr-0">
                  <LoadingCategoryCard />
                </div>
              ))
            ) : (
              categories.map(category => (
                <div key={category.id} className="mr-3 last:mr-0">
                  <CategoryCard {...category} />
                </div>
              ))
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      {/* Popular Now */}
      <section className="mt-3">
        <h2 className="text-base font-semibold mb-2 px-4">Popular Now</h2>
        <div className="space-y-1.5 px-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <LoadingStationCard key={i} />)
          ) : (
            popularStations.map(station => (
              <RadioStationCard 
                key={station.id}
                {...station}
                isPlaying={currentStationId === station.id}
                onPlay={() => setCurrentStationId(currentStationId === station.id ? null : station.id)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  )
} 