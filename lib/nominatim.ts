export interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  type?: string   // e.g. 'restaurant', 'pub', 'cafe'
  class?: string  // e.g. 'amenity', 'tourism'
  extratags?: {
    amenity?: string
    cuisine?: string
    opening_hours?: string
    phone?: string
    website?: string
  }
  address: {
    road?: string
    suburb?: string
    city?: string
    town?: string
    village?: string
    country?: string
    postcode?: string
  }
}

export async function searchPlaces(
  query: string,
  limit = 6,
): Promise<NominatimResult[]> {
  if (!query.trim()) return []

  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(query)}` +
    `&format=json` +
    `&limit=${limit}` +
    `&addressdetails=1` +
    `&extratags=1`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'TrackMyPlaces/1.0' },
  })

  if (!res.ok) return []
  return res.json()
}
