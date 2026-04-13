'use client'

import { Marker } from 'react-leaflet'
import L from 'leaflet'
import type { Place } from '@/types/place'
import { getPinColor } from '@/lib/utils'

const UNSELECTED_COLOR = '#9CA3AF'

function createIcon(color: string, isSelected: boolean): L.DivIcon {
  const size = isSelected ? 36 : 28
  const height = Math.round(size * 1.35)

  return L.divIcon({
    className: '',
    html: `
      <div style="
        filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));
        ${isSelected ? 'animation: pin-pop 0.35s cubic-bezier(0.34,1.56,0.64,1);' : ''}
      ">
        <svg
          width="${size}"
          height="${height}"
          viewBox="0 0 28 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 24 14 24S28 24.5 28 14C28 6.27 21.73 0 14 0z"
            fill="${color}"
          />
          <circle cx="14" cy="14" r="6" fill="white" fill-opacity="0.9"/>
        </svg>
      </div>
    `,
    iconSize: [size, height],
    iconAnchor: [size / 2, height],
    popupAnchor: [0, -height],
  })
}

interface PlacePinProps {
  place: Place
  isSelected: boolean
  onClick: () => void
}

export default function PlacePin({ place, isSelected, onClick }: PlacePinProps) {
  const color = isSelected ? getPinColor(place.type) : UNSELECTED_COLOR
  const icon = createIcon(color, isSelected)

  return (
    <Marker
      position={[place.lat, place.lng]}
      icon={icon}
      zIndexOffset={isSelected ? 1000 : 0}
      eventHandlers={{
        click(e) {
          // Stop map click from firing when a pin is clicked
          e.originalEvent.stopPropagation()
          onClick()
        },
      }}
    />
  )
}
