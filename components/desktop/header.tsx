'use client'

import { useState } from 'react'
import { Search, Bell, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion } from 'framer-motion'

export function Header() {
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 h-16 bg-background/40 backdrop-blur supports-[backdrop-filter]:bg-background/20 z-50 border-b border-border/20">
      <div className="flex h-full items-center px-6 gap-4 md:gap-6">
        <div className="flex-1 flex justify-center max-w-2xl">
          <div className={cn(
            "w-full max-w-sm flex items-center transition-all duration-300",
            isSearchFocused ? "scale-105" : ""
          )}>
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
              <Input
                placeholder="Search for music..."
                className="pl-10 pr-4 bg-muted/30 border-muted-foreground/10 transition-colors group-hover:border-muted-foreground/20"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm">New playlist added: Chill Vibes</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm">New radio station available</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ 
            opacity: [0, 1, 1, 1, 1, 0],
            x: [50, 0, 0, 0, 0, 50],
            scale: [0.95, 1, 1.02, 1, 0.98, 0.95],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatDelay: 15,
            ease: "easeInOut",
            times: [0, 0.1, 0.3, 0.5, 0.8, 1],
          }}
          className="text-xs font-medium ml-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 hover:scale-105 transition-transform"
          style={{
            textShadow: "0 0 8px rgba(var(--primary), 0.3)"
          }}
        >
          Created By S
        </motion.div>
      </div>
    </header>
  )
}

