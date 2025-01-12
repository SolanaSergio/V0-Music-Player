'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Radio, Search, Library, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  className?: string
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      href: '/',
      label: 'Home',
      icon: Home
    },
    {
      href: '/search',
      label: 'Search',
      icon: Search
    },
    {
      href: '/radio',
      label: 'Radio',
      icon: Radio
    },
    {
      href: '/library',
      label: 'Library',
      icon: Library
    }
  ]

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/50",
        className
      )}>
        <div className="flex items-center justify-around h-16">
          {routes.map((route) => {
            const isActive = pathname === route.href
            return (
              <Link
                key={route.href}
                href={route.href}
                className="w-full"
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full h-16 flex flex-col items-center justify-center gap-1 rounded-none relative",
                    isActive && "text-primary"
                  )}
                >
                  <route.icon className="h-5 w-5" />
                  <span className="text-xs">{route.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                      }}
                    />
                  )}
                </Button>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Side Menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[300px] p-0">
          <div className="flex h-full flex-col">
            <div className="border-b border-border/50 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium ml-4">Browse</h3>
                  {routes.map((route) => (
                    <Button
                      key={route.href}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        pathname === route.href && "bg-primary/10 text-primary"
                      )}
                      onClick={() => {
                        setOpen(false)
                      }}
                      asChild
                    >
                      <Link href={route.href}>
                        <route.icon className="mr-2 h-4 w-4" />
                        {route.label}
                      </Link>
                    </Button>
                  ))}
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-medium ml-4">Your Library</h3>
                  {['Playlists', 'Albums', 'Artists', 'Downloaded'].map((item) => (
                    <Button
                      key={item}
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      {item}
                    </Button>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

