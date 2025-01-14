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

    console.log('Proxying stream for station:', station.name)

    // Prepare request headers with all necessary audio types
    const headers = new Headers({
      'Accept': ALLOWED_CONTENT_TYPES.join(', '),
      'User-Agent': 'V0MusicPlayer/1.0',
      'Origin': request.headers.get('origin') || '*',
      'Referer': request.headers.get('referer') || '*'
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
        console.error('Stream fetch failed:', response.status, response.statusText)
        return new NextResponse('Stream fetch failed', { status: response.status })
      }

      // Get and validate content type
      let contentType = response.headers.get('content-type')
      if (!contentType || !ALLOWED_CONTENT_TYPES.some(type => 
        contentType!.toLowerCase().includes(type.replace('*/*', ''))
      )) {
        contentType = 'audio/mpeg' // Default to MP3 if unknown
      }

      // Get other important headers
      const contentLength = response.headers.get('content-length')
      const acceptRanges = response.headers.get('accept-ranges')
      const contentRange = response.headers.get('content-range')

      // Prepare response headers with complete CORS and caching configuration
      const responseHeaders = new Headers({
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, Origin, Content-Type, Accept',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff'
      })

      // Forward important headers if present
      if (contentLength) {
        responseHeaders.set('Content-Length', contentLength)
      }
      if (acceptRanges) {
        responseHeaders.set('Accept-Ranges', acceptRanges)
      }
      if (range && response.status === 206 && contentRange) {
        responseHeaders.set('Content-Range', contentRange)
      }

      return new NextResponse(response.body, {
        status: response.status,
        headers: responseHeaders,
        statusText: response.statusText
      })

    } catch (error) {
      console.error('Stream proxy error:', error)
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