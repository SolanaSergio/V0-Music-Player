'use client'

import { useState } from 'react'
import { List, GripVertical, X } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ImageLoader } from '@/components/image-loader'
import type { Track } from '@/types/audio'
import { cn } from "@/lib/utils"

interface QueueManagerProps {
  currentTrack?: Track
  queue: Track[]
  onRemoveTrack: (index: number) => void
  onReorderTrack: (fromIndex: number, toIndex: number) => void
  className?: string
  children?: React.ReactNode
}

export function QueueManager({
  currentTrack,
  queue,
  onRemoveTrack,
  onReorderTrack,
  className,
  children
}: QueueManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null) return

    if (draggedIndex !== index) {
      onReorderTrack(draggedIndex, index)
      setDraggedIndex(index)
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" className={className}>
            <List className="h-4 w-4" />
            <span className="sr-only">Queue</span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Queue</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {currentTrack && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Now Playing
              </div>
              <div className="flex items-center gap-3 rounded-md bg-muted/50 p-2">
                <div className="relative h-12 w-12 overflow-hidden rounded-md">
                  <ImageLoader
                    src={currentTrack.imageUrl}
                    fallback={currentTrack.fallbackImage}
                    alt={currentTrack.title}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{currentTrack.title}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {currentTrack.artist}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Next Up • {queue.length} tracks
            </div>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {queue.map((track, index) => (
                  <div
                    key={`${track.id}-${index}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={() => setDraggedIndex(null)}
                    className={cn(
                      "flex items-center gap-3 rounded-md p-2 select-none",
                      "hover:bg-muted/50 transition-colors",
                      draggedIndex === index && "opacity-50"
                    )}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <div className="relative h-10 w-10 overflow-hidden rounded-md">
                      <ImageLoader
                        src={track.imageUrl}
                        fallback={track.fallbackImage}
                        alt={track.title}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{track.title}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {track.artist}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onRemoveTrack(index)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

