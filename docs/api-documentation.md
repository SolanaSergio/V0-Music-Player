# API Documentation

## Audio Stream API

### Local Audio Endpoints

#### 1. Audio File Streaming
```typescript
GET /api/audio/stream/:trackId
```
Streams audio file content with proper chunking and range support.

**Parameters:**
- `trackId`: Track identifier from the audio library

**Headers:**
- `Range`: Bytes range for partial content requests
- `Accept`: audio/* MIME types

**Response:**
- `206 Partial Content` for range requests
- `200 OK` for full file requests
- Content-Type: audio/mpeg, audio/ogg, etc.

### Radio Stream Integration

#### 1. Radio Station Stream
```typescript
GET /api/radio/stream/:stationId
```
Handles live radio stream connections with automatic reconnection.

**Parameters:**
- `stationId`: Radio station identifier

**Headers:**
- `Icy-MetaData`: 1 (to receive metadata)

**Response:**
- `200 OK` with audio stream
- Includes ICY metadata for track information

**Error Handling:**
- Automatic retry with exponential backoff
- Connection timeout after 30 seconds
- Maximum 3 retry attempts

#### 2. Station Metadata
```typescript
GET /api/radio/metadata/:stationId
```
Fetches current station and track information.

**Response:**
```json
{
  "station": {
    "id": string,
    "name": string,
    "genre": string,
    "imageUrl": string,
    "fallbackImage": string,
    "streamUrl": string,
    "description": string,
    "isLive": boolean,
    "tags": string[],
    "format": string,
    "bitrate": number,
    "region": string,
    "language": string
  },
  "currentTrack": {
    "title": string,
    "artist": string,
    "startTime": string, // ISO-8601
    "duration": number
  }
}
```

## Media Management API

### 1. Track Management

#### Get Track Information
```typescript
GET /api/tracks/:trackId
```
**Response:**
```json
{
  "id": string,
  "title": string,
  "artist": string,
  "genre": string,
  "imageUrl": string,
  "fallbackImage": string,
  "audioUrl": string,
  "isLive": boolean
}
```

#### Get Featured Tracks
```typescript
GET /api/tracks/featured
```
**Response:**
```json
{
  "tracks": Track[]
}
```

#### Get Track Recommendations
```typescript
GET /api/tracks/recommendations
```
**Query Parameters:**
- `genre`: Filter by genre
- `limit`: Number of tracks to return (default: 10)

**Response:**
```json
{
  "tracks": Track[]
}
```

## WebSocket Events

### Audio State Updates
```typescript
interface AudioStateEvent {
  type: 'PLAYBACK_STATE' | 'TRACK_CHANGE' | 'BUFFER_STATE';
  payload: {
    isPlaying?: boolean;
    currentTime?: number;
    buffered?: TimeRanges;
    track?: Track;
    error?: Error;
  }
}
```

### Radio Stream Events
```typescript
interface RadioStreamEvent {
  type: 'METADATA_UPDATE' | 'STREAM_QUALITY' | 'CONNECTION_STATE';
  payload: {
    metadata?: {
      title?: string;
      artist?: string;
      show?: string;
    };
    error?: string;
    retryCount: number;
    isBuffering: boolean;
    isConnected: boolean;
  }
}
```

## Audio Processing

### Web Worker Messages
```typescript
interface AudioMessage {
  type: 'init' | 'start' | 'pause' | 'process' | 'processed';
  data: {
    fftSize?: number;
    frequencyData?: Uint8Array;
    timeData?: Uint8Array;
    track?: Track;
    features?: AudioFeatures;
  }
}
```

### Audio Features
```typescript
interface AudioFeatures {
  frequency: {
    average: number;
    peaks: number[];
    bands: {
      bass: number;
      midrange: number;
      treble: number;
    }
  };
  time: {
    waveform: Float32Array;
    volume: number;
    zeroCrossings: number;
  };
  beat: {
    isBeat: boolean;
    energy: number;
    interval: number;
  }
}
```

## Error Handling

### Error Response Format
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
```

### Common Error Codes
- `STREAM_NOT_FOUND`: 404 - Stream resource not found
- `STREAM_UNAVAILABLE`: 503 - Stream temporarily unavailable
- `INVALID_RANGE`: 416 - Invalid range request
- `RATE_LIMITED`: 429 - Too many requests
- `STREAM_ERROR`: 500 - Internal streaming error
- `CONNECTION_TIMEOUT`: 408 - Stream connection timeout
- `RETRY_FAILED`: 503 - Maximum retry attempts reached

## Rate Limiting

### Endpoints Limits
- Stream endpoints: 1000 requests/hour
- Metadata endpoints: 2000 requests/hour
- Featured tracks: 500 requests/hour

### Headers
```
X-RateLimit-Limit: [requests/hour limit]
X-RateLimit-Remaining: [remaining requests]
X-RateLimit-Reset: [UTC timestamp]
```

## Caching

### Cache Control Headers
```
Cache-Control: public, max-age=3600
ETag: "strong-etag-hash"
Last-Modified: [UTC timestamp]
```

### Cacheable Resources
- Station metadata: 60 seconds
- Track information: 1 hour
- Featured tracks: 5 minutes
- Audio features: 24 hours

## Integration Examples

### Stream Connection
```typescript
const connectToStream = async (trackId: string) => {
  const response = await fetch(`/api/audio/stream/${trackId}`, {
    headers: {
      'Range': 'bytes=0-',
      'Accept': 'audio/*'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Stream error: ${response.statusText}`);
  }
  
  return response.body;
};
```

### Radio Stream Connection
```typescript
const connectToRadioStream = async (station: RadioStation) => {
  try {
    // Create audio context on user interaction
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    // Connect to stream with retry logic
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const response = await fetch(station.streamUrl);
        if (!response.ok) throw new Error('Stream unavailable');
        
        const stream = response.body;
        // Process stream...
        break;
      } catch (error) {
        retryCount++;
        if (retryCount === maxRetries) throw error;
        await new Promise(resolve => 
          setTimeout(resolve, 1000 * Math.pow(2, retryCount))
        );
      }
    }
  } catch (error) {
    console.error('Stream connection failed:', error);
    throw error;
  }
};
```

### Metadata Polling
```typescript
const pollStationMetadata = async (
  stationId: string,
  interval: number = 5000
) => {
  const controller = new AbortController();
  const { signal } = controller;

  const poll = async () => {
    try {
      const response = await fetch(
        `/api/radio/metadata/${stationId}`,
        { signal }
      );
      const metadata = await response.json();
      handleMetadataUpdate(metadata);
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error('Metadata fetch failed:', error);
    }
  };

  const intervalId = setInterval(poll, interval);
  
  return () => {
    clearInterval(intervalId);
    controller.abort();
  };
}; 