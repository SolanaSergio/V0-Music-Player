import type { Genre, RadioStation, Track } from '@/types/audio'

export const genres: Genre[] = [
  {
    id: 'electronic',
    name: 'Electronic',
    description: 'Electronic music and beats',
    image: 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=800&h=800&q=80',
    icon: 'electronic'
  },
  {
    id: 'classical',
    name: 'Classical',
    description: 'Classical music and orchestral pieces',
    image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&h=800&q=80',
    icon: 'classical'
  },
  {
    id: 'jazz',
    name: 'Jazz',
    description: 'Jazz and blues music',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=800&q=80',
    icon: 'jazz'
  },
  {
    id: 'ambient',
    name: 'Ambient',
    description: 'Ambient and atmospheric music',
    image: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?w=800&h=800&q=80',
    icon: 'ambient'
  }
]

export const radioStations: RadioStation[] = [
  {
    id: 'lofi-girl',
    name: 'Lofi Girl',
    description: 'Lo-fi beats to relax/study to',
    genre: 'electronic',
    image: 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=800&h=800&q=80',
    streamUrl: '/api/stream/lofi-girl',
    directStreamUrl: 'https://ilm.stream35.radiohost.de/ilm_ilovechillhop_mp3-192',
    format: 'audio/mp3',
    bitrate: 192,
    region: 'Global',
    language: 'None',
    isLive: true,
    tags: ['lofi', 'beats', 'study', 'relax']
  },
  {
    id: 'classical-radio',
    name: 'Classical Radio',
    description: 'Classical music from the greatest composers',
    genre: 'classical',
    image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&h=800&q=80',
    streamUrl: 'https://streams.ilovemusic.de/iloveradio21.mp3',
    directStreamUrl: 'https://live.musopen.org:8085/streamvbr0',
    format: 'audio/mp3',
    bitrate: 128,
    region: 'Global',
    language: 'None',
    isLive: true,
    tags: ['classical', 'orchestra', 'symphony']
  },
  {
    id: 'jazz-cafe',
    name: 'Jazz Café',
    description: 'Smooth jazz for your coffee break',
    genre: 'jazz',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=800&q=80',
    streamUrl: 'https://streams.ilovemusic.de/iloveradio22.mp3',
    directStreamUrl: 'https://strw1.openstream.co/589',
    format: 'audio/mp3',
    bitrate: 128,
    region: 'Global',
    language: 'None',
    isLive: true,
    tags: ['jazz', 'smooth', 'cafe']
  },
  {
    id: 'ambient-sleep',
    name: 'Ambient Sleep',
    description: 'Ambient sounds for peaceful sleep',
    genre: 'ambient',
    image: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?w=800&h=800&q=80',
    streamUrl: 'https://streams.ilovemusic.de/iloveradio20.mp3',
    directStreamUrl: 'https://radio4.cdm-radio.com:18004/stream-mp3-Chill',
    format: 'audio/mp3',
    bitrate: 128,
    region: 'Global',
    language: 'None',
    isLive: true,
    tags: ['ambient', 'sleep', 'relax']
  }
]

export const featuredTracks: Track[] = [
  {
    id: 'track-1',
    title: 'Midnight Groove',
    artist: 'DJ Shadow',
    album: 'Deep Cuts',
    duration: 245,
    genre: 'electronic',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&q=80',
    audioUrl: '/audio/track-1.mp3'
  },
  {
    id: 'track-2',
    title: 'Ocean Waves',
    artist: 'Ambient Collective',
    album: 'Nature Sounds',
    duration: 180,
    genre: 'ambient',
    image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&h=600&q=80',
    audioUrl: '/audio/track-2.mp3'
  },
  {
    id: 'track-3',
    title: 'Jazz Cafe',
    artist: 'The Quartet',
    album: 'Late Night Sessions',
    duration: 320,
    genre: 'jazz',
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=600&q=80',
    audioUrl: '/audio/track-3.mp3'
  },
  {
    id: 'track-4',
    title: 'Classical Dreams',
    artist: 'Symphony Orchestra',
    album: 'Moonlight Sonatas',
    duration: 420,
    genre: 'classical',
    image: 'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=800&h=600&q=80',
    audioUrl: '/audio/track-4.mp3'
  }
]

