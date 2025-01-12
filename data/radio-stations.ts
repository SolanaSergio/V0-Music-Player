import type { RadioStation } from '@/types/audio'

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
    format: 'audio/mp3',
    bitrate: 128,
    region: 'Global',
    language: 'None',
    isLive: true,
    tags: ['ambient', 'sleep', 'relax']
  }
]

