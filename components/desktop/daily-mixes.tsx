'use client'

import { Sparkles, Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ImageLoader } from '@/components/shared/image-loader'

const dailyMixes = [
  {
    id: 1,
    title: "Daily Mix 1",
    description: "Taylor Swift, Ed Sheeran, Adele and more",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&q=80",
  },
  {
    id: 2,
    title: "Daily Mix 2",
    description: "Drake, Travis Scott, Future and more",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&q=80",
  },
  {
    id: 3,
    title: "Daily Mix 3",
    description: "The Weeknd, Post Malone, Doja Cat and more",
    imageUrl: "https://images.unsplash.com/photo-1571609288073-ee4123ff2b23?w=300&h=300&q=80",
  },
]

export function DailyMixes() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          Made For You
        </CardTitle>
        <Button variant="ghost" size="sm" className="hover:bg-primary/20">Refresh</Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="grid grid-cols-1 gap-4 p-4">
            {dailyMixes.map((mix) => (
              <div
                key={mix.id}
                className="group relative flex items-center gap-4 rounded-lg border border-border/50 bg-card/50 p-4 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
              >
                <div className="relative h-20 w-20 overflow-hidden rounded-md">
                  <ImageLoader
                    src={mix.imageUrl}
                    fallback="/placeholder.svg"
                    alt={mix.title}
                    width={80}
                    height={80}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {mix.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {mix.description}
                  </p>
                </div>
                <Button
                  size="icon"
                  className="opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

