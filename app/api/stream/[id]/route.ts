import { NextResponse } from 'next/server'
import { radioStations } from '@/data/radio-stations'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const station = radioStations.find(s => s.id === params.id)
    if (!station) {
      return new NextResponse('Station not found', { status: 404 })
    }

    // Use directStreamUrl instead of streamUrl to avoid proxy loop
    if (!station.directStreamUrl) {
      return new NextResponse('Direct stream URL not available', { status: 400 })
    }

    console.log('Proxying stream for:', station.name)
    console.log('Direct stream URL:', station.directStreamUrl)

    // Fetch the stream with appropriate headers
    const response = await fetch(station.directStreamUrl, {
      headers: {
        'User-Agent': 'V0MusicPlayer/1.0',
        'Accept': 'audio/*',
        'Origin': request.headers.get('origin') || '*',
        'Referer': request.headers.get('referer') || '*'
      }
    })

    if (!response.ok) {
      console.error('Stream fetch failed:', response.status, response.statusText)
      return new NextResponse('Stream not available', { status: response.status })
    }

    // Get content type from response or fallback to station format
    const contentType = response.headers.get('content-type') || station.format || 'audio/mpeg'
    console.log('Stream content type:', contentType)

    // Create response with appropriate headers
    const proxyResponse = new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Range',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Connection': 'keep-alive',
        'Transfer-Encoding': 'chunked',
        'X-Stream-Source': station.name
      }
    })

    return proxyResponse
  } catch (error) {
    console.error('Stream proxy error:', error)
    return new NextResponse(
      'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      { status: 500 }
    )
  }
} 