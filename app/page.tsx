import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/LandingPage'

export const metadata = {
  title: 'TrackMyPlaces — Your Personal Place Journal',
  description:
    'Drop a pin for every restaurant, pub, or café you visit. Log ratings, notes and tags — then relive every great meal.',
}

export default async function Page() {
  const { userId } = await auth()
  if (userId) redirect('/map')

  return <LandingPage />
}
