import { pgTable, uuid, text, integer, date, real, timestamp } from 'drizzle-orm/pg-core'

export const places = pgTable('places', {
  id:        uuid('id').defaultRandom().primaryKey(),
  userId:    text('user_id').notNull(),
  name:      text('name').notNull(),
  type:      text('type').notNull(),        // 'restaurant' | 'pub' | 'cafe' | 'bar'
  address:   text('address').notNull(),
  lat:       real('lat').notNull(),
  lng:       real('lng').notNull(),
  rating:    integer('rating'),             // 1–5, nullable
  visitedAt: date('visited_at'),            // nullable
  notes:     text('notes'),                 // nullable
  tags:      text('tags').array(),          // nullable
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
