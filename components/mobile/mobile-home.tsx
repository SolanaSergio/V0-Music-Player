'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ImageLoader } from '@/components/shared/image-loader'
import { useRouter } from 'next/navigation'
import { radioStations } from '@/data/audio'
import { 
  Headphones, 
  Music2, 
  Radio, 
  Mic2,
  Heart,
  Sparkles,
  CloudRain,
  Zap,
  Coffee,
  Moon,
  Sun,
  Stars,
  LucideIcon,
  Play,
  Shuffle,
  TrendingUp,
  Clock,
  ListMusic
} from 'lucide-react'
import { motion } from 'framer-motion'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import { Suspense } from 'react'
import { Badge } from '@/components/ui/badge'

// Types
interface MoodCategory {
  id: string
  name: string
  icon: LucideIcon
  color: string
  bgColor: string
}

interface FeaturedStation {
  id: string
  title: string
  description: string
  icon: LucideIcon
  color: string
}

interface QuickActionProps {
  icon: LucideIcon
  title: string
  onClick: () => Promise<void>
  gradient: string
}

// Constants
const MOOD_CATEGORIES: MoodCategory[] = [
  { id: 'happy', name: 'Happy', icon: Sun, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  { id: 'chill', name: 'Chill', icon: CloudRain, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { id: 'energetic', name: 'Energetic', icon: Zap, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  { id: 'focus', name: 'Focus', icon: Coffee, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  { id: 'romantic', name: 'Romantic', icon: Heart, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
  { id: 'sleep', name: 'Sleep', icon: Moon, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' }
]

const FEATURED_STATIONS: FeaturedStation[] = [
  {
    id: 'featured-1',
    title: 'Top Hits Radio',
    description: 'The hottest hits right now',
    icon: Headphones,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'featured-2',
    title: 'Classical Vibes',
    description: 'Timeless classical music',
    icon: Music2,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'featured-3',
    title: 'Jazz Lounge',
    description: 'Smooth jazz all day',
    icon: Radio,
    color: 'from-amber-500 to-orange-500'
  }
]

export function MobileHome() {
  const router = useRouter()

  const handleNavigation = async (path: string) => {
    try {
      await router.push(path)
    } catch (error) {
      console.error('Navigation failed:', error)
    }
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-[100dvh] bg-background overflow-y-auto pb-safe-area-inset-bottom">
        {/* Hero Section */}
        <motion.div 
          className="relative w-full h-[30vh] min-h-[220px] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20">
            <div className="absolute inset-0 bg-grid-white/10" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
          <div className="relative flex flex-col justify-end h-full px-6 pb-8 space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-3xl font-bold tracking-tight">
                Good {getTimeOfDay()}
              </h1>
              <p className="text-base text-muted-foreground mt-1">
                Discover your perfect soundtrack
              </p>
            </motion.div>
            
            {/* New: Daily Mix Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10"
            >
              <div className="shrink-0">
                <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">Your Daily Mix</h3>
                <p className="text-xs text-muted-foreground truncate">Fresh picks based on your taste</p>
              </div>
              <Button 
                size="sm" 
                className="shrink-0 h-8 bg-primary"
                onClick={() => handleNavigation('/daily-mix')}
              >
                <Play className="h-4 w-4 mr-1" /> Play
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.section 
          className="px-4 -mt-6 mb-6 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="grid grid-cols-3 gap-3">
            <QuickActionCard
              icon={Mic2}
              title="Live Radio"
              onClick={() => handleNavigation('/radio')}
              gradient="from-pink-500 to-rose-500"
            />
            <QuickActionCard
              icon={Sparkles}
              title="Discover"
              onClick={() => handleNavigation('/discover')}
              gradient="from-violet-500 to-purple-500"
            />
            <QuickActionCard
              icon={Stars}
              title="For You"
              onClick={() => handleNavigation('/recommendations')}
              gradient="from-blue-500 to-cyan-500"
            />
          </div>
        </motion.section>

        {/* Mood Section */}
        <Suspense fallback={<MoodSectionSkeleton />}>
          <motion.section 
            className="px-4 py-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-lg font-semibold mb-4">How are you feeling?</h2>
            <ScrollArea className="w-full">
              <div className="flex space-x-3 pb-4">
                {MOOD_CATEGORIES.map((mood) => (
                  <Button
                    key={mood.id}
                    variant="outline"
                    className={`flex flex-col items-center justify-center h-24 w-24 space-y-2 rounded-xl border-2 ${mood.bgColor} hover:scale-105 transition-transform`}
                    onClick={() => handleNavigation(`/mood/${mood.id}`)}
                  >
                    {<mood.icon className={`h-8 w-8 ${mood.color}`} />}
                    <span className="text-sm font-medium">{mood.name}</span>
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </motion.section>
        </Suspense>

        {/* New: Recently Played */}
        <motion.section
          className="px-4 py-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recently Played</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              <Clock className="h-4 w-4 mr-1" /> View All
            </Button>
          </div>
          <ScrollArea className="w-full">
            <div className="flex space-x-4 pb-4">
              {radioStations.slice(0, 6).map((station) => (
                <motion.div
                  key={station.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="shrink-0"
                >
                  <Card className="w-[140px] p-3 hover:bg-accent transition-colors cursor-pointer">
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3">
                      <ImageLoader
                        src={station.image}
                        alt={station.name}
                        fill
                        className="object-cover"
                        fallback="/radio-stations/default-radio.jpg"
                        sizes="140px"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="font-medium text-sm line-clamp-1">{station.name}</h3>
                    <p className="text-xs text-muted-foreground">{station.genre}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </motion.section>

        {/* Featured Stations */}
        <Suspense fallback={<FeaturedStationsSkeleton />}>
          <motion.section 
            className="px-4 py-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Featured Stations</h2>
              <Button variant="ghost" size="sm" className="text-primary">
                <Shuffle className="h-4 w-4 mr-1" /> Shuffle Play
              </Button>
            </div>
            <div className="space-y-3">
              {FEATURED_STATIONS.map((station) => (
                <Card
                  key={station.id}
                  className="relative overflow-hidden hover:bg-accent transition-colors cursor-pointer group"
                  onClick={() => handleNavigation(`/station/${station.id}`)}
                >
                  <div className={`absolute inset-0 opacity-10 bg-gradient-to-r ${station.color} group-hover:opacity-20 transition-opacity`} />
                  <div className="relative p-4 flex items-center space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${station.color} transform group-hover:scale-110 transition-transform`}>
                      <station.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{station.title}</h3>
                      <p className="text-sm text-muted-foreground">{station.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.section>
        </Suspense>

        {/* New: Trending Now */}
        <motion.section
          className="px-4 py-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Trending Now</h2>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <TrendingUp className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              <ListMusic className="h-4 w-4 mr-1" /> View All
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {radioStations.filter(s => s.trending).slice(0, 4).map((station) => (
              <motion.div
                key={station.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="p-3 hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => handleNavigation(`/station/${station.id}`)}
                >
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-2">
                    <ImageLoader
                      src={station.image}
                      alt={station.name}
                      fill
                      className="object-cover"
                      fallback="/radio-stations/default-radio.jpg"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    <div className="absolute bottom-2 right-2">
                      <Badge className="bg-black/60 text-white border-0">
                        {station.listeners?.toLocaleString()} listening
                      </Badge>
                    </div>
                  </div>
                  <h3 className="font-medium text-sm line-clamp-1">{station.name}</h3>
                  <p className="text-xs text-muted-foreground">{station.genre}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Explore More Button */}
        <div className="sticky bottom-0 p-4 mt-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
          <Button 
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            onClick={() => handleNavigation('/explore')}
          >
            Explore More
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  )
}

function QuickActionCard({ 
  icon: Icon, 
  title, 
  onClick, 
  gradient 
}: QuickActionProps) {
  return (
    <Button
      variant="outline"
      className="relative h-24 flex flex-col items-center justify-center space-y-2 overflow-hidden hover:scale-105 transition-transform"
      onClick={onClick}
    >
      <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${gradient} group-hover:opacity-20 transition-opacity`} />
      <div className={`relative p-2 rounded-xl bg-gradient-to-br ${gradient}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <span className="text-sm font-medium relative">{title}</span>
    </Button>
  )
}

function MoodSectionSkeleton() {
  return (
    <div className="px-4 py-6 animate-pulse">
      <div className="h-6 w-32 bg-muted rounded mb-4" />
      <div className="flex space-x-3">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-24 w-24 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  )
}

function FeaturedStationsSkeleton() {
  return (
    <div className="px-4 py-6 animate-pulse">
      <div className="h-6 w-40 bg-muted rounded mb-4" />
      <div className="space-y-3">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  )
}

function getTimeOfDay() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Morning'
  if (hour < 17) return 'Afternoon'
  return 'Evening'
}