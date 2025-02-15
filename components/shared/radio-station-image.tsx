'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface RadioStationImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
}

export function RadioStationImage({
  src,
  alt,
  className,
  width = 400,
  height = 400,
}: RadioStationImageProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="object-cover w-full h-full"
      />
    </div>
  )
}