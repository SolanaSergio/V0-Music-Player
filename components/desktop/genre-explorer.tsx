'use client'

import { useRouter } from 'next/navigation'
import { Music2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Genre } from '@/types/audio'
import { radioStations } from '@/data/audio'

interface GenreExplorerProps {
  genres: Genre[]
  className?: string
}

export function GenreExplorer({ genres, className }: GenreExplorerProps) {
  const router = useRouter()

  return (
    <div className={className}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {genres.map((genre) => (
          <Button
            key={genre.id}
            variant="outline"
            className="h-auto py-4 px-4 flex flex-col items-center gap-2 group hover:border-primary/50"
            onClick={() => router.push(`/radio?genre=${genre.id}`)}
          >
            <Music2 className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <span className="text-sm font-medium">{genre.name}</span>
            <Badge variant="outline" className="bg-background/50">
              {radioStations.filter(s => s.genre === genre.id).length} stations
            </Badge>
          </Button>
        ))}
      </div>
    </div>
  )
}

