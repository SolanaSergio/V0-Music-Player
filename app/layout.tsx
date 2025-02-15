import { Suspense } from 'react'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font'
import './globals.css'
import { Sidebar } from '@/components/desktop/sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Header } from '@/components/desktop/header'
import { ClientLayout } from '@/components/client-layout'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const metadata: Metadata = {
  title: 'Music Streaming App',
  description: 'A modern music streaming platform'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${GeistSans.className} bg-background antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          <ClientLayout>
            <div className="flex h-screen">
              <SidebarProvider>
                {/* Sidebar - Fixed position with premium blur effect */}
                <Sidebar className="hidden md:block w-[280px] border-r border-border/10 bg-background/80 backdrop-blur-xl shadow-xl z-30" />
                
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-h-screen relative">
                  {/* Header - Fixed with premium glass effect */}
                  <Header className="hidden md:block sticky top-0 h-16 border-b border-border/10 bg-background/80 backdrop-blur-xl shadow-sm z-20" />
                  
                  {/* Main Content - Scrollable */}
                  <main className="flex-1 overflow-y-auto">
                    <div className="relative">
                      <Suspense fallback={<LoadingSpinner />}>
                        {children}
                      </Suspense>
                    </div>
                  </main>
                </div>
              </SidebarProvider>
            </div>
          </ClientLayout>
        </ErrorBoundary>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function() {
                if (document.body.hasAttribute('data-new-gr-c-s-check-loaded')) {
                  document.body.removeAttribute('data-new-gr-c-s-check-loaded');
                }
                if (document.body.hasAttribute('data-gr-ext-installed')) {
                  document.body.removeAttribute('data-gr-ext-installed');
                }
              });
            `
          }}
        />
      </body>
    </html>
  )
}

