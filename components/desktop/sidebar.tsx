'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Radio, Music2, Heart, History, Settings, Disc3 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from '@/components/ui/separator'
import { cn } from "@/lib/utils"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Home',
      href: '/',
      icon: Home
    },
    {
      name: 'Radio',
      href: '/radio',
      icon: Radio
    },
    {
      name: 'Player',
      href: '/player',
      icon: Music2
    }
  ]

  const playlists = [
    {
      name: 'Favorites',
      href: '/favorites',
      icon: Heart
    },
    {
      name: 'Recently Played',
      href: '/history',
      icon: History
    }
  ]

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            V0 Music Player
          </h2>
        </div>
        <div className="space-y-1 px-3">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                pathname === item.href && "bg-primary/10 text-primary"
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          ))}
        </div>
        <Separator className="mx-3" />
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Library
          </h2>
        </div>
        <div className="space-y-1 px-3">
          {playlists.map((item) => (
            <Button
              key={item.name}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                pathname === item.href && "bg-primary/10 text-primary"
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          ))}
        </div>
        <Separator className="mx-3" />
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Genres
          </h2>
          <ScrollArea className="h-[300px] px-1">
            <div className="space-y-1">
              {['Electronic', 'Classical', 'Jazz', 'Rock', 'Pop', 'Hip-Hop', 'Ambient'].map((genre) => (
                <Button
                  key={genre}
                  variant="ghost"
                  className="w-full justify-start font-normal"
                  asChild
                >
                  <Link href={`/genre/${genre.toLowerCase()}`}>
                    <Disc3 className="mr-2 h-4 w-4" />
                    {genre}
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
        <div className="mt-auto px-3">
          <Button
            variant="ghost"
            className="w-full justify-start"
            asChild
          >
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

