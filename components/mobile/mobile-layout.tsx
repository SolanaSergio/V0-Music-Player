'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Home, Radio, Search, Settings } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface NavItem {
  href: string
  icon: typeof Home
  label: string
  activePattern: RegExp
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', icon: Home, label: 'Home', activePattern: /^\/$/ },
  { href: '/radio', icon: Radio, label: 'Radio', activePattern: /^\/radio/ },
  { href: '/search', icon: Search, label: 'Search', activePattern: /^\/search/ },
  { href: '/settings', icon: Settings, label: 'Settings', activePattern: /^\/settings/ }
]

export function MobileLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isScrollingUp, setIsScrollingUp] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Enhanced scroll handling
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const isScrollingUpNow = currentScrollY <= lastScrollY
      
      // Only update state if direction changed (prevents unnecessary rerenders)
      if (isScrollingUpNow !== isScrollingUp) {
        setIsScrollingUp(isScrollingUpNow)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, isScrollingUp])

  return (
    <div className="relative flex flex-col h-[100dvh] overflow-hidden bg-background">
      {/* Header - Only show on non-player pages */}
      {!pathname.includes('/player') && (
        <header className="shrink-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4">
            <div className="mr-4 hidden md:flex">
              <Link href="/" className="mr-6 flex items-center space-x-2">
                <span className="hidden font-bold sm:inline-block">
                  V0 Music Player
                </span>
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      <motion.nav
        className="shrink-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        initial={{ y: 0 }}
        animate={{ y: isScrollingUp ? 0 : 100 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex h-16 items-center justify-around">
          {NAV_ITEMS.map(({ href, icon: Icon, label, activePattern }) => {
            const isActive = activePattern.test(pathname)
            return (
              <Link key={href} href={href} className="w-full">
                <Button
                  variant="ghost"
                  className={cn(
                    'relative h-16 w-full flex-col items-center justify-center gap-1 rounded-none',
                    isActive && 'text-primary'
                  )}
                >
                  <motion.div
                    initial={false}
                    animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>
                  <span className="text-xs">{label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      layoutId="activeTab"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Button>
              </Link>
            )
          })}
        </div>
      </motion.nav>
    </div>
  )
} 