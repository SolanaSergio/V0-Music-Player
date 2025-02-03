'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Mic2 } from 'lucide-react'
import type { TrackMetadata } from '@/types/audio'

interface LyricsDisplayProps {
  metadata: TrackMetadata | null
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
          <span className="text-sm font-medium">
            {isRecognizing ? 'Searching for lyrics...' : hasLyrics ? 'Lyrics found' : 'No lyrics available'}
          </span>
        </div>
        {hasLyrics && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </Button>
        )}
      </div>

      {metadata.artist && metadata.title && (
        <div className="text-sm text-muted-foreground">
          <p>&ldquo;{metadata.title}&rdquo; by {metadata.artist}</p>
        </div>
      )}

      {hasLyrics && (
        <ScrollArea className={cn(
          'relative rounded-md border bg-muted/50 p-4 transition-all',
          isExpanded ? 'h-[400px]' : 'h-[100px]'
        )}>
          <div className="whitespace-pre-line text-sm">
            {lyrics}
          </div>
        </ScrollArea>
      )}

      {!hasLyrics && !isRecognizing && (
        <div className="text-sm text-muted-foreground">
          Lyrics will appear here when available.
        </div>
      )}
    </div>
  )
}

