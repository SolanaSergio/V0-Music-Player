import { Featured } from '@/components/desktop/featured'
import { featuredTracks } from '@/data/audio'

export default function NewPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">New Releases</h1>
      <Featured tracks={featuredTracks} />
    </div>
  )
}

