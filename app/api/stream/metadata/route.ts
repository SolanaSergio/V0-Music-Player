import { NextResponse } from 'next/server'

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

    // Try to get metadata from various headers
    const metadata = 
      response.headers.get('icy-metaint') || 
      response.headers.get('icy-metadata') ||
      response.headers.get('icy-name') ||
      response.headers.get('icy-description')

    return metadata
  } catch (error) {
    console.error('Error fetching stream metadata:', error)
    throw error
  }
}

export async function POST(request: Request) {
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