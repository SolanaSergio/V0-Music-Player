import type { RecognizedSong } from '@/types/audio'

// We'll need to get these from environment variables
const AUDD_API_KEY = process.env.NEXT_PUBLIC_AUDD_API_KEY
const MUSIXMATCH_API_KEY = process.env.NEXT_PUBLIC_MUSIXMATCH_API_KEY

interface AudDResponse {
  status: string
  result: {
    title: string
    artist: string
    album: string
    release_date: string
    score: number
  } | null
}

interface MusixmatchResponse {
  message: {
    body: {
      lyrics: {
        lyrics_body: string
      }
    }
  }
}

export async function recognizeAudio(audioBuffer: ArrayBuffer): Promise<RecognizedSong | null> {
  if (!AUDD_API_KEY) {
    console.warn('AudD API key not configured')
    return null
  }

  try {
    const formData = new FormData()
    formData.append('api_token', AUDD_API_KEY)
    formData.append('audio', new Blob([audioBuffer]))
    formData.append('return', 'lyrics')

    const response = await fetch('https://api.audd.io/', {
      method: 'POST',
      body: formData
    })

    const data: AudDResponse = await response.json()

    if (data.status === 'success' && data.result) {
      const song: RecognizedSong = {
        title: data.result.title,
        artist: data.result.artist,
        album: data.result.album,
        releaseDate: data.result.release_date,
        confidence: data.result.score,
        timestamp: Date.now()
      }

      // Try to fetch lyrics if song is recognized
      try {
        song.lyrics = await fetchLyrics(song.artist, song.title)
      } catch (error) {
        console.warn('Failed to fetch lyrics:', error)
      }

      return song
    }

    return null
  } catch (error) {
    console.error('Error recognizing audio:', error)
    return null
  }
}

export async function fetchLyrics(artist: string, title: string): Promise<string | undefined> {
  if (!MUSIXMATCH_API_KEY) {
    console.warn('Musixmatch API key not configured')
    return undefined
  }

  try {
    // First search for the track
    const searchResponse = await fetch(
      `https://api.musixmatch.com/ws/1.1/track.search?q_artist=${encodeURIComponent(
        artist
      )}&q_track=${encodeURIComponent(title)}&apikey=${MUSIXMATCH_API_KEY}`
    )

    const searchData = await searchResponse.json()
    const trackId = searchData.message.body.track_list[0]?.track.track_id

    if (!trackId) {
      return undefined
    }

    // Then fetch lyrics for the track
    const lyricsResponse = await fetch(
      `https://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=${trackId}&apikey=${MUSIXMATCH_API_KEY}`
    )

    const lyricsData: MusixmatchResponse = await lyricsResponse.json()
    return lyricsData.message.body.lyrics.lyrics_body
  } catch (error) {
    console.error('Error fetching lyrics:', error)
    return undefined
  }
} 