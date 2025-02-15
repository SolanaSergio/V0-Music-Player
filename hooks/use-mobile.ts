'use client'

import { useState, useEffect } from 'react'

const MOBILE_BREAKPOINT = 768

interface MobileHookReturn {
  isMobile: boolean
  isClient: boolean
}

function useMobile(): MobileHookReturn {
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [isClient, setIsClient] = useState<boolean>(false)

  useEffect(() => {
    setIsClient(true)
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Initial check
    checkMobile()

    // Add resize listener
    window.addEventListener('resize', checkMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return {
    isMobile,
    isClient
  }
}

export { useMobile } 