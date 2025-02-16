import { NextRequest, NextResponse } from 'next/server'
import { radioStations } from '@/data/audio'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const station = radioStations.find(s => s.id === params.id)
  
  if (!station) {
    return new NextResponse('Station not found', { status: 404 })
  }

  try {
    const response = await fetch(station.streamUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stream: ${response.statusText}`)
    }

    // Set appropriate headers for audio streaming
    const headers = new Headers()
    headers.set('Content-Type', 'audio/mpeg')
    headers.set('Cache-Control', 'no-cache')
    headers.set('Connection', 'keep-alive')

    return new NextResponse(response.body, { headers })
  } catch (error) {
    console.error('Stream error:', error)
    return new NextResponse('Failed to connect to stream', { status: 500 })
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