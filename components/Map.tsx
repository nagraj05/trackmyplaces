'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import PlacePin from './PlacePin'
import type { Place } from '@/types/place'

// ─── Inject pin-pop keyframe once when Map mounts ─────────────────────────

function usePinPopAnimation() {
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'pin-pop-keyframe'
    if (!document.getElementById('pin-pop-keyframe')) {
      style.textContent = `
        @keyframes pin-pop {
          0%   { transform: scale(0.4); }
          60%  { transform: scale(1.2); }
          100% { transform: scale(1);   }
        }
      `
      document.head.appendChild(style)
    }
    return () => {
      const el = document.getElementById('pin-pop-keyframe')
      if (el) el.remove()
    }
  }, [])
}

// ─── Map click handler (must live inside MapContainer) ────────────────────

interface MapClickHandlerProps {
  onClick: (lat: number, lng: number) => void
}

function MapClickHandler({ onClick }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// ─── Main component ───────────────────────────────────────────────────────

export interface MapProps {
  places: Place[]
  selectedId: string | null
  onMapClick: (lat: number, lng: number) => void
  onPinClick: (place: Place) => void
}

export default function Map({ places, selectedId, onMapClick, onPinClick }: MapProps) {
  usePinPopAnimation()

  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      // Prevents default Leaflet focus outline that clashes with Tailwind resets
      attributionControl
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
        maxZoom={19}
      />

      <MapClickHandler onClick={onMapClick} />

      <MarkerClusterGroup chunkedLoading>
        {places.map(place => (
          <PlacePin
            key={place.id}
            place={place}
            isSelected={place.id === selectedId}
            onClick={() => onPinClick(place)}
          />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}
