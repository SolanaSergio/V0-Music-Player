import { Metadata } from 'next'
import { RadioStations } from '@/components/radio-stations'

export const metadata: Metadata = {
  title: 'Radio Stations | Music App',
  description: 'Listen to live radio stations from around the world',
}

export default function RadioPage() {
  return (
    <div className="container py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Radio Stations</h1>
        <p className="text-muted-foreground text-lg">
          Listen to live radio stations from around the world. Choose from a variety of genres and discover new music.
        </p>
      </div>
      <RadioStations />
    </div>
  )
}

