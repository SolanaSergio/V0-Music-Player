'use client'

import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Clock, Radio, Music, Mic2, Signal, Globe2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface RadioStation {
  type: 'radio' | 'show' | 'podcast'
  title: string
  genre: string
  listeners: string
  isLive: boolean
  tags: string[]
}

// Mock database of radio stations
const allStations: RadioStation[] = [
  {
    type: 'radio',
    title: 'Classical Radio Berlin',
    genre: 'Classical',
    listeners: '1.2k',
    isLive: true,
    tags: ['classical', 'orchestra', 'berlin', 'germany']
  },
  {
    type: 'radio',
    title: 'Jazz FM London',
    genre: 'Jazz',
    listeners: '3.4k',
    isLive: true,
    tags: ['jazz', 'blues', 'london', 'uk']
  },
  {
    type: 'radio',
    title: 'Electronic Beats FM',
    genre: 'Electronic',
    listeners: '5.1k',
    isLive: true,
    tags: ['electronic', 'dance', 'techno', 'house']
  },
  {
    type: 'radio',
    title: 'Smooth Jazz Café',
    genre: 'Jazz',
    listeners: '2.2k',
    isLive: true,
    tags: ['jazz', 'smooth', 'relaxing']
  },
  {
    type: 'radio',
    title: 'Classical Symphony Orchestra',
    genre: 'Classical',
    listeners: '1.8k',
    isLive: true,
    tags: ['classical', 'symphony', 'orchestra']
  },
  {
    type: 'radio',
    title: 'Deep House Radio',
    genre: 'Electronic',
    listeners: '4.3k',
    isLive: true,
    tags: ['electronic', 'deep house', 'house']
  },
  {
    type: 'radio',
    title: 'World Music Channel',
    genre: 'World',
    listeners: '1.5k',
    isLive: true,
    tags: ['world', 'international', 'cultural']
  },
  {
    type: 'radio',
    title: 'News Radio 24/7',
    genre: 'News',
    listeners: '8.2k',
    isLive: true,
    tags: ['news', 'talk', 'current events']
  }
]

const recentSearches = [
  'Classical Radio',
  'Jazz FM',
  'Electronic Beats',
  'News Radio'
]

const suggestedStations: RadioStation[] = [
  {
    type: 'radio',
    title: 'Classical Symphony',
    genre: 'Classical',
    listeners: '2.5k',
    isLive: true,
    tags: ['classical', 'symphony', 'orchestra']
  },
  {
    type: 'radio',
    title: 'Jazz Café',
    genre: 'Jazz',
    listeners: '1.8k',
    isLive: true,
    tags: ['jazz', 'smooth', 'café']
  },
  {
    type: 'radio',
    title: 'Electronic Waves',
    genre: 'Electronic',
    listeners: '3.2k',
    isLive: true,
    tags: ['electronic', 'dance', 'edm']
  },
  {
    type: 'radio',
    title: 'World Music',
    genre: 'World',
    listeners: '1.2k',
    isLive: false,
    tags: ['world', 'international', 'cultural']
  }
]

const categories = [
  { icon: Mic2, label: 'Talk Shows', count: 45 },
  { icon: Music, label: 'Music', count: 128 },
  { icon: Signal, label: 'Live', count: 32 },
  { icon: Globe2, label: 'International', count: 74 }
]

type SearchResult = RadioStation

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = (value: string) => {
    setQuery(value)
    if (value.length > 0) {
      setIsSearching(true)
      // Simulate API call with local search
      setTimeout(() => {
        const searchTerm = value.toLowerCase().trim()
        
        // If exact match exists, prioritize it
        const exactMatches = allStations.filter(station => {
          return station.title.toLowerCase() === searchTerm ||
                 station.genre.toLowerCase() === searchTerm ||
                 station.tags.some(tag => tag.toLowerCase() === searchTerm)
        })

        // Find partial matches
        const partialMatches = allStations.filter(station => {
          if (exactMatches.includes(station)) return false

          const searchableText = [
            station.title.toLowerCase(),
            station.genre.toLowerCase(),
            ...station.tags.map(tag => tag.toLowerCase())
          ].join(' ')

          // Split search term into words and check if any word matches
          const words = searchTerm.split(/\s+/)
          return words.some(word => searchableText.includes(word))
        })

        // Combine results, prioritizing exact matches
        const results = [...exactMatches, ...partialMatches]
        
        // Sort results by relevance (live stations first, then by listeners)
        results.sort((a, b) => {
          if (a.isLive !== b.isLive) return a.isLive ? -1 : 1
          return parseInt(b.listeners.replace('k', '000')) - 
                 parseInt(a.listeners.replace('k', '000'))
        })

        setSearchResults(results)
        setIsSearching(false)
      }, 300)
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
  }

  const RadioStationCard = ({ station }: { station: SearchResult }) => (
    <Button
      variant="ghost"
      className="w-full justify-start text-left h-auto py-3 hover:bg-accent/50"
    >
      <div className="flex items-center gap-3 w-full">
        <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
          <Radio className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-medium truncate">{station.title}</div>
            {station.isLive && (
              <Badge variant="secondary" className="shrink-0">LIVE</Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span>{station.genre}</span>
            {station.listeners && (
              <>
                <span>•</span>
                <span>{station.listeners} listeners</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Button>
  )

  return (
    <div className="flex flex-col h-full">
      {/* Search Input */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search radio stations..."
            className="pl-10 pr-4"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Search Results or Default Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {query ? (
            // Search Results
            <div className="space-y-4">
              {isSearching ? (
                <div className="text-center text-muted-foreground">
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <RadioStationCard key={index} station={result} />
                ))
              ) : (
                <div className="text-center text-muted-foreground">
                  No stations found
                </div>
              )}
            </div>
          ) : (
            // Default Content
            <>
              {/* Categories */}
              <section>
                <h2 className="text-lg font-semibold mb-3">Categories</h2>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto py-4 justify-start gap-3"
                    >
                      <category.icon className="h-5 w-5 text-primary" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{category.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {category.count} stations
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              </section>

              {/* Recent Searches */}
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
                  <Clock className="h-5 w-5" />
                  Recent Searches
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {recentSearches.map((search, index) => (
                    <Button
                      key={index}
                      variant="secondary"
                      className="justify-start font-normal"
                      onClick={() => handleSearch(search)}
                    >
                      {search}
                    </Button>
                  ))}
                </div>
              </section>

              {/* Popular Stations */}
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
                  <Radio className="h-5 w-5" />
                  Popular Stations
                </h2>
                <div className="grid gap-2">
                  {suggestedStations.map((station, index) => (
                    <RadioStationCard key={index} station={station} />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
} 