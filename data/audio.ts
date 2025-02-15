import type { RadioStation, Track } from '@/types/audio'

export const genres = [
  {
    id: 'electronic',
    name: 'Electronic',
    description: 'Modern electronic music from various subgenres',
    icon: 'waveform',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=800&fit=crop&q=80'
  },
  {
    id: 'classical',
    name: 'Classical',
    description: 'Timeless classical music from renowned composers',
    icon: 'music',
    image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&h=800&fit=crop&q=80'
  },
  {
    id: 'jazz',
    name: 'Jazz',
    description: 'Smooth jazz and classic jazz recordings',
    icon: 'saxophone',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=800&fit=crop&q=80'
  },
  {
    id: 'ambient',
    name: 'Ambient',
    description: 'Atmospheric and ambient soundscapes',
    icon: 'waves',
    image: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?w=800&h=800&fit=crop&q=80'
  }
]

export const radioStations: RadioStation[] = [
  {
    id: 'lofi-beats',
    name: 'Lofi Beats',
    description: 'Chill beats to relax/study to',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=800&fit=crop&q=80',
    streamUrl: 'https://stream.lofibeats.com/live',
    genre: 'electronic',
    listeners: 25,
    isLive: true,
    country: 'United States',
    language: 'en',
    format: 'MP3',
    bitrate: 320,
    trending: true,
    featured: true,
    tags: ['lofi', 'beats', 'chill']
  },
  {
    id: 'classical-radio',
    name: 'Classical Radio',
    description: 'The finest classical music from renowned composers',
    image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&h=800&fit=crop&q=80',
    streamUrl: 'https://stream.classical-radio.com/live',
    genre: 'classical',
    listeners: 12,
    isLive: true,
    country: 'Germany',
    language: 'en',
    format: 'MP3',
    bitrate: 320,
    tags: ['classical', 'orchestra', 'symphony']
  },
  {
    id: 'jazz-cafe',
    name: 'Jazz Café',
    description: 'Smooth jazz for your coffee break',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=800&fit=crop&q=80',
    streamUrl: 'https://stream.jazzcafe.com/live',
    genre: 'jazz',
    listeners: 18,
    isLive: true,
    country: 'France',
    language: 'fr',
    format: 'MP3',
    bitrate: 320,
    trending: true,
    tags: ['jazz', 'smooth', 'cafe']
  },
  {
    id: 'ambient-waves',
    name: 'Ambient Waves',
    description: 'Soothing ambient soundscapes',
    image: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?w=800&h=800&fit=crop&q=80',
    streamUrl: 'https://stream.ambientwaves.com/live',
    genre: 'ambient',
    listeners: 15,
    isLive: true,
    country: 'Iceland',
    language: 'en',
    format: 'MP3',
    bitrate: 320,
    featured: true,
    tags: ['ambient', 'atmospheric', 'relaxation']
  }
]

export const tracks: Track[] = [
  {
    id: 'ambient-dreams',
    title: 'Ambient Dreams',
    artist: 'Dreamscape',
    album: 'Night Visions',
    duration: 245,
    artwork: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?w=800&h=800&fit=crop&q=80',
    streamUrl: '/audio/ambient-dreams.mp3'
  }
]

export const featuredTracks: Track[] = [
  {
    id: 'midnight-lofi',
    title: 'Midnight Lofi',
    artist: 'Lofi Dreamer',
    album: 'Late Night Sessions',
    duration: 183,
    artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=800&fit=crop&q=80',
    streamUrl: '/audio/midnight-lofi.mp3'
  },
  {
    id: 'classical-serenity',
    title: 'Classical Serenity',
    artist: 'Symphony Orchestra',
    album: 'Timeless Classics',
    duration: 246,
    artwork: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&h=800&fit=crop&q=80',
    streamUrl: '/audio/classical-serenity.mp3'
  },
  {
    id: 'jazz-moments',
    title: 'Jazz Moments',
    artist: 'The Jazz Quartet',
    album: 'Smooth Sessions',
    duration: 198,
    artwork: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=800&fit=crop&q=80',
    streamUrl: '/audio/jazz-moments.mp3'
  },
  {
    id: 'ambient-dreams',
    title: 'Ambient Dreams',
    artist: 'Dreamscape',
    album: 'Night Visions',
    duration: 245,
    artwork: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?w=800&h=800&fit=crop&q=80',
    streamUrl: '/audio/ambient-dreams.mp3'
  }
]

