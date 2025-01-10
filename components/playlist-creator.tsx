'use client'

import { useState } from 'react'
import { Plus, Music2, ImageIcon, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageLoader } from '@/components/image-loader'

interface PlaylistCreatorProps {
  onCreatePlaylist: (playlist: {
    name: string
    description: string
    imageUrl?: string
  }) => void
  className?: string
}

export function PlaylistCreator({ onCreatePlaylist, className }: PlaylistCreatorProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    
    try {
      await onCreatePlaylist({ name, description, imageUrl })
      setName('')
      setDescription('')
      setImageUrl('')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Plus className="h-4 w-4" />
          <span className="sr-only">Create Playlist</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Playlist</DialogTitle>
          <DialogDescription>
            Create a new playlist to organize your favorite tracks.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="playlist-image">Playlist Image</Label>
            <div className="flex items-start gap-4">
              <div className="relative aspect-square w-32 overflow-hidden rounded-md bg-muted">
                {imageUrl ? (
                  <ImageLoader
                    src={imageUrl}
                    fallback="/placeholder.svg"
                    alt=""
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <Input
                id="playlist-image"
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="playlist-name">Name</Label>
            <Input
              id="playlist-name"
              placeholder="My Awesome Playlist"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="playlist-description">Description</Label>
            <Textarea
              id="playlist-description"
              placeholder="A collection of my favorite tracks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <DialogTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogTrigger>
            <Button type="submit" disabled={!name || isCreating}>
              {isCreating ? (
                <>Creating...</>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Create
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

