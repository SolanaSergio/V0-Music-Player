import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const width = parseInt(searchParams.get('width') || '400')
    const height = parseInt(searchParams.get('height') || '400')
    const text = searchParams.get('text') || 'Image'

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1a1a1a"/>
        <text 
          x="50%" 
          y="50%" 
          font-family="sans-serif" 
          font-size="24" 
          fill="#888"
          text-anchor="middle" 
          dominant-baseline="middle"
        >
          ${text}
        </text>
      </svg>
    `

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error generating image:', error)
    return new Response('Error generating image', { status: 500 })
  }
} 