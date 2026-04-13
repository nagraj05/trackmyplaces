'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { searchPlaces, type NominatimResult } from '@/lib/nominatim'
import { createPlace } from '@/lib/api'
import { capitalise } from '@/lib/utils'
import type { PlaceType, PlaceFormData } from '@/types/place'

// ─── Constants ────────────────────────────────────────────────────────────

const PLACE_TYPES: PlaceType[] = ['restaurant', 'pub', 'cafe', 'bar']

const TAG_SUGGESTIONS = [
  'date night', 'cheap eats', 'great vibes', 'solo friendly',
  'group dinner', 'brunch', 'rooftop', 'hidden gem', 'must return', 'overrated',
]

// ─── Helpers ──────────────────────────────────────────────────────────────

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

function emptyForm(
  lat: number,
  lng: number,
  prefill?: { name?: string; address?: string },
): PlaceFormData {
  return { name: prefill?.name ?? '', type: 'restaurant', address: prefill?.address ?? '', lat, lng }
}

// ─── Sub-components ───────────────────────────────────────────────────────

function StarRating({ value, onChange }: { value: number | undefined; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star === value ? 0 : star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={`text-2xl leading-none transition-colors ${
            star <= (hovered || value || 0) ? 'text-amber-400' : 'text-gray-200 hover:text-amber-200'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────

export interface AddPlaceModalProps {
  isOpen: boolean
  onClose: () => void
  lat: number
  lng: number
  prefill?: { name?: string; address?: string }
}

export default function AddPlaceModal({ isOpen, onClose, lat, lng, prefill }: AddPlaceModalProps) {
  const isDesktop = useIsDesktop()
  const queryClient = useQueryClient()

  const [form, setForm] = useState<PlaceFormData>(emptyForm(lat, lng))
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [customTag, setCustomTag] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof PlaceFormData, string>>>({})

  // Reset state when modal opens / coordinates change
  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm(lat, lng, prefill))
      setSearch('')
      setResults([])
      setErrors({})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, lat, lng, prefill?.name, prefill?.address])

  // Debounced Nominatim search
  useEffect(() => {
    if (!search.trim()) { setResults([]); return }
    setIsSearching(true)
    const timer = setTimeout(async () => {
      const res = await searchPlaces(search)
      setResults(res)
      setIsSearching(false)
    }, 300)
    return () => { clearTimeout(timer) }
  }, [search])

  const mutation = useMutation({
    mutationFn: createPlace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] })
      onClose()
    },
  })

  function selectResult(result: NominatimResult) {
    const firstParts = result.display_name.split(', ').slice(0, 2).join(', ')
    setForm(f => ({
      ...f,
      name: f.name || firstParts,
      address: result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    }))
    setSearch('')
    setResults([])
  }

  function toggleTag(tag: string) {
    setForm(f => {
      const tags = f.tags ?? []
      return { ...f, tags: tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag] }
    })
  }

  function addCustomTag() {
    const tag = customTag.trim().toLowerCase()
    if (!tag) return
    const tags = form.tags ?? []
    if (!tags.includes(tag)) setForm(f => ({ ...f, tags: [...(f.tags ?? []), tag] }))
    setCustomTag('')
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof PlaceFormData, string>> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.address.trim()) errs.address = 'Address is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    mutation.mutate(form)
  }

  const panelVariants = {
    hidden: isDesktop ? { opacity: 0, scale: 0.97, y: -8 } : { y: '100%' },
    show:   isDesktop ? { opacity: 1, scale: 1,    y: 0   } : { y: 0 },
    exit:   isDesktop ? { opacity: 0, scale: 0.97, y: -8  } : { y: '100%' },
  }

  const customTags = (form.tags ?? []).filter(t => !TAG_SUGGESTIONS.includes(t))

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-[1100] ${isDesktop ? 'flex items-center justify-center p-4' : 'flex items-end'}`}>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            variants={panelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative z-10 w-full md:max-w-lg bg-white md:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] md:max-h-[88vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle (mobile) */}
            <div className="md:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Add a place</h2>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form id="add-place-form" onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">

              {/* Scrollable fields */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

                {/* Nominatim search */}
                <div className="relative">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search for a place by name…"
                      className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>

                  {/* Autocomplete dropdown */}
                  <AnimatePresence>
                    {results.length > 0 && (
                      <motion.ul
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                      >
                        {results.map(r => (
                          <li key={r.place_id} className="border-b border-gray-50 last:border-0">
                            <button
                              type="button"
                              onClick={() => selectResult(r)}
                              className="w-full text-left px-3 py-2.5 hover:bg-green-50 transition-colors"
                            >
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {r.display_name.split(', ').slice(0, 2).join(', ')}
                              </p>
                              <p className="text-xs text-gray-400 truncate mt-0.5">{r.display_name}</p>
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. The Ivy Chelsea"
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PLACE_TYPES.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                          form.type === t
                            ? 'bg-green-500 border-green-500 text-white shadow-sm'
                            : 'border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-600'
                        }`}
                      >
                        {capitalise(t)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="Full address"
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      errors.address ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Rating</label>
                  <StarRating
                    value={form.rating}
                    onChange={v => setForm(f => ({ ...f, rating: v || undefined }))}
                  />
                </div>

                {/* Visited date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visited date</label>
                  <input
                    type="date"
                    value={form.visitedAt ?? ''}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={e => setForm(f => ({ ...f, visitedAt: e.target.value || undefined }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={form.notes ?? ''}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value || undefined }))}
                    placeholder="What made this place special?"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {TAG_SUGGESTIONS.map(tag => {
                      const active = (form.tags ?? []).includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                            active
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600'
                          }`}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>

                  {/* Custom tag input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customTag}
                      onChange={e => setCustomTag(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag() } }}
                      placeholder="Add custom tag…"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addCustomTag}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-medium text-gray-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {/* Custom tags */}
                  {customTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {customTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500 text-white flex items-center gap-1"
                        >
                          {tag}
                          <span className="opacity-70">×</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Coordinates */}
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  </svg>
                  {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
                </p>

                {/* API error */}
                {mutation.isError && (
                  <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                    {(mutation.error as Error).message}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-gray-100 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1 py-2.5 bg-green-500 hover:bg-green-400 disabled:opacity-60 rounded-xl text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
                >
                  {mutation.isPending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : 'Add place'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
