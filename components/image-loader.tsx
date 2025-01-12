'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { Music } from 'lucide-react'

interface ImageLoaderProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string
  fallback?: string
  alt: string
}

export function ImageLoader({
  src,
  fallback = '/images/fallback.jpg',
  alt,
  className,
  ...props
}: ImageLoaderProps) {
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={className}>
      {error ? (
        <div className="relative flex items-center justify-center bg-muted h-full w-full">
          <Music className="h-12 w-12 text-muted-foreground" />
        </div>
      ) : (
        <>
          <Image
            src={error ? fallback : src}
            alt={alt}
            className={`transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onError={() => setError(true)}
            onLoadingComplete={() => setIsLoading(false)}
            {...props}
          />
          {isLoading && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
        </>
      )}
    </div>
  )
}

