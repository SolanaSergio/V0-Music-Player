'use client'

import { AudioProvider } from '@/components/audio-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { BackgroundEffects } from '@/components/background-effects'

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ThemeProvider>
      <AudioProvider>
        {children}
        <BackgroundEffects />
      </AudioProvider>
    </ThemeProvider>
  )
} 