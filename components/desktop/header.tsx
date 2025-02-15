'use client'

import { cn } from "@/lib/utils"

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn("h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="container h-full flex items-center">
        <h1 className="text-lg font-semibold">Music Player</h1>
      </div>
    </header>
  )
}

