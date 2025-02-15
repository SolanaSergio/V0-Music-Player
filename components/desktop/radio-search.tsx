'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Music2, Radio, Users, Signal, ChevronRight, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ImageLoader } from '@/components/shared/image-loader'
import { radioStations } from '@/data/audio'
import { cn } from '@/lib/utils'

export function RadioSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
      setIsSearching(!!query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Filter stations based on search query
  const filteredStations = debouncedQuery
    ? radioStations.filter(station => 
        station.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        station.description?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        station.genre?.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : []

  const handleStationClick = (stationId: string) => {
    router.push(`/player?station=${stationId}`)
  }

  const clearSearch = () => {
    setQuery('')
    setDebouncedQuery('')
    setIsSearching(false)
  }

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stations by name, genre, or description..."
          className="pl-9 pr-12 h-12 bg-background/50 backdrop-blur-sm border-border/50"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card className="overflow-hidden border-border/50 shadow-2xl shadow-primary/5">
              <CardContent className="p-2">
                {filteredStations.length > 0 ? (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {filteredStations.map((station, index) => (
                      <motion.div
                        key={station.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <Card 
                          className={cn(
                            "group relative overflow-hidden cursor-pointer transition-all duration-300",
                            "hover:bg-accent/50 hover:shadow-lg hover:shadow-primary/5",
                            "border-border/50"
                          )}
                          onClick={() => handleStationClick(station.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              {/* Station Image */}
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                                <ImageLoader
                                  src={station.image || ''}
                                  alt={station.name}
                                  width={48}
                                  height={48}
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
                                  {station.genre && (
                                    <Badge variant="outline" className="bg-background/50">
                                      <Music2 className="w-3 h-3 mr-1" />
                                      {station.genre}
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="text-base font-semibold mt-1 line-clamp-1">
                                  {station.name}
                                </h3>
                              </div>

                              {/* Stats & Action */}
                              <div className="flex items-center gap-3">
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
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Radio className="h-12 w-12 mb-4" />
                    <p className="text-lg font-medium">No stations found</p>
                    <p className="text-sm">Try searching with different keywords</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 