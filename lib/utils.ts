import type { PlaceType } from '@/types/place'

// Tailwind class merge helper (lightweight, no extra dependency)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Returns the hex color for a selected pin based on place type
export function getPinColor(type: PlaceType): string {
  switch (type) {
    case 'restaurant': return '#22C55E'  // green-500
    case 'pub':        return '#EF4444'  // red-500
    case 'cafe':       return '#F59E0B'  // amber-500
    case 'bar':        return '#F59E0B'  // amber-500
  }
}

// Returns the Tailwind bg class for type badges in the list view
export function getTypeBadgeClass(type: PlaceType): string {
  switch (type) {
    case 'restaurant': return 'bg-green-100 text-green-700'
    case 'pub':        return 'bg-red-100 text-red-700'
    case 'cafe':       return 'bg-amber-100 text-amber-700'
    case 'bar':        return 'bg-amber-100 text-amber-700'
  }
}

// Formats an ISO date string (YYYY-MM-DD) to a readable format e.g. "12 Apr 2025"
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Capitalises the first letter of a string
export function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
