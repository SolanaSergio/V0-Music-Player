import { NextRequest, NextResponse } from 'next/server'
import { radioStations } from '@/data/radio-stations'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Stream request received for station:', params.id)
    
    const station = radioStations.find(s => s.id === params.id)
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
    console.log('Direct URL:', directUrl)

    // Prepare request headers
    const headers = new Headers({
      'Accept': '*/*',
      'User-Agent': 'V0MusicPlayer/1.0',
      'Origin': request.headers.get('origin') || '*',
      'Referer': request.headers.get('referer') || '*'
    })

    // Forward range header if present
    const range = request.headers.get('range')
    if (range) {
      console.log('Forwarding range header:', range)
      headers.set('range', range)
    }

    try {
      const response = await fetch(directUrl, {
        headers,
        method: 'GET',
        cache: 'no-store'
      })

      if (!response.ok) {
        console.error('Stream fetch failed:', response.status, response.statusText)
        return new NextResponse('Stream fetch failed', { status: response.status })
      }

      // Get the content type and other headers from the response
      const contentType = response.headers.get('content-type')
      const contentLength = response.headers.get('content-length')
      const acceptRanges = response.headers.get('accept-ranges')

      // Prepare response headers
      const responseHeaders = new Headers({
        'Content-Type': contentType || 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Range',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      })

      if (contentLength) {
        responseHeaders.set('Content-Length', contentLength)
      }
      if (acceptRanges) {
        responseHeaders.set('Accept-Ranges', acceptRanges)
      }
      if (range && response.status === 206) {
        responseHeaders.set('Content-Range', response.headers.get('content-range')!)
      }

      return new NextResponse(response.body, {
        status: response.status,
        headers: responseHeaders,
      })

    } catch (error) {
      console.error('Stream proxy error:', error)
      return new NextResponse('Stream proxy error', { status: 500 })
    }
  } catch (error) {
    console.error('Stream handler error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
      'Access-Control-Max-Age': '86400',
    },
  })
} 