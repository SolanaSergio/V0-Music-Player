import { NextRequest, NextResponse } from 'next/server'

async function fetchStreamMetadata(url: string) {
  try {
    // Ensure the URL is absolute
    if (!url.startsWith('http')) {
      throw new Error('Invalid stream URL')
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Icy-MetaData': '1',
        'User-Agent': 'V0MusicPlayer/1.0',
        'Accept': 'audio/mpeg, audio/mp3, */*'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch stream')
    }

    // Try to get metadata from various headers and formats
    const icyMetadata = response.headers.get('icy-metadata')
    const icyName = response.headers.get('icy-name')
    const icyTitle = response.headers.get('icy-title') // Some stations use this
    const icyDescription = response.headers.get('icy-description')
    const xMetadata = response.headers.get('x-metadata') // Some stations use this format

    // Combine all possible metadata sources
    const metadata = icyMetadata || icyTitle || 
      (icyName && icyDescription ? `StreamTitle='${icyName} - ${icyDescription}'` : null) ||
      xMetadata

    if (!metadata) {
      console.warn('No metadata found in stream headers:', Object.fromEntries(response.headers.entries()))
    }

    return metadata
  } catch (error) {
    console.error('Error fetching stream metadata:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const metadata = await fetchStreamMetadata(url)

    return NextResponse.json({ metadata })
  } catch (error) {
    console.error('Error in metadata route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch metadata' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
} 