'use client'

import { useState, useCallback, memo, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

interface ImageLoaderProps extends Omit<ImageProps, 'src' | 'alt'> {
  src?: string | null
  alt: string
  fallback?: string
  onError?: () => void
  /** Optional CSS class name for the container */
  className?: string
  /** Optional loading priority */
  priority?: boolean
  /** Optional callback when image loads */
  onLoadingComplete?: (img: HTMLImageElement) => void
}

const BaseImageLoader = ({
  src,
  alt,
  fallback = '/placeholder.jpg',
  onError,
  ...props
}: ImageLoaderProps): JSX.Element => {
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Reset error state when src changes
  useEffect(() => {
    setError(false)
    setIsLoading(true)
  }, [src])

  const handleError = useCallback(() => {
    setError(true)
    setIsLoading(false)
    onError?.()
  }, [onError])

  // Convert relative paths to absolute URLs
  const imageSrc = src && typeof src === 'string' && src.startsWith('/') ? src : src || fallback
  const fallbackSrc = fallback && fallback.startsWith('/') ? fallback : fallback

  // If the image is a relative path that doesn't exist in public, use fallback
  const finalSrc = error ? fallbackSrc : imageSrc

  return (
    <div className={cn(
      'relative overflow-hidden',
      isLoading && 'animate-pulse bg-muted',
      props.className
    )}>
      <Image
        {...props}
        src={finalSrc}
        alt={alt}
        onError={handleError}
        onLoadingComplete={() => setIsLoading(false)}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          props.className
        )}
      />
    </div>
  )
}

type ImageLoaderComponent = React.NamedExoticComponent<ImageLoaderProps>
export const ImageLoader: ImageLoaderComponent = memo(BaseImageLoader)

