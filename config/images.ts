// Types for image configuration
type ImageConfig = {
  primary: string[]
  fallback: string
}

type StationImageConfig = {
  primary: string
  fallback: string
}

type GenreType = 'electronic' | 'lofi' | 'dance' | 'jazz' | 'classical' | 'rock' | 'ambient' | 'hiphop' | 'bollywood'
type StationType = 'lofi-girl' | 'dance-uk'

// Track which images are already assigned to prevent duplicates
const assignedImages = new Set<string>()

export const GENRE_IMAGES: Record<GenreType, ImageConfig> = {
  electronic: {
    primary: [
      'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?q=80&w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1628359355624-855775b5c9c7?q=80&w=800&h=800&fit=crop'
    ],
    fallback: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&h=800&fit=crop'
  },
  lofi: {
    primary: [
      'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?q=80&w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?q=80&w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=800&h=800&fit=crop'
    ],
    fallback: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=800&h=800&fit=crop'
  },
  dance: {
    primary: [
      'https://images.unsplash.com/photo-1574154894072-18ba0d48bd8f?q=80&w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&h=800&fit=crop'
    ],
    fallback: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?q=80&w=800&h=800&fit=crop'
  },
  jazz: {
    primary: [
      'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?q=80&w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=800&h=800&fit=crop'
    ],
    fallback: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?q=80&w=800&h=800&fit=crop'
  },
  classical: {
    primary: [
      'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1569701813229-33284b643e3c?q=80&w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=800&h=800&fit=crop'
    ],
    fallback: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=800&h=800&fit=crop'
  },
  rock: {
    primary: [
      'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?q=80&w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&h=800&fit=crop'
    ],
    fallback: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800&h=800&fit=crop'
  },
  ambient: {
    primary: [
      'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?q=80&w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1473773508845-188df298d2d1?q=80&w=800&h=800&fit=crop'
    ],
    fallback: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=800&h=800&fit=crop'
  },
  hiphop: {
    primary: [
      'https://images.unsplash.com/photo-1601643157091-ce5c665179ab?q=80&w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1520170350707-b2da59970118?q=80&w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1571609803959-0c6a4f2c0b7f?q=80&w=800&h=800&fit=crop'
    ],
    fallback: 'https://images.unsplash.com/photo-1571609803959-0c6a4f2c0b7f?q=80&w=800&h=800&fit=crop'
  },
  bollywood: {
    primary: [
      'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?q=80&w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1566275529824-cca6d008f3da?q=80&w=800&h=800&fit=crop'
    ],
    fallback: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=800&h=800&fit=crop'
  }
}

export const STATION_SPECIFIC_IMAGES: Record<StationType, StationImageConfig> = {
  'lofi-girl': {
    primary: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=800&h=800&fit=crop',
    fallback: '/radio-stations/lofi-girl.webp'
  },
  'dance-uk': {
    primary: 'https://images.unsplash.com/photo-1574154894072-18ba0d48bd8f?q=80&w=800&h=800&fit=crop',
    fallback: '/radio-stations/dance-uk.webp'
  }
} as const

export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?q=80&w=800&h=800&fit=crop'
export const LOCAL_FALLBACK_IMAGE = '/radio-stations/default-radio.jpg'

// Image size configuration for different devices
export const IMAGE_SIZES = {
  sm: {
    width: 96,
    height: 96,
    quality: 85
  },
  md: {
    width: 128,
    height: 128,
    quality: 85
  },
  lg: {
    width: 192,
    height: 192,
    quality: 85
  }
} as const

// Helper function to get the best available image for a station
export function getStationImage(stationId: string, genre: string): string {
  // Reset assigned images for each new session to prevent stale state
  if (assignedImages.size > 50) {
    assignedImages.clear()
  }

  // Check for station-specific image first
  if (isStationType(stationId) && stationId in STATION_SPECIFIC_IMAGES) {
    const image = STATION_SPECIFIC_IMAGES[stationId].primary
    assignedImages.add(image)
    return image
  }

  // Get genre-based images
  const normalizedGenre = genre.toLowerCase() as GenreType
  if (normalizedGenre in GENRE_IMAGES) {
    const genreImages = GENRE_IMAGES[normalizedGenre]
    
    // Create a unique hash based on station ID and genre
    const hash = stationId.split('').reduce((acc, char, index) => {
      return acc + (char.charCodeAt(0) * (index + 1) * (genre.length + 1))
    }, 0)
    
    // Filter out already assigned images
    const availableImages = genreImages.primary.filter(img => !assignedImages.has(img))
    
    if (availableImages.length > 0) {
      // Use hash to select an image
      const selectedImage = availableImages[Math.abs(hash) % availableImages.length]
      assignedImages.add(selectedImage)
      return selectedImage
    }
    
    // If all images are assigned, try to find an unused image from any genre
    const allImages = Object.values(GENRE_IMAGES).flatMap(g => g.primary)
    const unusedImages = allImages.filter(img => !assignedImages.has(img))
    
    if (unusedImages.length > 0) {
      const selectedImage = unusedImages[Math.abs(hash) % unusedImages.length]
      assignedImages.add(selectedImage)
      return selectedImage
    }
    
    // If still no image available, use genre fallback
    return genreImages.fallback
  }

  // Fallback to default if no matching genre
  return DEFAULT_FALLBACK_IMAGE
}

// Helper function to get fallback chain for a station
export function getStationFallbackChain(stationId: string, genre: string): string[] {
  const fallbacks: string[] = []

  // Add station-specific fallbacks
  if (isStationType(stationId) && stationId in STATION_SPECIFIC_IMAGES) {
    const stationImages = STATION_SPECIFIC_IMAGES[stationId]
    fallbacks.push(stationImages.fallback) // Only add fallback, primary is handled by getStationImage
  }

  // Add genre-based fallbacks
  const normalizedGenre = genre.toLowerCase() as GenreType
  if (normalizedGenre in GENRE_IMAGES) {
    const genreImages = GENRE_IMAGES[normalizedGenre]
    // Filter out any images that are used as primary images for specific stations
    const reservedImages = Object.values(STATION_SPECIFIC_IMAGES).map(config => config.primary)
    const availableFallbacks = genreImages.primary.filter(img => !reservedImages.includes(img))
    fallbacks.push(...availableFallbacks, genreImages.fallback)
  }

  // Add default fallbacks
  fallbacks.push(DEFAULT_FALLBACK_IMAGE, LOCAL_FALLBACK_IMAGE)

  return [...new Set(fallbacks)] // Remove duplicates
}

// Type guard for station types
function isStationType(stationId: string): stationId is StationType {
  return stationId in STATION_SPECIFIC_IMAGES
}

// Helper to generate image URL with size parameters
export function getOptimizedImageUrl(url: string, size: keyof typeof IMAGE_SIZES): string {
  const config = IMAGE_SIZES[size]
  if (url.includes('unsplash.com')) {
    return `${url}&w=${config.width}&h=${config.height}&q=${config.quality}`
  }
  return url
} 