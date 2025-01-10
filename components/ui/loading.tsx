import { LoadingSpinner } from './loading-spinner'

interface LoadingProps {
  text?: string
}

export function Loading({ text = 'Loading...' }: LoadingProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

