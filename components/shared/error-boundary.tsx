'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    // Log the error to help with debugging
    console.error('Error caught by boundary:', error)
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log detailed error information
    console.group('Detailed Error Information')
    console.error('Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    console.error('Component Stack:', errorInfo.componentStack)
    console.groupEnd()

    this.setState({ errorInfo })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-4 text-center">
          <div className="w-full max-w-md space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <div className="text-muted-foreground space-y-2">
              <p className="font-medium text-destructive">
                {this.state.error?.name}: {this.state.error?.message}
              </p>
              {process.env.NODE_ENV === 'development' && (
                <pre className="mt-2 text-xs text-left bg-muted p-4 rounded-lg overflow-auto max-h-[200px]">
                  {this.state.error?.stack}
                  {'\n\nComponent Stack:\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              )}
            </div>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null })
                window.location.reload()
              }}
              className="mt-4"
            >
              Try again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

