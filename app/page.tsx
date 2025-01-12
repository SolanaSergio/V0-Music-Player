import { Suspense } from 'react'
import { Featured } from '@/components/featured'
import { RadioStations } from '@/components/radio-stations'
import { HeroBanner } from '@/components/hero-banner'
import { WelcomeMessage } from '@/components/welcome-message'
import { DJMixesSection } from '@/components/dj-mixes-section'
import { LatestSongs } from '@/components/latest-songs'
import { RecentlyPlayed } from '@/components/recently-played'
import { DailyMixes } from '@/components/daily-mixes'
import { GenreExplorer } from '@/components/genre-explorer'
import { Loading } from '@/components/ui/loading'
import { featuredTracks, genres } from '@/data/audio'

export default function Home() {
  return (
    <div className="pb-8">
      {/* Hero Section */}
      <section className="pt-8 pb-16">
        <div className="container space-y-8">
          <Suspense fallback={<Loading text="Loading welcome section..." />}>
            <WelcomeMessage />
            <HeroBanner />
          </Suspense>
        </div>
      </section>

      {/* Recently Played & Daily Mixes */}
      <section className="py-12 border-t border-border/5 bg-gradient-to-b from-background/50 to-background">
        <div className="container grid gap-8 lg:grid-cols-2">
          <Suspense fallback={<Loading text="Loading your music..." />}>
            <RecentlyPlayed />
            <DailyMixes />
          </Suspense>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-16 border-y border-border/5 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <Suspense fallback={<Loading text="Loading featured tracks..." />}>
            <Featured tracks={featuredTracks} />
          </Suspense>
        </div>
      </section>

      {/* Genre Explorer */}
      <section className="py-16">
        <div className="container">
          <Suspense fallback={<Loading text="Loading genres..." />}>
            <GenreExplorer genres={genres} />
          </Suspense>
        </div>
      </section>

      {/* Radio Stations Section */}
      <section className="py-16 border-y border-border/5 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <Suspense fallback={<Loading text="Loading radio stations..." />}>
            <RadioStations />
          </Suspense>
        </div>
      </section>

      {/* Additional Content */}
      <section className="py-16">
        <div className="container grid gap-8 lg:grid-cols-2">
          <Suspense fallback={<Loading text="Loading additional content..." />}>
            <DJMixesSection />
            <LatestSongs />
          </Suspense>
        </div>
      </section>
    </div>
  )
}

