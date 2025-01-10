'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Radio, Sparkles, Music, Heart, History, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const mainRoutes = [
  {
    path: '/',
    label: 'Home',
    icon: Home
  },
  {
    path: '/new',
    label: 'Discover',
    icon: Sparkles
  },
  {
    path: '/radio',
    label: 'Radio',
    icon: Radio
  }
]

const playlists = [
  { id: '1', name: 'Chill Vibes' },
  { id: '2', name: 'Workout Mix' },
  { id: '3', name: 'Focus Time' },
  { id: '4', name: 'Party Hits' },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={cn(
      "w-[250px] border-r border-border/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
      className
    )}>
      <div className="h-16 border-b border-border/20 flex items-center px-6">
        <Link 
          href="/" 
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Music className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Music App</span>
        </Link>
      </div>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="p-3 space-y-6">
          <nav className="space-y-1">
            {mainRoutes.map((route) => {
              const isActive = pathname === route.path
              return (
                <Button
                  key={route.path}
                  asChild
                  variant="ghost"
                  className={cn(
                    "w-full justify-start transition-all duration-200",
                    isActive 
                      ? "bg-primary/20 text-primary hover:bg-primary/30" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  )}
                >
                  <Link href={route.path}>
                    <route.icon className="mr-2 h-4 w-4" />
                    {route.label}
                  </Link>
                </Button>
              )
            })}
          </nav>

          <div className="space-y-4">
            <div className="px-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight">Library</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Create playlist</span>
              </Button>
            </div>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start hover:bg-primary/20">
                <Heart className="mr-2 h-4 w-4 text-primary" />
                Liked Songs
              </Button>
              <Button variant="ghost" className="w-full justify-start hover:bg-primary/20">
                <History className="mr-2 h-4 w-4 text-primary" />
                Recently Played
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="px-3">
              <h2 className="text-sm font-semibold tracking-tight">Playlists</h2>
            </div>
            <div className="space-y-1">
              {playlists.map((playlist) => (
                <Button
                  key={playlist.id}
                  variant="ghost"
                  className="w-full justify-start font-normal hover:bg-primary/20"
                >
                  {playlist.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  )
}

