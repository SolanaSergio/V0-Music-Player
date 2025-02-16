'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RadioHero } from '@/components/desktop/radio-hero'
import { FeaturedStations } from '@/components/desktop/featured-stations'
import { TrendingStations } from '@/components/desktop/trending-stations'
import { StationsByGenre } from '@/components/desktop/stations-by-genre'
import { RadioSearch } from '@/components/desktop/radio-search'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { RadioStations } from '@/components/desktop/radio-stations'
import { 
  Sparkles, 
  TrendingUp, 
  Globe2, 
  Music2, 
  ListMusic,
  Languages,
  SortAsc,
  Wifi,
  Gauge,
  Signal
} from 'lucide-react'
import { radioStations } from '@/data/audio'
import type { Genre, RadioStation } from '@/types/audio'

const genres: Genre[] = [
  { id: 'electronic', name: 'Electronic' },
  { id: 'rock', name: 'Rock' },
  { id: 'jazz', name: 'Jazz' },
  { id: 'classical', name: 'Classical' },
  { id: 'pop', name: 'Pop' },
  { id: 'ambient', name: 'Ambient' },
  { id: 'hiphop', name: 'Hip Hop' },
  { id: 'indie', name: 'Indie' },
  { id: 'metal', name: 'Metal' },
  { id: 'blues', name: 'Blues' },
  { id: 'folk', name: 'Folk' },
  { id: 'reggae', name: 'Reggae' },
  { id: 'soul', name: 'Soul' },
  { id: 'funk', name: 'Funk' },
  { id: 'country', name: 'Country' },
]

export default function RadioPage() {
  const [sortBy, setSortBy] = useState<'listeners' | 'name' | 'trending'>('listeners')
  const [filterBitrate, setFilterBitrate] = useState<string>('all')
  const [filterLanguage, setFilterLanguage] = useState<string>('all')

  // Get unique languages from stations
  const languages = Array.from(new Set(radioStations.filter(s => s.language).map(s => s.language))) as string[]

  // Filter and sort stations
  const getFilteredStations = (stations: RadioStation[]) => {
    let filtered = [...stations]

    // Apply bitrate filter
    if (filterBitrate !== 'all') {
      filtered = filtered.filter(s => {
        if (filterBitrate === 'high') return (s.bitrate || 0) >= 256
        if (filterBitrate === 'medium') return (s.bitrate || 0) >= 128 && (s.bitrate || 0) < 256
        return (s.bitrate || 0) < 128
      })
    }

    // Apply language filter
    if (filterLanguage !== 'all') {
      filtered = filtered.filter(s => s.language === filterLanguage)
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'listeners') return (b.listeners || 0) - (a.listeners || 0)
      if (sortBy === 'trending') return (b.trending ? 1 : 0) - (a.trending ? 1 : 0)
      return a.name.localeCompare(b.name)
    })
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/90" />
        <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:radial-gradient(white,transparent_85%)]" />
      </div>

      {/* Content */}
      <ScrollArea className="relative h-[calc(100vh-4rem)]">
        {/* Hero Section */}
        <section className="relative">
          <RadioHero />
        </section>

        {/* Main Content */}
        <div className="container max-w-7xl mx-auto px-4 lg:px-8 space-y-8">
          {/* Search and Filters */}
          <div className="sticky top-16 z-30 -mx-4 px-4 py-4 backdrop-blur-xl border-b border-border/5 bg-background/80">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <RadioSearch />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={(value: 'listeners' | 'name' | 'trending') => setSortBy(value)}>
                    <SelectTrigger className="w-[160px] bg-background/50">
                      <SortAsc className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="listeners">Most Listeners</SelectItem>
                      <SelectItem value="trending">Trending First</SelectItem>
                      <SelectItem value="name">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterBitrate} onValueChange={setFilterBitrate}>
                    <SelectTrigger className="w-[160px] bg-background/50">
                      <Gauge className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Qualities</SelectItem>
                      <SelectItem value="high">High Quality (256+)</SelectItem>
                      <SelectItem value="medium">Medium Quality</SelectItem>
                      <SelectItem value="low">Low Quality</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                    <SelectTrigger className="w-[160px] bg-background/50">
                      <Languages className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      {languages.map(lang => (
                        <SelectItem key={lang} value={lang}>{lang.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <Tabs defaultValue="featured" className="space-y-8">
            <div className="flex justify-center">
              <TabsList className="bg-background/50 border border-border/50">
                <TabsTrigger value="featured" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Featured
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="genres" className="flex items-center gap-2">
                  <Music2 className="h-4 w-4" />
                  Genres
                </TabsTrigger>
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <ListMusic className="h-4 w-4" />
                  All Stations
                </TabsTrigger>
                <TabsTrigger value="global" className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4" />
                  Global
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="space-y-12">
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.15 }}
                >
                  <TabsContent value="featured" className="space-y-8">
                    <FeaturedStations />
                  </TabsContent>

                  <TabsContent value="trending" className="space-y-8">
                    <TrendingStations />
                  </TabsContent>

                  <TabsContent value="genres" className="space-y-8">
                    <StationsByGenre genres={genres} />
                  </TabsContent>

                  <TabsContent value="all" className="space-y-8">
                    <div className="grid gap-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h2 className="text-2xl font-bold">All Radio Stations</h2>
                          <p className="text-muted-foreground">
                            Browse our complete collection of radio stations
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-background/50">
                          {getFilteredStations(radioStations).length} stations
                        </Badge>
                      </div>
                      <RadioStations stations={getFilteredStations(radioStations)} />
                    </div>
                  </TabsContent>

                  <TabsContent value="global" className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* World Map with Radio Stations */}
                      <Card className="col-span-full overflow-hidden border-border/50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Globe2 className="h-5 w-5 text-primary" />
                            Radio Stations Around the World
                          </CardTitle>
                          <CardDescription>
                            Discover stations from different countries and cultures
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[400px] rounded-lg bg-background/50 backdrop-blur-sm">
                            {/* Add world map visualization here */}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Station Quality Info */}
                      <Card className="overflow-hidden border-border/50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Wifi className="h-5 w-5 text-primary" />
                            Streaming Quality
                          </CardTitle>
                          <CardDescription>
                            Understanding our station quality tiers
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {[
                              { quality: 'High Quality', bitrate: '256+ kbps', description: 'Crystal clear audio for the best experience' },
                              { quality: 'Medium Quality', bitrate: '128-256 kbps', description: 'Balanced quality for stable streaming' },
                              { quality: 'Low Quality', bitrate: '< 128 kbps', description: 'Optimized for low bandwidth connections' }
                            ].map((tier, index) => (
                              <div key={tier.quality} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                                <div className="shrink-0">
                                  <Signal className={`h-5 w-5 ${index === 0 ? 'text-green-500' : index === 1 ? 'text-yellow-500' : 'text-red-500'}`} />
                                </div>
                                <div>
                                  <h4 className="font-medium">{tier.quality}</h4>
                                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                                  <Badge variant="outline" className="mt-1 text-xs">
                                    {tier.bitrate}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Language Distribution */}
                      <Card className="overflow-hidden border-border/50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Languages className="h-5 w-5 text-primary" />
                            Language Distribution
                          </CardTitle>
                          <CardDescription>
                            Radio stations by primary broadcast language
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {languages.map(lang => {
                              const count = radioStations.filter(s => s.language === lang).length
                              const percentage = (count / radioStations.length) * 100
                              return (
                                <div key={lang} className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{lang.toUpperCase()}</span>
                                    <span className="text-muted-foreground">{count} stations</span>
                                  </div>
                                  <div className="h-2 rounded-full bg-background/50">
                                    <div 
                                      className="h-full rounded-full bg-primary/50"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  )
}

