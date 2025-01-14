import { radioStations } from '@/data/audio'
import type { RadioStation } from '@/types/audio'

// Common audio MIME types and their extensions
const AUDIO_MIME_TYPES = {
  'audio/mpeg': ['mp3'],
  'audio/mp4': ['m4a', 'mp4a'],
  'audio/aac': ['aac'],
  'audio/ogg': ['ogg', 'oga'],
  'audio/opus': ['opus'],
  'audio/wav': ['wav'],
  'audio/webm': ['webm'],
  'audio/x-aiff': ['aif', 'aiff']
}

interface StreamInfo {
  url: string
  format: string | null
}

export async function getStreamUrl(url: string): Promise<StreamInfo> {
  // If it's already an absolute URL, return it
  if (url.startsWith('http')) {
    return {
      url,
      format: 'audio/mpeg' // Most common format for internet radio
    }
  }

  // If it's a relative URL (our API route), use it directly
  if (url.startsWith('/api/stream/')) {
    return {
      url,
      format: 'audio/mpeg'
    }
  }

  // For other URLs, try to detect format
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentType = response.headers.get('content-type')
    
    return {
      url,
      format: contentType
    }
  } catch (error) {
    console.warn('Failed to detect stream format:', error)
    return {
      url,
      format: null
    }
  }
}

export async function checkStreamStatus(url: string): Promise<boolean> {
  try {
    const headers: HeadersInit = {
      'Accept': Object.keys(AUDIO_MIME_TYPES).join(', '),
      'Range': 'bytes=0-0'
    }

    // Add origin for proxy requests
    if (url.startsWith('/api/stream/')) {
      headers['Origin'] = window.location.origin
    }

    const response = await fetch(url, {
      method: 'HEAD',
      headers
    })

    if (!response.ok && url.startsWith('/api/stream/')) {
      // If proxy fails, try direct URL
      const stationId = url.split('/').pop()
      const station = radioStations.find((s: RadioStation) => s.id === stationId)
      if (station?.directStreamUrl) {
        console.log('Checking direct URL status:', station.directStreamUrl)
        const directResponse = await fetch(station.directStreamUrl, {
          method: 'HEAD',
          headers: {
            'Accept': Object.keys(AUDIO_MIME_TYPES).join(', '),
            'Range': 'bytes=0-0'
          }
        })
        return directResponse.ok
      }
    }

    return response.ok
  } catch (error) {
    console.error('Stream status check failed:', error)
    return false
  }
}

