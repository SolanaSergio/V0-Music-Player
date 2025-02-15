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
    genre: 'lofi',
    image: '/radio-stations/lofi-girl.webp',
    streamUrl: '/api/stream/lofi-girl',
    directStreamUrl: 'https://stream.zeno.fm/fyn8eh3h5f8uv',
    format: 'audio/mpeg',
    bitrate: 64,
    region: 'Global',
    language: 'None',
    isLive: true,
    tags: ['lofi', 'beats', 'study', 'relax']
  },
  {
    id: 'synthwave-plaza',
    name: 'Synthwave Plaza',
    description: 'The best synthwave, retrowave, and dreamwave music',
    genre: 'electronic',
    image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=800&q=80',
    streamUrl: '/api/stream/synthwave-plaza',
    directStreamUrl: 'http://radio.plaza.one/mp3',
    format: 'audio/mp3',
    bitrate: 192,
    region: 'Global',
    language: 'None',
    isLive: true,
    tags: ['synthwave', 'retrowave', 'electronic']
  },
  {
    id: 'classical-radio',
    name: 'Classical Radio',
    description: 'Classical music from the greatest composers',
    genre: 'classical',
    image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&h=800&q=80',
    streamUrl: '/api/stream/classical-radio',
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
    streamUrl: '/api/stream/jazz-cafe',
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
    streamUrl: '/api/stream/ambient-sleep',
    directStreamUrl: 'https://radio.plaza.one/mp3_128',
    format: 'audio/mp3',
    bitrate: 128,
    region: 'Global',
    language: 'None',
    isLive: true,
    tags: ['ambient', 'sleep', 'relax']
  },
  {
    id: 'hits-uk',
    name: 'Hits Radio UK',
    description: 'The biggest hits and newest music',
    genre: 'electronic',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=800&q=80',
    streamUrl: '/api/stream/hits-uk',
    directStreamUrl: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one',
    format: 'audio/mp3',
    bitrate: 128,
    region: 'UK',
    language: 'English',
    isLive: true,
    tags: ['pop', 'hits', 'charts', 'mainstream']
  },
  {
    id: 'dance-uk',
    name: 'Dance UK Radio',
    description: 'Non-stop dance hits and electronic music',
    genre: 'dance',
    image: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=800&h=800&q=80',
    streamUrl: '/api/stream/dance-uk',
    directStreamUrl: 'https://stream.danceradiouk.com/stream',
    format: 'audio/mp3',
    bitrate: 192,
    region: 'UK',
    language: 'English',
    isLive: true,
    tags: ['dance', 'electronic', 'house', 'trance']
  },
  {
    id: 'rock-radio',
    name: 'Rock Radio',
    description: 'Classic and modern rock hits',
    genre: 'rock',
    image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&h=800&q=80',
    streamUrl: '/api/stream/rock-radio',
    directStreamUrl: 'https://stream.rockradio.com/stream',
    format: 'audio/mp3',
    bitrate: 192,
    region: 'Global',
    language: 'English',
    isLive: true,
    tags: ['rock', 'alternative', 'metal', 'indie']
  },
  {
    id: 'hip-hop-radio',
    name: 'Hip Hop Radio',
    description: 'The best in hip hop and R&B',
    genre: 'hiphop',
    image: 'https://images.unsplash.com/photo-1601643157091-ce5c665179ab?w=800&h=800&q=80',
    streamUrl: '/api/stream/hip-hop-radio',
    directStreamUrl: 'https://audiotainment-sw.streamabc.net/atsw-oldschoolhiphop-mp3-128-3940912?sABC=6786p53n%230%234r5q86q2p996740q6618532s7r720pp0%23&aw_0_1st.playerid=&amsparams=playerid:;skey:1736885562',
    format: 'audio/mp3',
    bitrate: 128,
    region: 'Global',
    language: 'English',
    isLive: true,
    tags: ['hip hop', 'rap', 'r&b', 'urban', 'old school']
  },
  {
    id: 'bollywood-hits',
    name: 'Bollywood Hits',
    description: 'Latest and greatest Bollywood music',
    genre: 'bollywood',
    image: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&h=800&q=80',
    streamUrl: '/api/stream/bollywood-hits',
    directStreamUrl: 'https://stream.zeno.fm/h7n8ug96eeruv',
    format: 'audio/mp3',
    bitrate: 128,
    region: 'India',
    language: 'Hindi',
    isLive: true,
    tags: ['bollywood', 'hindi', 'indian', 'pop']
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

