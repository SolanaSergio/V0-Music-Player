import { radioStations } from '@/data/radio-stations'

interface StreamResponse {
  url: string
  format: string | null
  isProxy: boolean
  error?: {
    code: string
    message: string
  }
}

export async function getStreamUrl(url: string): Promise<StreamResponse> {
  console.log('Getting stream URL for:', url)
  
  try {
    // If already a proxy URL, extract station ID
    const stationId = url.startsWith('/api/stream/') 
      ? url.split('/').pop()
      : url.includes('zeno.fm') 
        ? 'lofi-beats' // Handle Zeno.fm URL specifically
        : null

    if (!stationId) {
      console.log('No station ID found, using direct URL')
      return { url, format: null, isProxy: false }
    }

    // Find station to get direct URL if needed
    const station = radioStations.find(s => s.id === stationId)
    if (!station) {
      console.log('Station not found, using provided URL')
      return { url, format: null, isProxy: false }
    }

    // Use our proxy endpoint
    const proxyUrl = `/api/stream/${stationId}`
    console.log('Using proxy URL:', proxyUrl)

    // Test proxy connection
    console.log('Testing proxy connection...')
    const headResponse = await fetch(proxyUrl, { 
      method: 'HEAD',
      headers: {
        'Accept': 'audio/*'
      }
    })
    
    console.log('HEAD response status:', headResponse.status)
    console.log('Content-Type:', headResponse.headers.get('content-type'))
    
    if (!headResponse.ok) {
      console.log('Proxy HEAD request failed, trying direct stream')
      // Try direct stream URL if proxy fails
      const directUrl = station.directStreamUrl || url
      console.log('Using direct URL:', directUrl)
      
      const directResponse = await fetch(directUrl, {
        method: 'HEAD',
        headers: {
          'Accept': 'audio/*'
        }
      })

      if (!directResponse.ok) {
        console.error('Both proxy and direct stream failed')
        throw new Error('Unable to connect to stream')
      }

      const contentType = directResponse.headers.get('content-type')
      return { 
        url: directUrl,
        format: contentType ?? null,
        isProxy: false
      }
    }

    const contentType = headResponse.headers.get('content-type')
    return { 
      url: proxyUrl,
      format: contentType ?? null,
      isProxy: true
    }
    
  } catch (error) {
    console.error('Error getting stream URL:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    // On error, try to find and use direct URL as last resort
    if (url.startsWith('/api/stream/')) {
      const stationId = url.split('/').pop()
      const station = radioStations.find(s => s.id === stationId)
      if (station?.directStreamUrl) {
        console.log('Falling back to direct URL:', station.directStreamUrl)
        return { 
          url: station.directStreamUrl,
          format: station.format ?? null,
          isProxy: false,
          error: {
            code: 'PROXY_FAILED',
            message: `Proxy failed, using direct URL. Original error: ${errorMessage}`
          }
        }
      }
    }
    
    // If all else fails, return original URL with error
    return { 
      url, 
      format: null,
      isProxy: false,
      error: {
        code: 'STREAM_ERROR',
        message: errorMessage
      }
    }
  }
}

export async function checkStreamStatus(url: string): Promise<boolean> {
  try {
    const headers: HeadersInit = {
      'Accept': 'audio/*'
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
      const station = radioStations.find(s => s.id === stationId)
      if (station?.directStreamUrl) {
        console.log('Checking direct URL status:', station.directStreamUrl)
        const directResponse = await fetch(station.directStreamUrl, {
          method: 'HEAD',
          headers: { 'Accept': 'audio/*' }
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

