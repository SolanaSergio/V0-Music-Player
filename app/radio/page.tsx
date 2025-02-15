'use client'

import { RadioStations } from '@/components/desktop/radio-stations'
import { MobileRadioView } from '@/components/mobile/mobile-radio-view'
import { MobileLayout } from '@/components/mobile/mobile-layout'
import { useMobile } from '@/hooks/use-mobile'

export default function RadioPage() {
  const { isMobile, isClient } = useMobile()

  // Return a minimal layout during SSR
  if (!isClient) {
    return <div className="min-h-screen bg-background" />
  }

  if (isMobile) {
    return (
      <MobileLayout>
        <MobileRadioView />
      </MobileLayout>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Radio Stations</h1>
        <p className="text-muted-foreground text-lg">
          Listen to live radio stations from around the world. Choose from a variety of genres and discover new music.
        </p>
      </div>
      <RadioStations />
    </div>
  )
}

