'use client'

import { Suspense } from 'react'
import { MobileLayout } from '@/components/mobile/mobile-layout'
import { MobileHome } from '@/components/mobile/mobile-home'
import { RadioStations } from '@/components/desktop/radio-stations'
import { HeroBanner } from '@/components/desktop/hero-banner'
import { WelcomeMessage } from '@/components/desktop/welcome-message'
import { GenreExplorer } from '@/components/desktop/genre-explorer'
import { Loading } from '@/components/ui/loading'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import { genres } from '@/data/audio'
import { useMobile } from '@/hooks/use-mobile'

export default function Home() {
  const { isMobile, isClient } = useMobile()

  // Return a minimal layout during SSR
  if (!isClient) {
    return <div className="min-h-screen bg-background" />
  }

  if (isMobile) {
    return (
      <MobileLayout>
        <MobileHome />
      </MobileLayout>
    )
  }

  return (
    <div className="pb-8">
      {/* Hero Section */}
      <section className="pt-8 pb-16">
        <div className="container space-y-8">
          <ErrorBoundary>
            <Suspense fallback={<Loading text="Loading welcome section..." />}>
              <WelcomeMessage />
              <HeroBanner />
            </Suspense>
          </ErrorBoundary>
        </div>
      </section>

      {/* Radio Stations Section */}
      <section id="radio-stations" className="py-16 border-y border-border/5 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <ErrorBoundary>
            <Suspense fallback={<Loading text="Loading radio stations..." />}>
              <RadioStations />
            </Suspense>
          </ErrorBoundary>
        </div>
      </section>

      {/* Genre Explorer */}
      <section className="py-16">
        <div className="container">
          <ErrorBoundary>
            <Suspense fallback={<Loading text="Loading genres..." />}>
              <GenreExplorer genres={genres} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </section>
    </div>
  )
}

