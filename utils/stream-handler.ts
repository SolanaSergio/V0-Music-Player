interface StreamResponse {
  url: string;
  format: string;
  bitrate?: number;
}

export async function getStreamUrl(url: string): Promise<StreamResponse> {
  if (!url) {
    throw new Error('No stream URL provided');
  }

  try {
    // Try direct GET request first instead of HEAD
    const response = await fetch(url, {
      mode: 'no-cors', // Try no-cors first
      headers: {
        'Accept': 'audio/mpeg,audio/aac,audio/ogg,audio/*',
      }
    });

    // For no-cors, we can't check response.ok, so we'll assume it's working
    // if we get this far without an error
    return {
      url,
      format: 'audio/mpeg' // Default to MP3 format
    };
  } catch (error) {
    console.error('Stream connection error:', error);
    throw new Error('Stream connection failed');
  }
}

export async function checkStreamStatus(url: string): Promise<boolean> {
  if (!url) {
    return false;
  }

  try {
    // Try a direct GET request with no-cors
    await fetch(url, {
      mode: 'no-cors',
      headers: {
        'Accept': 'audio/mpeg,audio/aac,audio/ogg,audio/*',
      }
    });

    // If we get here without an error, assume the stream is available
    return true;
  } catch (error) {
    console.error('Stream status check error:', error);
    return false;
  }
}

