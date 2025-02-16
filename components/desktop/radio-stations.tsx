'use client'

import { RadioStationCard } from '@/components/desktop/radio-station-card'
import type { RadioStation } from '@/types/audio'

interface RadioStationsProps {
  stations: RadioStation[]
}

export function RadioStations({ stations }: RadioStationsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stations.map((station) => (
        <RadioStationCard
          key={station.id}
          station={station}
        />
      ))}
    </div>
  )
}

