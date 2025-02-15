'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio, Music2, Play, Sparkles, TrendingUp, Clock } from 'lucide-react'
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
import { RadioStationCard } from './radio-station-card'

interface RadioStationsProps {
  stations?: RadioStation[]
  className?: string
  showFilters?: boolean
}

export function RadioStations({ 
  stations = [], 
  className,
  showFilters = true
}: RadioStationsProps) {
  const [filter, setFilter] = useState<'all' | 'live' | 'trending'>('all')

  const filteredStations = {
    all: stations,
    live: stations.filter(s => s.isLive),
    trending: stations.filter(s => s.trending)
  }

  return (
    <div className={cn("space-y-6", className)}>
      {showFilters && (
        <Tabs 
          defaultValue="all" 
          className="space-y-6"
          onValueChange={(value) => setFilter(value as typeof filter)}
        >
          <div className="flex items-center justify-between">
            <TabsList className="bg-background/50 border border-border/50">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Radio className="h-4 w-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="live" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Live
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trending
              </TabsTrigger>
            </TabsList>
          </div>

          {Object.entries(filteredStations).map(([key, stationList]) => (
            <TabsContent key={key} value={key} className="space-y-6 min-h-[200px]">
              <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {stationList.map((station, index) => (
                      <RadioStationCard 
                        key={station.id} 
                        station={station} 
                        index={index}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
                {stationList.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-[200px] text-muted-foreground"
                  >
                    <Radio className="h-12 w-12 mb-4" />
                    <p className="text-lg font-medium">No stations found</p>
                    <p className="text-sm">Try a different filter or check back later</p>
                  </motion.div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {!showFilters && (
        <div className="grid grid-cols-1 gap-4">
          {stations.map((station, index) => (
            <RadioStationCard 
              key={station.id} 
              station={station} 
              index={index}
            />
          ))}
          {stations.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-[200px] text-muted-foreground"
            >
              <Radio className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No stations found</p>
              <p className="text-sm">Try different search terms or filters</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

