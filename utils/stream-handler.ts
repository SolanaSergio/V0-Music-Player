interface StreamResponse {
  url: string;
  format?: string;
}

export async function getStreamUrl(url: string): Promise<StreamResponse> {
  console.log('Getting stream URL for:', url)
  
  try {
    // First try a HEAD request to check CORS and get content type
    const headResponse = await fetch(url, { 
      method: 'HEAD',
      mode: 'cors'
    })
    
    console.log('HEAD response status:', headResponse.status)
    console.log('Content-Type:', headResponse.headers.get('content-type'))
    
    if (!headResponse.ok) {
      console.log('HEAD request failed, trying direct stream')
      // If HEAD fails, try direct stream URL
      return { url }
    }

    const contentType = headResponse.headers.get('content-type')
    
    // Check if it's an audio stream
    if (contentType && contentType.includes('audio')) {
      console.log('Valid audio stream detected')
      return { 
        url,
        format: contentType 
      }
    }
    
    // If not audio content type, try to get redirect URL
    const response = await fetch(url, { 
      mode: 'cors'
    })
    
    console.log('GET response status:', response.status)
    
    if (response.redirected) {
      console.log('Stream URL redirected to:', response.url)
      return { 
        url: response.url,
        format: response.headers.get('content-type') || undefined
      }
    }
    
    // If no redirect, return original URL
    return { url }
    
  } catch (error) {
    console.error('Error getting stream URL:', error)
    // On error, return original URL and let audio element handle it
    return { url }
  }
}

export async function checkStreamStatus(url: string): Promise<boolean> {
  if (!url) {
    return false;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'audio/*'
      }
    });

    return response.ok;
  } catch (error) {
    console.log('Stream status check failed:', error);
    return false;
  }
}

