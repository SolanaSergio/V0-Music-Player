'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Radio, 
  Play, 
  Users, 
  Signal, 
  Globe2, 
  Gauge, 
  Music2, 
  Heart,
  Share2,
  Info,
  Sparkles,
  TrendingUp
} from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ImageLoader } from '@/components/shared/image-loader'
import type { RadioStation } from '@/types/audio'
import { cn } from "@/lib/utils"

interface RadioStationCardProps {
  station: RadioStation
  className?: string
  index?: number
}

export function RadioStationCard({ station, className, index = 0 }: RadioStationCardProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  const handlePlay = () => {
    router.push(`/player?station=${station.id}`)
  }

  // Format bitrate display
  const formatBitrate = (bitrate?: number) => {
    if (!bitrate) return 'Unknown'
    return `${bitrate} kbps`
  }

  // Get quality level
  const getQualityInfo = (bitrate?: number) => {
    if (!bitrate) return { level: 'unknown', color: 'text-muted-foreground' }
    if (bitrate >= 256) return { level: 'High', color: 'text-green-500' }
    if (bitrate >= 128) return { level: 'Medium', color: 'text-yellow-500' }
    return { level: 'Low', color: 'text-red-500' }
  }

  const qualityInfo = getQualityInfo(station.bitrate)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className={cn(
          "group relative overflow-hidden transition-all duration-500",
          "hover:bg-accent/50 hover:shadow-xl hover:shadow-primary/5",
          "border-border/50 backdrop-blur-sm",
          className
        )}
      >
        <CardContent className="p-0">
          <div className="flex items-stretch">
            {/* Station Image Section */}
            <div className="relative w-32 shrink-0">
              <div className="absolute inset-0">
                <ImageLoader
                  src={station.image || ''}
                  alt={station.name}
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
              </div>
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm hover:scale-110 transition-transform"
                  onClick={handlePlay}
                >
                  <Play className="h-5 w-5 text-primary ml-1" />
                </Button>
              </div>
            </div>

            {/* Station Info Section */}
            <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
              <div className="space-y-2">
                {/* Title and Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate pr-4">
                      {station.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {station.description || station.genre || 'Radio Station'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 shrink-0">
                    {station.isLive && (
                      <Badge variant="outline" className="bg-background/50 backdrop-blur-sm animate-pulse">
                        <Signal className="w-3 h-3 mr-1 text-primary" />
                        Live
                      </Badge>
                    )}
                    {station.trending && (
                      <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                        <TrendingUp className="w-3 h-3 mr-1 text-primary" />
                        Trending
                      </Badge>
                    )}
                    {station.featured && (
                      <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                        <Sparkles className="w-3 h-3 mr-1 text-primary" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Station Metadata */}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <TooltipProvider>
                    {station.genre && (
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-1">
                            <Music2 className="w-4 h-4" />
                            <span>{station.genre}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Genre</TooltipContent>
                      </Tooltip>
                    )}
                    {station.country && (
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-1">
                            <Globe2 className="w-4 h-4" />
                            <span>{station.country}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Country</TooltipContent>
                      </Tooltip>
                    )}
                    {station.bitrate && (
                      <Tooltip>
                        <TooltipTrigger>
                          <div className={cn("flex items-center gap-1", qualityInfo.color)}>
                            <Gauge className="w-4 h-4" />
                            <span>{formatBitrate(station.bitrate)}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{qualityInfo.level} Quality</TooltipContent>
                      </Tooltip>
                    )}
                  </TooltipProvider>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  {station.listeners && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{station.listeners.toLocaleString()}k listening</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-2"
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Info className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={handlePlay}
                    className="gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Play
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Hover Gradient Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </CardContent>
      </Card>
    </motion.div>
  )
} 