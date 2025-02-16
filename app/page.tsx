'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { MobileLayout } from '@/components/mobile/mobile-layout'
import { MobileHome } from '@/components/mobile/mobile-home'
import { WelcomeMessage } from '@/components/desktop/welcome-message'
import { NowPlaying } from '@/components/desktop/now-playing'
import { GenreExplorer } from '@/components/desktop/genre-explorer'
import { Loading } from '@/components/ui/loading'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Music2,
  Radio,
  Mic2,
  Headphones,
  Heart,
  History,
  ListMusic,
  Disc3,
  Cog
} from 'lucide-react'
import { useMobile } from '@/hooks/use-mobile'
import { genres, radioStations } from '@/data/audio'

export default function HomePage() {
  const router = useRouter()
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

  const features = [
    {
      icon: Radio,
      title: 'Live Radio',
      description: 'Stream high-quality radio stations from around the world',
      color: 'from-blue-500/10 to-blue-500/5'
    },
    {
      icon: ListMusic,
      title: 'Audio Visualizer',
      description: 'Immersive visual experience synchronized with your music',
      color: 'from-purple-500/10 to-purple-500/5'
    },
    {
      icon: Music2,
      title: 'Genre Discovery',
      description: 'Explore music across various genres and styles',
      color: 'from-green-500/10 to-green-500/5'
    },
    {
      icon: Mic2,
      title: 'Live Lyrics',
      description: 'Real-time lyrics and song recognition',
      color: 'from-pink-500/10 to-pink-500/5'
    }
  ]

  const quickAccess = [
    {
      icon: Heart,
      title: 'Favorites',
      description: 'Your liked stations and tracks',
      href: '/favorites',
      color: 'from-red-500/10 to-red-500/5'
    },
    {
      icon: ListMusic,
      title: 'Browse Stations',
      description: 'Discover new radio stations',
      href: '/radio',
      color: 'from-blue-500/10 to-blue-500/5'
    },
    {
      icon: Disc3,
      title: 'Genres',
      description: 'Explore music by genre',
      href: '/genres',
      color: 'from-purple-500/10 to-purple-500/5'
    }
  ]

  const recentlyPlayed = radioStations.slice(0, 3)

  return (
    <div className="min-h-screen">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/90" />
        <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:radial-gradient(white,transparent_85%)]" />
      </div>

      <div className="relative pb-8">
        {/* Welcome & Now Playing Section */}
        <section className="pt-8">
          <div className="container max-w-7xl mx-auto px-4 lg:px-8">
            <div className="space-y-6">
              <ErrorBoundary>
                <Suspense fallback={<Loading text="Loading welcome section..." />}>
                  <WelcomeMessage />
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Now Playing Card */}
                    <Card className="col-span-2 overflow-hidden border-border/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Radio className="h-5 w-5 text-primary" />
                          Now Playing
                        </CardTitle>
                        <CardDescription>
                          Currently playing radio station or track
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <NowPlaying />
                      </CardContent>
                    </Card>

                    {/* Recently Played Card */}
                    <Card className="overflow-hidden border-border/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <History className="h-5 w-5 text-primary" />
                          Recently Played
                        </CardTitle>
                        <CardDescription>
                          Your listening history
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {recentlyPlayed.map((station, index) => (
                            <motion.div
                              key={station.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="flex items-center gap-3 group cursor-pointer"
                              onClick={() => router.push(`/player?station=${station.id}`)}
                            >
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                                <Image
                                  src={station.image || '/radio-stations/default-radio.jpg'}
                                  alt={station.name}
                                  className="object-cover transition-transform group-hover:scale-105"
                                  fill
                                  sizes="48px"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate group-hover:text-primary transition-colors">
                                  {station.name}
                                </h4>
                                <p className="text-sm text-muted-foreground truncate">
                                  {station.genre}
                                </p>
                              </div>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <ListMusic className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </section>

        {/* Premium Features */}
        <section className="py-12">
          <div className="container max-w-7xl mx-auto px-4 lg:px-8">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <Badge variant="outline" className="bg-background/50 backdrop-blur-sm mb-2">
                  <Cog className="w-3 h-3 mr-1 text-primary" />
                  Premium Experience
                </Badge>
                <h2 className="text-3xl font-bold">Advanced Features</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Experience music like never before with our cutting-edge features and premium audio quality
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="relative overflow-hidden group hover:border-primary/50 transition-colors h-full">
                      <CardContent className="pt-6">
                        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16 bg-gradient-to-br ${feature.color} transition-all duration-500 group-hover:scale-110`} />
                        <feature.icon className="h-8 w-8 text-primary mb-4 relative z-10" />
                        <h3 className="font-semibold text-lg mb-2 relative z-10">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm relative z-10">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Access Section */}
        <section className="py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/2 to-transparent" />
          <div className="container max-w-7xl mx-auto px-4 lg:px-8 relative">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Badge variant="outline" className="bg-background/50 backdrop-blur-sm mb-2">
                    <ListMusic className="w-3 h-3 mr-1 text-primary" />
                    Quick Access
                  </Badge>
                  <h2 className="text-2xl font-bold">Jump Right In</h2>
                  <p className="text-muted-foreground">
                    Access your favorite content with a single click
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickAccess.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card 
                      className="group hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden h-full"
                      onClick={() => router.push(item.href)}
                    >
                      <CardContent className="p-6">
                        <div className={`absolute top-0 right-0 w-56 h-56 rounded-full -translate-y-32 translate-x-32 bg-gradient-to-br ${item.color} transition-all duration-500 group-hover:scale-110`} />
                        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                          <div className="h-12 w-12 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                            <item.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Genre Explorer */}
        <section className="py-12">
          <div className="container max-w-7xl mx-auto px-4 lg:px-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Badge variant="outline" className="bg-background/50 backdrop-blur-sm mb-2">
                    <ListMusic className="w-3 h-3 mr-1 text-primary" />
                    Popular Categories
                  </Badge>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Disc3 className="h-6 w-6 text-primary" />
                    Trending Genres
                  </h2>
                  <p className="text-muted-foreground">
                    Explore the most popular music genres right now
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/genres')}
                  className="gap-2"
                >
                  <Music2 className="w-4 h-4" />
                  View All Genres
                </Button>
              </div>
              <ErrorBoundary>
                <Suspense fallback={<Loading text="Loading genres..." />}>
                  <GenreExplorer 
                    genres={genres.slice(0, 6)} 
                    className="bg-background/50 backdrop-blur-xl rounded-lg p-4 border border-border/10" 
                  />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-primary/5">
          <div className="container max-w-7xl mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Radio, label: 'Live Stations', value: '100+' },
                { icon: Headphones, label: 'Active Listeners', value: '50k+' },
                { icon: ListMusic, label: 'Countries', value: '30+' },
                { icon: Music2, label: 'Music Genres', value: '15+' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="text-center space-y-2"
                >
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="font-bold text-2xl">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

