export interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address: {
    road?: string
    city?: string
    town?: string
    village?: string
    country?: string
    postcode?: string
  }
}

export async function searchPlaces(query: string): Promise<NominatimResult[]> {
  if (!query.trim()) return []

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'TrackMyPlaces/1.0' },
  })

  if (!res.ok) return []

  return res.json()
}
