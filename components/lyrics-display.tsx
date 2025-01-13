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

  const hasLyrics = metadata.lyrics || metadata.recognized?.lyrics
  const lyrics = metadata.lyrics || metadata.recognized?.lyrics || ''
  const isRecognized = !!metadata.recognized

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic2 className={cn(
            'h-4 w-4 transition-opacity',
            isRecognizing ? 'animate-pulse opacity-100' : 'opacity-50'
          )} />
          <span className="text-sm font-medium">
            {isRecognizing ? 'Identifying song...' : isRecognized ? 'Song identified' : 'Lyrics'}
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

      {isRecognized && metadata.recognized && (
        <div className="text-sm text-muted-foreground">
          <p>Identified as &ldquo;{metadata.recognized.title}&rdquo; by {metadata.recognized.artist}</p>
          {metadata.recognized.album && (
            <p>Album: {metadata.recognized.album}</p>
          )}
          {metadata.recognized.releaseDate && (
            <p>Released: {metadata.recognized.releaseDate}</p>
          )}
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
          No lyrics available for this track.
        </div>
      )}
    </div>
  )
}

