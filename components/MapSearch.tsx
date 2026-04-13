'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { searchPlaces, type NominatimResult } from '@/lib/nominatim'

// Maps OSM amenity/class to a short readable label
function placeLabel(result: NominatimResult): string {
  const amenity = result.extratags?.amenity ?? result.type
  const labels: Record<string, string> = {
    restaurant: 'Restaurant',
    pub: 'Pub',
    cafe: 'Café',
    bar: 'Bar',
    fast_food: 'Fast food',
    food_court: 'Food court',
    biergarten: 'Beer garden',
  }
  return amenity ? (labels[amenity] ?? amenity) : ''
}

// Badge colour by amenity type
function badgeClass(result: NominatimResult): string {
  const amenity = result.extratags?.amenity ?? result.type
  switch (amenity) {
    case 'restaurant': return 'bg-green-100 text-green-700'
    case 'pub':        return 'bg-red-100 text-red-700'
    case 'cafe':       return 'bg-amber-100 text-amber-700'
    case 'bar':        return 'bg-amber-100 text-amber-700'
    default:           return 'bg-gray-100 text-gray-500'
  }
}

interface MapSearchProps {
  onSelectPlace: (lat: number, lng: number, name: string, address: string) => void
}

export default function MapSearch({ onSelectPlace }: MapSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setOpen(false)
      return
    }
    setIsSearching(true)
    const timer = setTimeout(async () => {
      const res = await searchPlaces(query, 7)
      setResults(res)
      setOpen(res.length > 0)
      setIsSearching(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleSelect(result: NominatimResult) {
    const nameParts = result.display_name.split(', ')
    const name = nameParts.slice(0, 2).join(', ')
    onSelectPlace(parseFloat(result.lat), parseFloat(result.lon), name, result.display_name)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search input */}
      <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl px-3.5 py-2.5 shadow-lg shadow-black/10">
        <svg
          className="w-4 h-4 text-gray-400 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search restaurants, pubs, cafés…"
          className="flex-1 text-sm bg-transparent outline-none text-gray-900 placeholder-gray-400 min-w-0"
        />

        {/* Spinner */}
        {isSearching && (
          <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin shrink-0" />
        )}

        {/* Clear */}
        {query && !isSearching && (
          <button
            type="button"
            onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus() }}
            className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 transition-colors shrink-0"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full mt-2 left-0 right-0 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-xl shadow-black/10 overflow-hidden z-10"
          >
            <ul>
              {results.map((result, i) => {
                const label = placeLabel(result)
                const nameParts = result.display_name.split(', ')
                const name = nameParts.slice(0, 2).join(', ')
                const subtext = nameParts.slice(2, 5).join(', ')

                return (
                  <li key={result.place_id} className={i > 0 ? 'border-t border-gray-100' : ''}>
                    <button
                      type="button"
                      onMouseDown={e => e.preventDefault()} // prevent blur before click fires
                      onClick={() => handleSelect(result)}
                      className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors flex items-start gap-3"
                    >
                      {/* Pin icon */}
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-900 truncate">{name}</span>
                          {label && (
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${badgeClass(result)}`}>
                              {label}
                            </span>
                          )}
                        </div>
                        {subtext && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">{subtext}</p>
                        )}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-1.5">
              <svg className="w-3 h-3 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
              <span className="text-[10px] text-gray-300">Powered by OpenStreetMap</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
