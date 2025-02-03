'use client'

import { useState } from 'react'
import { 
  Home, 
  Search, 
  Radio, 
  Library,
  PlayIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface MobileLayoutProps {
  children: React.ReactNode
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'radio' | 'library'>('home')

  return (
    <div className="flex flex-col h-screen bg-background md:hidden">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center h-14 border-b">
          <div className="flex items-center justify-between w-full px-4">
            <div className="flex items-center gap-4">
              <h1 className="text-base font-semibold">
                {activeTab === 'home' && 'Home'}
                {activeTab === 'search' && 'Search'}
                {activeTab === 'radio' && 'Radio'}
                {activeTab === 'library' && 'Library'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar - Only shown when search tab is active */}
      {activeTab === 'search' && (
        <div className="sticky top-14 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="px-4 py-2">
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                placeholder="Search for music..."
                className="w-full h-10 pl-10 pr-4 rounded-md bg-muted/30 border border-muted-foreground/10 focus:border-muted-foreground/20 outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <ScrollArea className="flex-1 pb-32">
        <div className="p-4">
          {children}
        </div>
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-around w-full">
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "flex-1 flex-col h-14 px-2",
              activeTab === 'home' && "text-primary"
            )}
            onClick={() => setActiveTab('home')}
          >
            <Home className="h-4 w-4" />
            <span className="text-[10px] mt-1">Home</span>
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "flex-1 flex-col h-14 px-2",
              activeTab === 'search' && "text-primary"
            )}
            onClick={() => setActiveTab('search')}
          >
            <Search className="h-4 w-4" />
            <span className="text-[10px] mt-1">Search</span>
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "flex-1 flex-col h-14 px-2",
              activeTab === 'radio' && "text-primary"
            )}
            onClick={() => setActiveTab('radio')}
          >
            <Radio className="h-4 w-4" />
            <span className="text-[10px] mt-1">Radio</span>
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "flex-1 flex-col h-14 px-2",
              activeTab === 'library' && "text-primary"
            )}
            onClick={() => setActiveTab('library')}
          >
            <Library className="h-4 w-4" />
            <span className="text-[10px] mt-1">Library</span>
          </Button>
        </div>
      </div>

      {/* Mini Player - Fixed at bottom above navigation */}
      <div className="fixed bottom-14 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
        <div className="p-2 flex items-center gap-2">
          {/* Album Art */}
          <div className="w-10 h-10 bg-muted rounded-md shrink-0" />
          
          {/* Track Info */}
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm truncate">Track Name</h3>
            <p className="text-xs text-muted-foreground truncate">Artist Name</p>
          </div>

          {/* Controls */}
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <PlayIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 