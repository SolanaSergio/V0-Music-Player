import { Suspense } from 'react'
import { RadioStations } from '@/components/radio-stations'
import { HeroBanner } from '@/components/hero-banner'
import { WelcomeMessage } from '@/components/welcome-message'
import { GenreExplorer } from '@/components/genre-explorer'
import { Loading } from '@/components/ui/loading'
import { ErrorBoundary } from '@/components/error-boundary'
import { genres } from '@/data/audio'

export default function Home() {
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

