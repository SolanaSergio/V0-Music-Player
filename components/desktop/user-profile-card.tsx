'use client'

import { Settings, Music, Clock, Heart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ImageLoader } from '@/components/shared/image-loader'
import { cn } from "@/lib/utils"

interface UserStats {
  playlists: number
  favorites: number
  listening: string
}

interface UserProfileCardProps {
  user: {
    name: string
    image: string
    fallbackImage: string
    stats: UserStats
  }
  className?: string
}

export function UserProfileCard({ user, className }: UserProfileCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="border-b border-border/20 p-0">
        <div className="relative h-32 bg-gradient-to-r from-primary/20 to-purple-500/20">
          <div className="absolute -bottom-12 left-6">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-background">
              <ImageLoader
                src={user.image}
                fallback={user.fallbackImage}
                alt={user.name}
                width={96}
                height={96}
                className="object-cover"
              />
            </div>
          </div>
          <div className="absolute right-4 top-4">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-14">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-sm text-muted-foreground">Premium Member</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <Music className="mx-auto h-5 w-5 text-primary" />
              <div className="text-2xl font-semibold">{user.stats.playlists}</div>
              <div className="text-xs text-muted-foreground">Playlists</div>
            </div>
            <div className="space-y-1">
              <Heart className="mx-auto h-5 w-5 text-primary" />
              <div className="text-2xl font-semibold">{user.stats.favorites}</div>
              <div className="text-xs text-muted-foreground">Favorites</div>
            </div>
            <div className="space-y-1">
              <Clock className="mx-auto h-5 w-5 text-primary" />
              <div className="text-2xl font-semibold">{user.stats.listening}</div>
              <div className="text-xs text-muted-foreground">Hours</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

