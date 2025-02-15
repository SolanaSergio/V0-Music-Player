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
      <body className={GeistSans.className} suppressHydrationWarning>
        <ErrorBoundary>
          <ClientLayout>
            <div className="flex min-h-[100dvh] max-h-[100dvh] overflow-hidden">
              <SidebarProvider>
                <Sidebar className="hidden md:block" />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header className="hidden md:block" />
                  <main className="flex-1 overflow-hidden relative">
                    <Suspense fallback={<LoadingSpinner />}>
                      {children}
                    </Suspense>
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

