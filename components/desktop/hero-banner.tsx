'use client'

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Play, Radio } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { radioStations } from "@/data/audio"
import type { RadioStation } from '@/types/audio'

export function HeroBanner() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleStartListening = () => {
    // Start with the first radio station
    const firstStation: RadioStation = radioStations[0]
    if (firstStation) {
      router.push(`/player?station=${firstStation.id}`)
    }
  }

  return (
    <div className="relative h-[300px] sm:h-[400px] rounded-xl overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-cyan-500/5 to-background/80" />
        
        {/* Animated Waveform Pattern */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary/10"
              style={{
                transform: `translateY(${i * 8}px)`,
                animation: `waveform ${2 + i * 0.1}s ease-in-out infinite alternate`,
                opacity: 1 - (i * 0.05)
              }}
            />
          ))}
        </div>

        {/* Circular Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-gradient-to-r from-primary/20 to-cyan-500/20 blur-2xl" />
        <div className="absolute bottom-1/4 right-1/4 h-40 w-40 rounded-full bg-gradient-to-r from-cyan-500/20 to-primary/20 blur-2xl" />

        {/* Content Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      {/* Featured Radio Image */}
      <div className="absolute top-1/2 right-[10%] -translate-y-1/2">
        <div className="relative h-48 w-48 sm:h-64 sm:w-64 transform rotate-12 transition-transform duration-1000 hover:rotate-[14deg]">
          <Image
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=800&q=80"
            alt="Live Radio"
            width={800}
            height={800}
            className={cn(
              "rounded-lg object-cover shadow-2xl transition-all duration-1000",
              "hover:shadow-primary/20 hover:shadow-2xl",
              isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
            )}
            priority
          />
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        </div>
      </div>

      {/* Content */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-6 sm:p-8 space-y-4",
        "transition-all duration-700 delay-300",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      )}>
        <div className="relative space-y-2 max-w-lg">
          <div className="flex items-center gap-2 text-primary/80">
            <Radio className="h-5 w-5 animate-pulse" />
            <span className="text-sm font-medium">Live Radio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            Stream Live Radio Worldwide
          </h2>
          <p className="text-muted-foreground max-w-[600px] text-sm sm:text-base">
            Tune in to our curated collection of live radio stations. From lofi beats to classical symphonies, find your perfect station.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button size="lg" className="group bg-primary/90 hover:bg-primary" onClick={handleStartListening}>
            <Play className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
            Start Listening
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="bg-background/50 hover:bg-background/80"
            onClick={() => document.getElementById('radio-stations')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Browse Stations
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes waveform {
          0% {
            transform: translateY(var(--ty)) scaleX(0.8);
          }
          100% {
            transform: translateY(var(--ty)) scaleX(1);
          }
        }
      `}</style>
    </div>
  )
}

