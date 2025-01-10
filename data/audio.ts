import { Music, Piano, Guitar, CloudRain } from 'lucide-react'
import type { Genre, RadioStation, Track } from '@/types/audio'

export const genres: Genre[] = [
  {
    id: 'electronic',
    name: 'Electronic',
    description: 'Electronic music and beats',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&q=80',
    icon: Music
  },
  {
    id: 'classical',
    name: 'Classical',
    description: 'Classical music and orchestral pieces',
    imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&h=600&q=80',
    icon: Piano
  },
  {
    id: 'jazz',
    name: 'Jazz',
    description: 'Jazz and blues music',
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=600&q=80',
    icon: Guitar
  },
  {
    id: 'ambient',
    name: 'Ambient',
    description: 'Atmospheric and environmental sounds',
    imageUrl: 'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=800&h=600&q=80',
    icon: CloudRain
  }
]

export const radioStations: RadioStation[] = [
  {
    id: 'lofi-girl',
    name: 'Lo-Fi Girl',
    genre: 'electronic',
    imageUrl: 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=800&h=800&q=80',
    fallbackImage: '/images/genres/electronic.jpg',
    streamUrl: 'https://play.streamafrica.net/lofiradio',
    description: 'Lo-fi beats to relax/study to.',
    isLive: true,
    tags: ['lofi', 'beats', 'chill']
  },
  {
    id: 'classical-radio',
    name: 'Classical Radio',
    genre: 'classical',
    imageUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&h=800&q=80',
    fallbackImage: '/images/genres/classical.jpg',
    streamUrl: 'https://live.musopen.org:8085/streamvbr0',
    description: 'Classical music from renowned composers.',
    isLive: true,
    tags: ['classical', 'orchestra', 'piano']
  },
  {
    id: 'jazz-cafe',
    name: 'Jazz Café',
    genre: 'jazz',
    imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=800&q=80',
    fallbackImage: '/images/genres/jazz.jpg',
    streamUrl: 'https://strw1.openstream.co/589',
    description: 'The finest selection of jazz music.',
    isLive: true,
    tags: ['jazz', 'smooth', 'relaxing']
  },
  {
    id: 'ambient-sleep',
    name: 'Ambient Sleep',
    genre: 'ambient',
    imageUrl: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?w=800&h=800&q=80',
    fallbackImage: '/images/genres/ambient.jpg',
    streamUrl: 'https://radio4.cdm-radio.com:18004/stream-mp3-Chill',
    description: 'Ambient music for relaxation and sleep.',
    isLive: true,
    tags: ['ambient', 'sleep', 'relaxation']
  }
]

export const featuredTracks: Track[] = [
  {
    id: 'lofi-girl',
    title: 'Lo-Fi Girl',
    artist: 'Lo-Fi Radio',
    genre: 'electronic',
    imageUrl: 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=800&h=800&q=80',
    fallbackImage: '/images/genres/electronic.jpg',
    audioUrl: 'https://streams.ilovemusic.de/iloveradio17.mp3',
    isLive: true
  },
  {
    id: 'classical-radio',
    title: 'Classical Radio',
    artist: 'Classical Music',
    genre: 'classical',
    imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&h=800&q=80',
    fallbackImage: '/images/genres/classical.jpg',
    audioUrl: 'https://streams.ilovemusic.de/iloveradio21.mp3',
    isLive: true
  },
  {
    id: 'ambient-sleep',
    title: 'Ambient Sleep',
    artist: 'Ambient Radio',
    genre: 'ambient',
    imageUrl: 'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=800&h=800&q=80',
    fallbackImage: '/images/genres/ambient.jpg',
    audioUrl: 'https://streams.ilovemusic.de/iloveradio20.mp3',
    isLive: true
  }
]

