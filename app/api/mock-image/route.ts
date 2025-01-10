import { ImageResponse } from 'next/server'
 
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const width = searchParams.get('width') || '400'
  const height = searchParams.get('height') || '400'
  const text = searchParams.get('text') || 'Image'
 
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          background: '#1a1a1a',
          color: '#888',
        }}
      >
        {text}
      </div>
    ),
    {
      width: Number(width),
      height: Number(height),
    },
  )
}

