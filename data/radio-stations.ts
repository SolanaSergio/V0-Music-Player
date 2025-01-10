export const radioStations: RadioStation[] = [
  {
    id: 'lofi-beats',
    name: 'Lo-Fi Beats',
    genre: 'electronic',
    imageUrl: 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=800&h=800&q=80',
    fallbackImage: '/images/radio-fallback.jpg',
    streamUrl: 'http://usa9.fastcast4u.com/proxy/jamz?mp=/1',
    description: 'Lo-fi beats for relaxation and focus.',
    isLive: true,
    tags: ['lofi', 'beats', 'chill'],
    format: 'audio/mpeg',
    bitrate: 128,
    region: 'Global',
    language: 'None'
  },
  {
    id: 'classical-radio',
    name: 'Classical Radio',
    genre: 'classical',
    imageUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&h=800&q=80',
    fallbackImage: '/images/radio-fallback.jpg',
    streamUrl: 'http://live.str3am.com:2850/live',
    description: 'Classical music from renowned composers.',
    isLive: true,
    tags: ['classical', 'orchestra', 'piano'],
    format: 'audio/mpeg',
    bitrate: 128,
    region: 'Europe',
    language: 'English'
  },
  {
    id: 'smooth-jazz',
    name: 'Smooth Jazz',
    genre: 'jazz',
    imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=800&q=80',
    fallbackImage: '/images/radio-fallback.jpg',
    streamUrl: 'http://usa9.fastcast4u.com/proxy/smoothjazz?mp=/1',
    description: 'Smooth jazz for your relaxation.',
    isLive: true,
    tags: ['jazz', 'smooth', 'relaxing'],
    format: 'audio/mpeg',
    bitrate: 128,
    region: 'USA',
    language: 'English'
  },
  {
    id: 'ambient-sleep',
    name: 'Ambient Sleep',
    genre: 'ambient',
    imageUrl: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?w=800&h=800&q=80',
    fallbackImage: '/images/radio-fallback.jpg',
    streamUrl: 'http://ice1.somafm.com/dronezone-128-mp3',
    description: 'Ambient sounds for sleep and relaxation.',
    isLive: true,
    tags: ['ambient', 'sleep', 'relaxation'],
    format: 'audio/mpeg',
    bitrate: 128,
    region: 'Global',
    language: 'None'
  }
]

