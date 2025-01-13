import { NextResponse } from 'next/server'

async function fetchStreamMetadata(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Icy-MetaData': '1', // Request metadata
        'User-Agent': 'V0MusicPlayer/1.0'
      }
    })

    // Check for ICY metadata in headers
    const icyName = response.headers.get('icy-name')
    const icyDescription = response.headers.get('icy-description')

    // If we have metadata in headers, return it
    if (icyName || icyDescription) {
      const metadata = []
      if (icyName) metadata.push(icyName)
      if (icyDescription) metadata.push(icyDescription)
      return `StreamTitle='${metadata.join(' - ')}'`
    }

    // If no metadata found
    return null
  } catch (error) {
    console.error('Error fetching stream metadata:', error)
    return null
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const metadata = await fetchStreamMetadata(url)

    return NextResponse.json({ metadata })
  } catch (error) {
    console.error('Error in metadata endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 