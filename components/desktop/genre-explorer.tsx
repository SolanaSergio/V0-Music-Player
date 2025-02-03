'use client'

import { motion } from 'framer-motion'
import { Compass } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { ImageLoader } from '@/components/shared/image-loader'
import { GenreIcon } from '@/components/shared/genre-icon'
import type { Genre } from '@/types/audio'

interface GenreExplorerProps {
  genres: Genre[]
}

export function GenreExplorer({ genres }: GenreExplorerProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Compass className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Explore Genres</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {genres.map((genre, i) => (
          <motion.div
            key={genre.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="group cursor-pointer overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-0">
                <div className="relative aspect-[4/3]">
                  <ImageLoader
                    src={genre.imageUrl}
                    fallback={`/placeholder.svg?height=300&width=400&text=${genre.name}`}
                    alt={genre.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform transition-transform duration-300 group-hover:translate-y-0">
                    <div className="flex items-center gap-2">
                      <GenreIcon genre={genre.icon} className="h-5 w-5 text-white group-hover:text-primary transition-colors" />
                      <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                        {genre.name}
                      </h3>
                    </div>
                    <p className="text-sm text-white/80 line-clamp-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {genre.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

