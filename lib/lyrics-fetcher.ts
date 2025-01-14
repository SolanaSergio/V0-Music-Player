import { LyricsResponse, GeniusSearchHit } from '@/types/audio'

const GENIUS_ACCESS_TOKEN = process.env.GENIUS_ACCESS_TOKEN

async function searchSong(artist: string, title: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.genius.com/search?q=${encodeURIComponent(`${artist} ${title}`)}`,
      {
        headers: {
          'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}`
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to search song on Genius')
    }

    const data = await response.json()
    const hits = data.response.hits

    if (hits.length === 0) return null

    // Find the best match by comparing artist and title
    const bestMatch = hits.find((hit: GeniusSearchHit) => {
      const resultArtist = hit.result.primary_artist.name.toLowerCase()
      const resultTitle = hit.result.title.toLowerCase()
      return (
        resultArtist.includes(artist.toLowerCase()) ||
        artist.toLowerCase().includes(resultArtist) ||
        resultTitle.includes(title.toLowerCase()) ||
        title.toLowerCase().includes(resultTitle)
      )
    })

    return bestMatch ? bestMatch.result.id : hits[0].result.id
  } catch (error) {
    console.error('Error searching song:', error)
    return null
  }
}

async function fetchLyricsById(songId: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.genius.com/songs/${songId}`,
      {
        headers: {
          'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}`
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch song details from Genius')
    }

    const data = await response.json()
    const path = data.response.song.path

    // Fetch the actual webpage that contains lyrics
    const lyricsPageResponse = await fetch(`https://genius.com${path}`)
    const html = await lyricsPageResponse.text()

    // Extract lyrics from the HTML
    // Lyrics are typically in a div with class 'Lyrics__Container-sc-...'
    const lyricsMatch = html.match(/<div[^>]*class="[^"]*Lyrics__Container[^"]*"[^>]*>([\s\S]*?)<\/div>/g)
    
    if (!lyricsMatch) return null

    // Clean up the HTML and format lyrics
    const lyrics = lyricsMatch
      .join('\n')
      .replace(/<br\/?>/g, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/\[/g, '\n[')
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    return lyrics
  } catch (error) {
    console.error('Error fetching lyrics:', error)
    return null
  }
}

export async function fetchLyrics(artist: string, title: string): Promise<LyricsResponse> {
  try {
    const songId = await searchSong(artist, title)
    if (!songId) {
      return {
        success: false,
        error: 'Song not found'
      }
    }

    const lyrics = await fetchLyricsById(songId)
    if (!lyrics) {
      return {
        success: false,
        error: 'Lyrics not found'
      }
    }

    return {
      success: true,
      lyrics
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
} 