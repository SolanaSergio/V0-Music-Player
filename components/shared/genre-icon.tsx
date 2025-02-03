'use client'

import { Music, Piano, Guitar, CloudRain } from 'lucide-react'

const iconMap = {
  'electronic': Music,
  'classical': Piano,
  'jazz': Guitar,
  'ambient': CloudRain,
} as const

type GenreIconProps = {
  genre: keyof typeof iconMap
  className?: string
}

export function GenreIcon({ genre, className }: GenreIconProps) {
  const Icon = iconMap[genre]
  return <Icon className={className} />
} 