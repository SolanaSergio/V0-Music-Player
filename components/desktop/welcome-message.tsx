'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, Radio, Users, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { radioStations } from '@/data/audio'

export function WelcomeMessage() {
  const [mounted, setMounted] = useState(false)
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning')
  const [stats, setStats] = useState({
    totalStations: 0,
    liveStations: 0,
    totalListeners: 0
  })

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      setTimeOfDay('morning')
    } else if (hour >= 12 && hour < 18) {
      setTimeOfDay('afternoon')
    } else {
      setTimeOfDay('evening')
    }

    // Calculate stats
    const liveStations = radioStations.filter(station => station.isLive)
    const totalListeners = radioStations.reduce((acc, station) => acc + (station.listeners || 0), 0)
    setStats({
      totalStations: radioStations.length,
      liveStations: liveStations.length,
      totalListeners: totalListeners
    })

    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative overflow-hidden rounded-lg border border-border/50 bg-background/50 p-6 mb-8",
        "backdrop-blur-lg transition-all hover:bg-background/60",
        "group"
      )}
    >
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Content */}
      <div className="relative space-y-6">
        {/* Greeting */}
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ 
              rotate: [0, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            {timeOfDay === 'morning' && <Sun className="h-8 w-8 text-yellow-500" />}
            {timeOfDay === 'afternoon' && <Sun className="h-8 w-8 text-orange-500" />}
            {timeOfDay === 'evening' && <Moon className="h-8 w-8 text-blue-400" />}
          </motion.div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Good {timeOfDay}
            </h2>
            <p className="text-muted-foreground">
              Discover your next favorite radio station
            </p>
          </div>
          <motion.div
            className="ml-auto"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 15, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Radio className="h-6 w-6 text-primary" />
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div 
            className="flex items-center gap-2 text-sm text-muted-foreground"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Radio className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-foreground">{stats.totalStations}</div>
              <div>Total Stations</div>
            </div>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2 text-sm text-muted-foreground"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-foreground">{stats.liveStations}</div>
              <div>Live Now</div>
            </div>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2 text-sm text-muted-foreground"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-foreground">{stats.totalListeners}k</div>
              <div>Active Listeners</div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

