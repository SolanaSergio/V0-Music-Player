'use client'

export function MusicWave({ className = "", playing = false }: { className?: string, playing?: boolean }) {
  return (
    <div className={className}>
      <div className="flex items-end gap-[2px] h-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-[2px] bg-primary"
            style={{
              height: playing ? '100%' : '30%',
              animation: playing 
                ? `musicWave ${0.5 + i * 0.2}s ease-in-out infinite alternate`
                : 'none'
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes musicWave {
          0% {
            height: 30%;
          }
          100% {
            height: 100%;
          }
        }
      `}</style>
    </div>
  )
}

