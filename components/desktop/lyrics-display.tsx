'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Mic2 } from 'lucide-react'
import type { Track } from '@/types/audio'

interface LyricsDisplayProps {
  metadata: Track | null
  isRecognizing: boolean
  className?: string
}

export function LyricsDisplay({ metadata, isRecognizing, className }: LyricsDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!metadata) return null

  const hasLyrics = metadata.lyrics
  const lyrics = metadata.lyrics || ''

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic2 className={cn(
            'h-4 w-4 transition-opacity',
            isRecognizing ? 'animate-pulse opacity-100' : hasLyrics ? 'opacity-100' : 'opacity-50'
          )} />
          <span className="text-sm font-medium">Lyrics</span>
        </div>
        {hasLyrics && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </Button>
        )}
      </div>
      {hasLyrics ? (
        <ScrollArea className={cn('relative', isExpanded ? 'h-[300px]' : 'h-[100px]')}>
          <div className="space-y-4 text-sm text-muted-foreground whitespace-pre-wrap">
            {lyrics}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-sm text-muted-foreground">
          {isRecognizing ? 'Recognizing lyrics...' : 'No lyrics available'}
        </div>
      )}
    </div>
  )
}

