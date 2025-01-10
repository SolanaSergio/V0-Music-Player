export function PlaceholderSVG({ width, height, text }: { width: number, height: number, text?: string }) {
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1a1a"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="system-ui" 
        font-size="${Math.min(width, height) * 0.1}px" 
        fill="#666" 
        text-anchor="middle" 
        dy=".3em"
      >${text || 'Image'}</text>
    </svg>
  `
  
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

