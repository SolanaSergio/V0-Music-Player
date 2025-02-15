import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio, Music2, Mic2, Globe2, Search, TrendingUp, History } from 'lucide-react'
import { genres, radioStations } from '@/data/audio'
import type { RadioStation } from '@/types/audio'
import { Input } from '@/components/ui/input'
import { RadioStationImage } from '@/components/shared/radio-station-image'

export function MobileRadioView() {
  const router = useRouter()
  const [activeGenre, setActiveGenre] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('recentlyPlayed') || '[]')
    } catch {
      return []
    }
  })

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Memoized filtered and sorted stations
  const filteredStations = useMemo(() => {
    let stations = activeGenre === 'all'
      ? radioStations
      : radioStations.filter(station => station.genre.toLowerCase() === activeGenre)

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      stations = stations.filter(station => 
        station.name.toLowerCase().includes(query) ||
        station.genre.toLowerCase().includes(query)
      )
    }

    // Sort by recently played first
    return stations.sort((a, b) => {
      const aIndex = recentlyPlayed.indexOf(a.id)
      const bIndex = recentlyPlayed.indexOf(b.id)
      if (aIndex === -1 && bIndex === -1) return 0
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })
  }, [activeGenre, searchQuery, recentlyPlayed])

  // Group stations by genre (memoized)
  const stationsByGenre = useMemo(() => {
    return filteredStations.reduce((acc, station) => {
      const genre = station.genre.toLowerCase()
      if (!acc[genre]) {
        acc[genre] = []
      }
      acc[genre].push(station)
      return acc
    }, {} as Record<string, RadioStation[]>)
  }, [filteredStations])

  // Update recently played
  const updateRecentlyPlayed = useCallback((stationId: string) => {
    setRecentlyPlayed(prev => {
      const newRecent = [stationId, ...prev.filter(id => id !== stationId)].slice(0, 10)
      localStorage.setItem('recentlyPlayed', JSON.stringify(newRecent))
      return newRecent
    })
  }, [])

  // Simplified station handler - only handles navigation
  const handleStationClick = useCallback((station: RadioStation) => {
    updateRecentlyPlayed(station.id)
    router.push(`/player?station=${station.id}`)
  }, [router, updateRecentlyPlayed])

  const getGenreIcon = (genre: string) => {
    switch (genre.toLowerCase()) {
      case 'classical':
        return Music2
      case 'news':
        return Mic2
      case 'international':
        return Globe2
      default:
        return Radio
    }
  }

  return (
    <div className="relative flex flex-col h-[100dvh] overflow-hidden bg-background">
      {/* Hero Section */}
      <div className="relative w-full h-[15vh] min-h-[120px] shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20">
          <div className="absolute inset-0 bg-grid-white/10" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <div className="relative flex flex-col justify-end h-full px-6 pb-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl font-bold tracking-tight">Radio Stations</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Discover live radio from around the world
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 overflow-hidden bg-background">
        {/* Search and Filters */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="px-4 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search stations..."
                className="pl-9 bg-background/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="px-4 pb-3 pt-1">
            <ScrollArea className="w-full">
              <Tabs
                value={activeGenre}
                onValueChange={setActiveGenre}
                className="w-full"
              >
                <TabsList className="inline-flex h-8 items-center justify-start space-x-2 rounded-none bg-transparent p-0">
                  <TabsTrigger
                    value="all"
                    className="h-7 rounded-full px-3 text-xs ring-offset-background transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow"
                  >
                    All Stations
                  </TabsTrigger>
                  {genres.map(genre => (
                    <TabsTrigger
                      key={genre.id}
                      value={genre.id}
                      className="h-7 rounded-full px-3 text-xs ring-offset-background transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow whitespace-nowrap"
                    >
                      {genre.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <ScrollBar orientation="horizontal" className="invisible" />
              </Tabs>
            </ScrollArea>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="h-[calc(100%-110px)] overflow-y-auto">
          <div className="px-4 py-4 pb-20">
            <AnimatePresence mode="wait">
              {isLoading ? (
                // Enhanced loading state
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {Array(4).fill(0).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-xl bg-card/50 animate-pulse"
                    >
                      <div className="w-16 h-16 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-2/3 bg-muted rounded" />
                        <div className="h-3 w-1/2 bg-muted rounded" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-muted" />
                    </div>
                  ))}
                </motion.div>
              ) : filteredStations.length === 0 ? (
                // Enhanced empty state
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Radio className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-base font-medium">
                    {searchQuery 
                      ? `No stations found for "${searchQuery}"`
                      : 'No stations found for this genre.'
                    }
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your search or filters
                  </p>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear Search
                    </Button>
                  )}
                </motion.div>
              ) : (
                // Enhanced station list
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Recently Played Section */}
                  {recentlyPlayed.length > 0 && (
                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <History className="h-4 w-4 text-primary" />
                        <span>Recently Played</span>
                      </div>
                      <ScrollArea className="w-full">
                        <div className="flex space-x-3 pb-4">
                          {recentlyPlayed.map(id => {
                            const station = radioStations.find(s => s.id === id)
                            if (!station) return null
                            return (
                              <Button
                                key={station.id}
                                variant="outline"
                                className="flex flex-col items-center justify-center h-24 w-24 p-3 space-y-2 rounded-xl shrink-0 hover:bg-accent/50"
                                onClick={() => handleStationClick(station)}
                              >
                                <RadioStationImage
                                  station={station}
                                  size="sm"
                                  priority
                                />
                                <span className="text-xs text-center line-clamp-1">{station.name}</span>
                              </Button>
                            )
                          })}
                        </div>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </section>
                  )}

                  {/* Stations by Genre */}
                  {Object.entries(stationsByGenre).map(([genre, stations]) => (
                    <section key={genre} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <div className="h-4 w-4 text-primary">
                            {(() => {
                              const Icon = getGenreIcon(genre)
                              return <Icon className="h-full w-full" />
                            })()}
                          </div>
                          <span className="capitalize">{genre}</span>
                          <span className="text-xs text-muted-foreground">({stations.length})</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {stations.map((station) => (
                          <motion.div
                            key={station.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group"
                            layout
                          >
                            <div 
                              className="flex items-center gap-4 p-4 rounded-xl bg-card hover:bg-accent/50 active:bg-accent transition-colors"
                              onClick={() => handleStationClick(station)}
                            >
                              <RadioStationImage
                                station={station}
                                size="md"
                                priority={recentlyPlayed.includes(station.id) || station.trending}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-medium truncate">{station.name}</h3>
                                  {station.isLive && (
                                    <Badge 
                                      variant="secondary" 
                                      className="shrink-0 text-[10px] px-1.5 py-0 bg-red-500/10 text-red-500 border-red-500/20 animate-pulse"
                                    >
                                      LIVE
                                    </Badge>
                                  )}
                                  {station.trending && (
                                    <Badge 
                                      variant="secondary" 
                                      className="shrink-0 text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20"
                                    >
                                      <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                                      TRENDING
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                  <span>{station.genre}</span>
                                  <span>•</span>
                                  <span>{station.bitrate}kbps</span>
                                  {station.listeners && (
                                    <>
                                      <span>•</span>
                                      <motion.span
                                        initial={{ opacity: 0.5 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                      >
                                        {station.listeners.toLocaleString()} listening
                                      </motion.span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </section>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
} 