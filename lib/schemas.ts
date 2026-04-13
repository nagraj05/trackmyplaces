import { z } from 'zod'

export const placeSchema = z.object({
  name:      z.string().min(1, 'Name is required').max(255),
  type:      z.enum(['restaurant', 'pub', 'cafe', 'bar']),
  address:   z.string().min(1, 'Address is required').max(500),
  lat:       z.number().min(-90).max(90),
  lng:       z.number().min(-180).max(180),
  rating:    z.number().int().min(1).max(5).optional(),
  visitedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  notes:     z.string().max(2000).optional(),
  tags:      z.array(z.string().max(50)).max(20).optional(),
})

export const placeUpdateSchema = placeSchema.partial()

export type PlaceInput = z.infer<typeof placeSchema>
export type PlaceUpdateInput = z.infer<typeof placeUpdateSchema>
