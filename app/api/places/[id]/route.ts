import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { places } from '@/db/schema'
import { placeUpdateSchema } from '@/lib/schemas'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const body = await req.json()
  const parsed = placeUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const [updated] = await db
    .update(places)
    .set(parsed.data)
    .where(and(eq(places.id, id), eq(places.userId, userId)))
    .returning()

  if (!updated) {
    return NextResponse.json({ error: 'Place not found' }, { status: 404 })
  }

  return NextResponse.json({ place: updated })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const [deleted] = await db
    .delete(places)
    .where(and(eq(places.id, id), eq(places.userId, userId)))
    .returning()

  if (!deleted) {
    return NextResponse.json({ error: 'Place not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
