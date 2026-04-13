export type PlaceType = 'restaurant' | 'pub' | 'cafe' | 'bar'

export interface Place {
  id: string
  userId: string
  name: string
  type: PlaceType
  address: string
  lat: number
  lng: number
  rating: number | null
  visitedAt: string | null   // ISO date string (YYYY-MM-DD)
  notes: string | null
  tags: string[] | null
  createdAt: string
}

export interface PlaceFormData {
  name: string
  type: PlaceType
  address: string
  lat: number
  lng: number
  rating?: number
  visitedAt?: string
  notes?: string
  tags?: string[]
}
