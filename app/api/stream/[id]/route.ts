import { NextRequest, NextResponse } from 'next/server'
import { radioStations } from '@/data/audio'
import type { RadioStation } from '@/types/audio'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const ALLOWED_CONTENT_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/aac',
  'audio/aacp',
  'audio/ogg',
  'application/ogg',
  'audio/opus',
  'audio/webm',
  '*/*'
]

const CHUNK_SIZE = 64 * 1024; // 64KB chunks for better mobile performance

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Stream request received for station:', params.id)
    
    const station = radioStations.find((s: RadioStation) => s.id === params.id)
    if (!station) {
      console.error('Station not found:', params.id)
      return new NextResponse('Station not found', { status: 404 })
    }

    const directUrl = station.directStreamUrl || station.streamUrl
    if (!directUrl) {
      console.error('No stream URL found for station:', params.id)
      return new NextResponse('Stream URL not found', { status: 404 })
    }

    console.log('Proxying stream for station:', station.name, 'URL:', directUrl)

    // Detect if request is from mobile
    const userAgent = request.headers.get('user-agent') || ''
    const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)

    // Prepare request headers with optimized settings for mobile
    const headers = new Headers({
      'Accept': ALLOWED_CONTENT_TYPES.join(', '),
      'User-Agent': 'Mozilla/5.0 (compatible; V0MusicPlayer/1.0)',
      'Origin': request.headers.get('origin') || '*',
      'Referer': request.headers.get('referer') || '*',
      'Connection': 'keep-alive'
    })

    // Forward range header if present
    const range = request.headers.get('range')
    if (range) {
      console.log('Forwarding range header:', range)
      headers.set('Range', range)
    }

    try {
      const response = await fetch(directUrl, {
        headers,
        method: 'GET',
        cache: 'no-store',
        redirect: 'follow'
      })

      if (!response.ok && response.status !== 206) {
        console.error('Stream fetch failed:', {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          url: directUrl
        })
        return new NextResponse('Stream fetch failed', { status: response.status })
      }

      // Get and validate content type
      let contentType = response.headers.get('content-type')
      console.log('Original content type:', contentType)

      // Use the station's configured format if available and valid
      if (station.format && ALLOWED_CONTENT_TYPES.includes(station.format)) {
        contentType = station.format
      } else if (!contentType || !ALLOWED_CONTENT_TYPES.some(type => 
        contentType!.toLowerCase().includes(type.replace('*/*', ''))
      )) {
        // Fallback format detection
        if (directUrl.includes('.mp3') || directUrl.includes('mpeg')) {
          contentType = 'audio/mpeg'
        } else if (directUrl.includes('.aac')) {
          contentType = 'audio/aac'
        } else if (directUrl.includes('.ogg')) {
          contentType = 'audio/ogg'
        } else {
          contentType = 'audio/mpeg' // Default to MP3
        }
        console.log('Using detected content type:', contentType)
      }

      // Prepare response headers with optimized settings
      const responseHeaders = new Headers({
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, Origin, Content-Type, Accept',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff',
        'Accept-Ranges': 'bytes',
        'Connection': 'keep-alive'
      })

      // Set chunked transfer for better mobile streaming
      if (isMobile) {
        responseHeaders.set('Transfer-Encoding', 'chunked')
      }

      // Forward important headers if present
      const contentLength = response.headers.get('content-length')
      if (contentLength) {
        responseHeaders.set('Content-Length', contentLength)
      }
      
      if (range && response.status === 206) {
        const contentRange = response.headers.get('content-range')
        if (contentRange) {
          responseHeaders.set('Content-Range', contentRange)
        }
      }

      // Create a TransformStream to handle chunked transfer if needed
      const { readable, writable } = new TransformStream({
        transform(chunk, controller) {
          controller.enqueue(chunk)
        },
      })

      // Start the stream
      response.body?.pipeTo(writable)

      return new NextResponse(readable, {
        status: response.status,
        headers: responseHeaders,
        statusText: response.statusText
      })

    } catch (error) {
      console.error('Stream proxy error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        station: station.name,
        url: directUrl
      })
      return new NextResponse(
        'Stream proxy error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Stream handler error:', error)
    return new NextResponse(
      'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Origin, Content-Type, Accept',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
      'Access-Control-Max-Age': '86400',
    },
  })
} 