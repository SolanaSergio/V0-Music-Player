'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface LyricsDisplayProps {
  lyrics?: string[]
  currentTime: number
  timestamps?: number[]
  onClose: () => void
}

export function LyricsDisplay({
  lyrics = [],
  currentTime,
  timestamps = [],
  onClose
}: LyricsDisplayProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const index = timestamps.findIndex(time => time > currentTime) - 1
    setActiveIndex(Math.max(0, index))
  }, [currentTime, timestamps])

  if (lyrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Mic className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No lyrics available for this track</p>
      </div>
    )
  }

  return (
    <div className="relative h-full bg-background/95 backdrop-blur-sm border-l border-border/20">
      <div className="flex items-center justify-between p-4 border-b border-border/20">
        <h3 className="font-semibold">Lyrics</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100%-4rem)]">
        <div className="p-4 space-y-6">
          {lyrics.map((line, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0.5 }}
              animate={{
                opacity: index === activeIndex ? 1 : 0.5,
                scale: index === activeIndex ? 1.05 : 1,
              }}
              className={`text-center transition-colors ${
                index === activeIndex ? 'text-primary font-medium' : ''
              }`}
            >
              {line}
            </motion.p>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

