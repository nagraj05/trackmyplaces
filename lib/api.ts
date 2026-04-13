import type { Place, PlaceFormData } from '@/types/place'

export async function fetchPlaces(): Promise<Place[]> {
  const res = await fetch('/api/places')
  if (!res.ok) throw new Error('Failed to fetch places')
  const data = await res.json()
  return data.places
}

export async function createPlace(data: PlaceFormData): Promise<Place> {
  const res = await fetch('/api/places', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'Failed to create place')
  }
  return (await res.json()).place
}

export async function updatePlace(id: string, data: Partial<PlaceFormData>): Promise<Place> {
  const res = await fetch(`/api/places/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'Failed to update place')
  }
  return (await res.json()).place
}

export async function deletePlace(id: string): Promise<void> {
  const res = await fetch(`/api/places/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'Failed to delete place')
  }
}
