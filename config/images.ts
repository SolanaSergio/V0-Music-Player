// Types for image configuration
type ImageConfig = {
  primary: string[]
  fallback: string
}

type StationImageConfig = {
  primary: string
  fallback: string
}

// Update GenreType to match available genres in GENRE_IMAGES
type GenreType = keyof typeof GENRE_IMAGES
type StationType = keyof typeof STATION_SPECIFIC_IMAGES

// Track which images are already assigned to prevent duplicates
const assignedImages = new Set<string>()

const STATION_IMAGES = {
  'lofi-hip-hop': '/stations/lofi-hip-hop.jpg',
  'classical': '/stations/classical.jpg',
  'jazz': '/stations/jazz.jpg',
  'electronic': '/stations/electronic.jpg',
  'ambient': '/stations/ambient.jpg',
  'rock': '/stations/rock.jpg',
  'pop': '/stations/pop.jpg',
  'indie': '/stations/indie.jpg',
  'metal': '/stations/metal.jpg',
  'blues': '/stations/blues.jpg',
  'reggae': '/stations/reggae.jpg',
  'folk': '/stations/folk.jpg',
} as const

const GENRE_IMAGES = {
  'electronic': '/genres/electronic.jpg',
  'classical': '/genres/classical.jpg',
  'jazz': '/genres/jazz.jpg',
  'ambient': '/genres/ambient.jpg',
  'rock': '/genres/rock.jpg',
  'pop': '/genres/pop.jpg',
  'indie': '/genres/indie.jpg',
  'metal': '/genres/metal.jpg',
  'blues': '/genres/blues.jpg',
  'reggae': '/genres/reggae.jpg',
  'folk': '/genres/folk.jpg',
} as const

const STATION_SPECIFIC_IMAGES = {
  'lofi-girl': {
    primary: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=800&h=800&fit=crop',
    fallback: '/radio-stations/lofi-girl.webp'
  },
  'dance-uk': {
    primary: 'https://images.unsplash.com/photo-1574154894072-18ba0d48bd8f?q=80&w=800&h=800&fit=crop',
    fallback: '/radio-stations/dance-uk.webp'
  }
} as const

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?q=80&w=800&h=800&fit=crop'
const LOCAL_FALLBACK_IMAGE = '/radio-stations/default-radio.jpg'

// Image size configuration for different devices
const IMAGE_SIZES = {
  sm: {
    width: 400,
    height: 225,
    quality: 85
  },
  md: {
    width: 640,
    height: 360,
    quality: 90
  },
  lg: {
    width: 1280,
    height: 720,
    quality: 95
  }
} as const

// Helper function to get the best available image for a station
function getStationImage(stationId: string, fallback = 'electronic'): string {
  return STATION_IMAGES[stationId as keyof typeof STATION_IMAGES] || STATION_IMAGES[fallback as keyof typeof STATION_IMAGES]
}

// Helper function to get fallback chain for a station
function getStationFallbackChain(stationId: string, genre: string): string[] {
  const fallbacks: string[] = []

  // Add station-specific fallbacks
  if (isStationType(stationId) && stationId in STATION_SPECIFIC_IMAGES) {
    const stationImages = STATION_SPECIFIC_IMAGES[stationId]
    fallbacks.push(stationImages.fallback)
  }

  // Add genre-based fallbacks
  const normalizedGenre = genre.toLowerCase()
  if (normalizedGenre in GENRE_IMAGES) {
    fallbacks.push(GENRE_IMAGES[normalizedGenre as GenreType])
  }

  // Add default fallbacks
  fallbacks.push(DEFAULT_FALLBACK_IMAGE, LOCAL_FALLBACK_IMAGE)

  // Remove duplicates and convert to array
  return Array.from(new Set(fallbacks))
}

// Type guard for station types
function isStationType(stationId: string): stationId is StationType {
  return stationId in STATION_SPECIFIC_IMAGES
}

// Helper to generate image URL with size parameters
function getOptimizedImageUrl(url: string, size: keyof typeof IMAGE_SIZES = 'md'): string {
  const config = IMAGE_SIZES[size]
  const baseUrl = process.env.NEXT_PUBLIC_CDN_URL || ''
  return `${baseUrl}${url}?w=${config.width}&h=${config.height}&q=${config.quality}&fit=crop`
}

function getGenreImage(genreId: string, fallback = 'electronic'): string {
  return GENRE_IMAGES[genreId as keyof typeof GENRE_IMAGES] || GENRE_IMAGES[fallback as keyof typeof GENRE_IMAGES]
}

module.exports = {
  STATION_IMAGES,
  GENRE_IMAGES,
  STATION_SPECIFIC_IMAGES,
  DEFAULT_FALLBACK_IMAGE,
  LOCAL_FALLBACK_IMAGE,
  IMAGE_SIZES,
  getStationImage,
  getStationFallbackChain,
  isStationType,
  getOptimizedImageUrl,
  getGenreImage
}