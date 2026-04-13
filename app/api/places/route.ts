import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { places } from '@/db/schema'
import { placeSchema } from '@/lib/schemas'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await db
    .select()
    .from(places)
    .where(eq(places.userId, userId))
    .orderBy(places.createdAt)

  return NextResponse.json({ places: rows })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = placeSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const [place] = await db
    .insert(places)
    .values({ ...parsed.data, userId })
    .returning()

  return NextResponse.json({ place }, { status: 201 })
}
