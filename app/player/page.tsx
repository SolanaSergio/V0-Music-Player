import { Metadata } from 'next'
import { PlayerView } from '@/components/player-view'

export const metadata: Metadata = {
  title: 'Now Playing | Music App',
  description: 'Currently playing track and visualizer',
}

export default function PlayerPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-background/95 to-background/90">
      <PlayerView />
    </div>
  )
}

