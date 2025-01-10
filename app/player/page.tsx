'use client'

import { PlayerView } from '@/components/player-view'

export default function PlayerPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-background/95 to-background/90">
      <PlayerView />
    </div>
  )
}

