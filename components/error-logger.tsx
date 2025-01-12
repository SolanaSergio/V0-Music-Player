'use client'

import { useEffect } from 'react'

export function ErrorLogger() {
  useEffect(() => {
    // Override console.error to get more details
    const originalError = console.error
    console.error = (...args) => {
      // Log the full error details
      console.group('Detailed Error Information')
      args.forEach((arg, index) => {
        console.log(`Error Detail ${index + 1}:`, arg)
        if (arg instanceof Error) {
          console.log('Error Name:', arg.name)
          console.log('Error Message:', arg.message)
          console.log('Error Stack:', arg.stack)
        }
      })
      console.groupEnd()
      
      // Call original console.error
      originalError.apply(console, args)
    }

    // Add window error handler
    const handleError = (event: ErrorEvent) => {
      console.group('Global Error Caught')
      console.log('Error Message:', event.message)
      console.log('Error Source:', event.filename)
      console.log('Error Line:', event.lineno)
      console.log('Error Column:', event.colno)
      console.log('Error Object:', event.error)
      console.groupEnd()
    }

    // Add unhandled rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.group('Unhandled Promise Rejection')
      console.log('Rejection Reason:', event.reason)
      if (event.reason instanceof Error) {
        console.log('Error Name:', event.reason.name)
        console.log('Error Message:', event.reason.message)
        console.log('Error Stack:', event.reason.stack)
      }
      console.groupEnd()
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      console.error = originalError
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
} 