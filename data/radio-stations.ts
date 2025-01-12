export interface RadioStation {
  id: string
  name: string
  description: string
  streamUrl: string
  directStreamUrl?: string
  format?: string
  image: string
  tags: string[]
  isActive: boolean
}

export const radioStations: RadioStation[] = [
  {
    id: 'lofi-beats',
    name: 'Lofi Girl',
    description: 'Chill beats for studying and relaxing',
    streamUrl: '/api/stream/lofi-beats',
    directStreamUrl: 'https://play.streamafrica.net/lofiradio',
    format: 'audio/aac',
    image: '/images/stations/lofi-girl.jpg',
    tags: ['lofi', 'beats', 'chill', 'study'],
    isActive: true
  },
  {
    id: 'synthwave',
    name: 'Synthwave Radio',
    description: 'Retro synth vibes and electronic beats',
    streamUrl: '/api/stream/synthwave',
    directStreamUrl: 'http://stream.zeno.fm/f3wvbbqmdg8uv',
    format: 'audio/mpeg',
    image: '/images/stations/synthwave.jpg',
    tags: ['synthwave', 'electronic', 'retro'],
    isActive: true
  },
  {
    id: 'jazz-cafe',
    name: 'Jazz Café',
    description: 'Smooth jazz and coffee house vibes',
    streamUrl: '/api/stream/jazz-cafe',
    directStreamUrl: 'http://stream.zeno.fm/h59g4k7u7k8uv',
    format: 'audio/mpeg',
    image: '/images/stations/jazz-cafe.jpg',
    tags: ['jazz', 'smooth', 'cafe'],
    isActive: true
  },
  {
    id: 'ambient',
    name: 'Ambient Waves',
    description: 'Atmospheric and ambient soundscapes',
    streamUrl: '/api/stream/ambient',
    directStreamUrl: 'http://stream.zeno.fm/d853t8qmdg8uv',
    format: 'audio/mpeg',
    image: '/images/stations/ambient.jpg',
    tags: ['ambient', 'atmospheric', 'chill'],
    isActive: true
  }
]

