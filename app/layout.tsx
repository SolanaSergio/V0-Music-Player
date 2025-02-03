import { Suspense } from 'react'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { Sidebar } from '@/components/desktop/sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Header } from '@/components/desktop/header'
import { MobileNav } from '@/components/mobile-nav'
import { ClientLayout } from '@/components/client-layout'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import { ErrorLogger } from '@/components/shared/error-logger'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AudioProvider } from '@/components/shared/audio-provider'

export const metadata: Metadata = {
  title: 'Music Streaming App',
  description: 'A modern music streaming platform'
}

function RootLoading() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading your music experience...
        </p>
      </div>
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className} suppressHydrationWarning>
        <ErrorLogger />
        <ErrorBoundary>
          <ClientLayout>
            <SidebarProvider>
              <AudioProvider>
                <Suspense fallback={<RootLoading />}>
                  <div className="relative flex h-screen overflow-hidden">
                    {/* Sidebar - Hidden on mobile */}
                    <Suspense fallback={
                      <div className="hidden md:block w-[250px] bg-muted/20 animate-pulse" />
                    }>
                      <Sidebar className="hidden md:block" />
                    </Suspense>

                    {/* Mobile Navigation */}
                    <Suspense fallback={null}>
                      <MobileNav className="md:hidden" />
                    </Suspense>

                    {/* Main Content */}
                    <main className="flex-1 flex flex-col overflow-hidden bg-background/[0.02] backdrop-blur-[2px]">
                      <Suspense fallback={
                        <div className="h-16 bg-muted/20 animate-pulse" />
                      }>
                        <Header />
                      </Suspense>

                      {/* Scrollable Content Area */}
                      <div className="h-[calc(100vh-4rem)] overflow-y-auto pt-16 scrollbar-thin scrollbar-track-background/20 scrollbar-thumb-muted-foreground/10 hover:scrollbar-thumb-muted-foreground/20">
                        <ErrorBoundary>
                          {children}
                        </ErrorBoundary>
                      </div>
                    </main>
                  </div>
                </Suspense>
              </AudioProvider>
            </SidebarProvider>
          </ClientLayout>
        </ErrorBoundary>
      </body>
    </html>
  )
}

