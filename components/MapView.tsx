'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchPlaces } from '@/lib/api'
import TopBar from './TopBar'
import MapSearch from './MapSearch'
import AddPlaceModal from './AddPlaceModal'
import PlaceDetailPanel from './PlaceDetailPanel'
import type { Place } from '@/types/place'

// Leaflet requires the browser — SSR must be disabled
const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading map…</p>
      </div>
    </div>
  ),
})

interface FlyTarget { lat: number; lng: number; zoom: number }

interface AddModalState {
  open: boolean
  lat: number
  lng: number
  prefill?: { name?: string; address?: string }
}

export default function MapView() {
  const { data: places = [] } = useQuery({
    queryKey: ['places'],
    queryFn: fetchPlaces,
  })

  const [selectedId, setSelectedId]   = useState<string | null>(null)
  const [flyTarget, setFlyTarget]     = useState<FlyTarget | null>(null)
  const [addModal, setAddModal]       = useState<AddModalState>({ open: false, lat: 0, lng: 0 })

  const selectedPlace: Place | null = places.find(p => p.id === selectedId) ?? null

  // User clicked the map background
  function handleMapClick(lat: number, lng: number) {
    if (selectedId) { setSelectedId(null); return }
    setAddModal({ open: true, lat, lng })
  }

  // User clicked an existing pin
  function handlePinClick(place: Place) {
    setSelectedId(place.id)
    setAddModal(prev => ({ ...prev, open: false }))
  }

  // User picked a result from the search bar
  function handleSelectPlace(lat: number, lng: number, name: string, address: string) {
    setFlyTarget({ lat, lng, zoom: 17 })
    setSelectedId(null)
    setAddModal({ open: true, lat, lng, prefill: { name, address } })
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar currentView="map" />

      <div className="flex-1 relative">
        <Map
          places={places}
          selectedId={selectedId}
          onMapClick={handleMapClick}
          onPinClick={handlePinClick}
          flyTarget={flyTarget}
        />

        {/* Search bar — floats over the map, centred at the top */}
        <div className="absolute top-3 left-0 right-0 z-[1000] flex justify-center px-4 pointer-events-none">
          <div className="w-full max-w-sm pointer-events-auto">
            <MapSearch onSelectPlace={handleSelectPlace} />
          </div>
        </div>

        <AddPlaceModal
          isOpen={addModal.open}
          onClose={() => setAddModal(prev => ({ ...prev, open: false }))}
          lat={addModal.lat}
          lng={addModal.lng}
          prefill={addModal.prefill}
        />

        <PlaceDetailPanel
          place={selectedPlace}
          onClose={() => setSelectedId(null)}
        />
      </div>
    </div>
  )
}
