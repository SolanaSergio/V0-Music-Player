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
    const station = radioStations.find(s => s.id === params.id)
    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 })
    }

    const streamUrl = station.directStreamUrl || station.streamUrl
    if (!streamUrl) {
      return NextResponse.json({ error: 'Stream URL not found' }, { status: 404 })
    }

    const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(request.headers.get('user-agent') || '')

    const headers = new Headers({
      'Accept': ALLOWED_CONTENT_TYPES.join(', '),
      'User-Agent': 'Mozilla/5.0 (compatible; V0MusicPlayer/1.0)',
      'Origin': request.headers.get('origin') || '*',
      'Referer': request.headers.get('referer') || '*',
      'Connection': 'keep-alive'
    })

    const range = request.headers.get('range')
    if (range) {
      headers.set('Range', range)
    }

    const response = await fetch(streamUrl, {
      headers,
      method: 'GET',
      cache: 'no-store',
      redirect: 'follow'
    })

    if (!response.ok && response.status !== 206) {
      return NextResponse.json({ error: 'Stream fetch failed' }, { status: response.status })
    }

    let contentType = response.headers.get('content-type')
    if (station.format && ALLOWED_CONTENT_TYPES.includes(station.format)) {
      contentType = station.format
    } else if (!contentType || !ALLOWED_CONTENT_TYPES.some(type => 
      contentType!.toLowerCase().includes(type.replace('*/*', ''))
    )) {
      contentType = streamUrl.includes('.mp3') || streamUrl.includes('mpeg') ? 'audio/mpeg' :
                   streamUrl.includes('.aac') ? 'audio/aac' :
                   streamUrl.includes('.ogg') ? 'audio/ogg' :
                   'audio/mpeg'
    }

    const responseHeaders = new Headers({
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Origin, Content-Type, Accept',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Accept-Ranges': 'bytes'
    })

    if (isMobile) {
      responseHeaders.set('Transfer-Encoding', 'chunked')
    }

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

    const { readable, writable } = new TransformStream()
    response.body?.pipeTo(writable)

    return new NextResponse(readable, {
      status: response.status,
      headers: responseHeaders,
      statusText: response.statusText
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
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