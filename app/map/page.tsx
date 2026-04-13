import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import MapView from '@/components/MapView'

export const metadata = {
  title: 'Map — TrackMyPlaces',
  description: 'Your visited places on an interactive map.',
}

export default async function MapPage() {
  const { userId } = await auth()
  if (!userId) redirect('/')

  return <MapView />
}
