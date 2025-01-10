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
    // Try direct GET request first
    const response = await fetch(url, {
      headers: {
        'Accept': 'audio/mpeg,audio/aac,audio/ogg,audio/*',
      }
    });

    if (!response.ok) {
      throw new Error('Stream not available');
    }

    // Get content type from response headers
    const contentType = response.headers.get('content-type') || 'audio/mpeg';

    return {
      url,
      format: contentType
    };
  } catch (error) {
    console.error('Stream connection error:', error);

    // Try with CORS proxy as fallback
    try {
      const corsProxy = 'https://cors-anywhere.herokuapp.com/';
      const proxyUrl = corsProxy + url;

      const response = await fetch(proxyUrl, {
        headers: {
          'Accept': 'audio/mpeg,audio/aac,audio/ogg,audio/*',
        }
      });

      if (!response.ok) {
        throw new Error('Stream not available');
      }

      return {
        url: proxyUrl,
        format: response.headers.get('content-type') || 'audio/mpeg'
      };
    } catch (proxyError) {
      console.error('CORS proxy connection error:', proxyError);

      // Return original URL as fallback
      return {
        url,
        format: 'audio/mpeg'
      };
    }
  }
}

export async function checkStreamStatus(url: string): Promise<boolean> {
  if (!url) {
    return false;
  }

  try {
    // Try direct GET request first
    const response = await fetch(url, {
      headers: {
        'Accept': 'audio/mpeg,audio/aac,audio/ogg,audio/*',
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Stream status check error:', error);

    // Try with CORS proxy as fallback
    try {
      const corsProxy = 'https://cors-anywhere.herokuapp.com/';
      const proxyUrl = corsProxy + url;

      const response = await fetch(proxyUrl, {
        headers: {
          'Accept': 'audio/mpeg,audio/aac,audio/ogg,audio/*',
        }
      });

      return response.ok;
    } catch (proxyError) {
      console.error('CORS proxy status check error:', proxyError);
      // Return true as fallback since some streams don't support HEAD/GET checks
      return true;
    }
  }
}

