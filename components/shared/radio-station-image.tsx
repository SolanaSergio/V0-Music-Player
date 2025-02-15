'use client'

import { memo, useState, useEffect } from 'react'
import Image from 'next/image'
import { Music } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RadioStation } from '@/types/audio'
import { 
  getStationImage, 
  getStationFallbackChain, 
  getOptimizedImageUrl,
  IMAGE_SIZES 
} from '@/config/images'

interface RadioStationImageProps {
  station: RadioStation
  size?: keyof typeof IMAGE_SIZES
  priority?: boolean
  className?: string
}

const SIZES = {
  sm: {
    container: 'h-12 w-12',
    icon: 'h-6 w-6'
  },
  md: {
    container: 'h-16 w-16',
    icon: 'h-8 w-8'
  },
  lg: {
    container: 'h-24 w-24',
    icon: 'h-12 w-12'
  }
} as const

function BaseRadioStationImage({ 
  station, 
  size = 'md', 
  priority = false,
  className 
}: RadioStationImageProps) {
  const sizeConfig = SIZES[size]
  const imageConfig = IMAGE_SIZES[size]
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(!priority)
  const fallbackChain = getStationFallbackChain(station.id, station.genre)
  
  // Reset image index when station changes
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [station.id])

  // Get current image from fallback chain
  const currentImage = currentImageIndex === 0 
    ? getStationImage(station.id, station.genre)
    : fallbackChain[currentImageIndex - 1] || fallbackChain[0]

  // Get optimized image URL
  const optimizedImage = getOptimizedImageUrl(currentImage, size)

  const handleImageError = () => {
    // Try next image in fallback chain
    if (currentImageIndex < fallbackChain.length) {
      setCurrentImageIndex(prev => prev + 1)
    }
  }

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-lg bg-muted",
        sizeConfig.container,
        className
      )}
    >
      <Image
        src={optimizedImage}
        alt={`${station.name} station image`}
        fill
        className={cn(
          "object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        sizes={`(max-width: 768px) ${imageConfig.width * 2}px, ${imageConfig.width}px`}
        quality={imageConfig.quality}
        priority={priority}
        onError={handleImageError}
        onLoadingComplete={() => setIsLoading(false)}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
          <Music className={cn("text-muted-foreground/50", sizeConfig.icon)} />
        </div>
      )}
      <div 
        className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden="true"
      >
        <Music className={cn("text-foreground/80", sizeConfig.icon)} />
      </div>
    </div>
  )
}

export const RadioStationImage = memo(BaseRadioStationImage) 