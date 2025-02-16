'use client'

import { useMobile } from '@/hooks/use-mobile'
import { PlayerView } from '@/components/desktop/player-view'
import { MobilePlayerView } from '@/components/mobile/mobile-player-view'
import { MobileLayout } from '@/components/mobile/mobile-layout'

export default function PlayerPage() {
  const { isMobile, isClient } = useMobile()

  // Return a minimal layout during SSR
  if (!isClient) {
    return <div className="min-h-screen bg-background" />
  }

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="h-full w-full relative">
          <MobilePlayerView />
        </div>
      </MobileLayout>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-background/95 to-background/90">
      <PlayerView />
    </div>
  )
}

