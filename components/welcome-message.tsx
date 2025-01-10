'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, Music2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function WelcomeMessage() {
  const [mounted, setMounted] = useState(false)
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      setTimeOfDay('morning')
    } else if (hour >= 12 && hour < 18) {
      setTimeOfDay('afternoon')
    } else {
      setTimeOfDay('evening')
    }
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg border border-border/50 bg-background/50 p-6 mb-8",
      "backdrop-blur-lg transition-all hover:bg-background/60",
      "group"
    )}>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative flex items-center gap-4">
        {timeOfDay === 'morning' && <Sun className="h-8 w-8 text-yellow-500" />}
        {timeOfDay === 'afternoon' && <Sun className="h-8 w-8 text-orange-500" />}
        {timeOfDay === 'evening' && <Moon className="h-8 w-8 text-blue-400" />}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Good {timeOfDay}
          </h2>
          <p className="text-muted-foreground">
            Ready to discover some new music?
          </p>
        </div>
        <Music2 className="ml-auto h-6 w-6 text-primary animate-bounce" />
      </div>
    </div>
  )
}

