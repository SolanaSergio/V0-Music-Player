'use client'

import { useState } from 'react'
import { Grip, X } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ImageLoader } from '@/components/shared/image-loader'
import type { Track } from '@/types/audio'

interface QueueManagerProps {
  currentTrack: Track
  queue: Track[]
  onRemoveTrack: (index: number) => void
  onReorderTrack: (from: number, to: number) => void
  children: React.ReactNode
}

export function QueueManager({
  currentTrack,
  queue,
  onRemoveTrack,
  onReorderTrack,
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
          <Button variant="ghost" size="icon">
            <Grip className="h-5 w-5" />
            <span className="sr-only">Open queue</span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Queue</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          {currentTrack && (
            <div className="mb-6 space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Now Playing</h3>
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-md">
                  <ImageLoader
                    src={currentTrack.artwork}
                    alt={currentTrack.title}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">{currentTrack.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
                </div>
              </div>
            </div>
          )}
          {queue.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Next Up</h3>
              <div className="space-y-3">
                {queue.map((track, index) => (
                  <div
                    key={`${track.id}-${index}`}
                    className="flex items-center gap-3 group"
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={() => setDraggedIndex(null)}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Grip className="h-4 w-4" />
                      <span className="sr-only">Drag to reorder</span>
                    </Button>
                    <div className="relative h-12 w-12 overflow-hidden rounded-md shrink-0">
                      <ImageLoader
                        src={track.artwork}
                        alt={track.title}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">{track.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onRemoveTrack(index)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove from queue</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-muted-foreground">Queue is empty</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

