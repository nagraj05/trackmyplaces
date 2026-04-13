'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { updatePlace, deletePlace } from '@/lib/api'
import { capitalise, formatDate, getTypeBadgeClass, getPinColor } from '@/lib/utils'
import type { Place, PlaceType, PlaceFormData } from '@/types/place'

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

function placeToFormData(p: Place): PlaceFormData {
  return {
    name: p.name,
    type: p.type as PlaceType,
    address: p.address,
    lat: p.lat,
    lng: p.lng,
    rating: p.rating ?? undefined,
    visitedAt: p.visitedAt ?? undefined,
    notes: p.notes ?? undefined,
    tags: p.tags ?? [],
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────

function StarDisplay({ value }: { value: number | null }) {
  if (!value) return <span className="text-sm text-gray-400">No rating</span>
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={`text-lg leading-none ${s <= value ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
      ))}
    </div>
  )
}

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

type PanelMode = 'view' | 'edit' | 'confirm-delete'

export interface PlaceDetailPanelProps {
  place: Place | null
  onClose: () => void
}

export default function PlaceDetailPanel({ place, onClose }: PlaceDetailPanelProps) {
  const isDesktop = useIsDesktop()
  const queryClient = useQueryClient()

  const [mode, setMode] = useState<PanelMode>('view')
  const [form, setForm] = useState<PlaceFormData | null>(null)
  const [customTag, setCustomTag] = useState('')

  // When a new place is selected, reset to view mode and populate form
  useEffect(() => {
    if (place) {
      setMode('view')
      setForm(placeToFormData(place))
    }
  }, [place?.id])

  const updateMutation = useMutation({
    mutationFn: (data: PlaceFormData) => updatePlace(place!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] })
      setMode('view')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deletePlace(place!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] })
      onClose()
    },
  })

  function toggleTag(tag: string) {
    setForm(f => {
      if (!f) return f
      const tags = f.tags ?? []
      return { ...f, tags: tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag] }
    })
  }

  function addCustomTag() {
    const tag = customTag.trim().toLowerCase()
    if (!tag) return
    const tags = form?.tags ?? []
    if (!tags.includes(tag)) setForm(f => f ? { ...f, tags: [...(f.tags ?? []), tag] } : f)
    setCustomTag('')
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    updateMutation.mutate(form)
  }

  // Panel slides from right on desktop, bottom on mobile
  const panelVariants = {
    hidden: isDesktop ? { x: '100%' } : { y: '100%' },
    show:   isDesktop ? { x: 0 }      : { y: 0 },
    exit:   isDesktop ? { x: '100%' } : { y: '100%' },
  }

  const customTags = (form?.tags ?? []).filter(t => !TAG_SUGGESTIONS.includes(t))
  const pinColor = place ? getPinColor(place.type as PlaceType) : '#9CA3AF'

  return (
    <AnimatePresence>
      {place && (
        <>
          {/* Mobile backdrop only */}
          {!isDesktop && (
            <motion.div
              key="panel-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999] bg-black/30 md:hidden"
              onClick={onClose}
            />
          )}

          {/* Panel */}
          <motion.div
            key="panel"
            variants={panelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 bottom-0 left-0 md:left-auto md:top-0 z-[1000]
                       w-full md:w-96
                       max-h-[85vh] md:max-h-full
                       bg-white md:rounded-none rounded-t-2xl
                       shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Mobile drag handle */}
            <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Colored pin dot */}
                <div className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: pinColor }} />
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-gray-900 truncate">{place.name}</h2>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getTypeBadgeClass(place.type as PlaceType)}`}>
                    {capitalise(place.type)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0 ml-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">

              {/* ── View mode ────────────────────────────────────── */}
              {mode === 'view' && (
                <div className="px-5 py-4 space-y-4">
                  {/* Rating */}
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Rating</p>
                    <StarDisplay value={place.rating} />
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Visited</p>
                    <p className="text-sm text-gray-800">{formatDate(place.visitedAt)}</p>
                  </div>

                  {/* Address */}
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Address</p>
                    <p className="text-sm text-gray-800 leading-relaxed">{place.address}</p>
                  </div>

                  {/* Notes */}
                  {place.notes && (
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Notes</p>
                      <p className="text-sm text-gray-800 leading-relaxed">{place.notes}</p>
                    </div>
                  )}

                  {/* Tags */}
                  {place.tags && place.tags.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1.5">Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {place.tags.map(tag => (
                          <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Coordinates */}
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    </svg>
                    {place.lat.toFixed(5)}, {place.lng.toFixed(5)}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setMode('edit')}
                      className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => setMode('confirm-delete')}
                      className="flex-1 py-2.5 border border-red-200 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {/* ── Edit mode ─────────────────────────────────────── */}
              {mode === 'edit' && form && (
                <form id="edit-place-form" onSubmit={handleEditSubmit} className="px-5 py-4 space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => f ? { ...f, name: e.target.value } : f)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                    <div className="grid grid-cols-4 gap-2">
                      {PLACE_TYPES.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setForm(f => f ? { ...f, type: t } : f)}
                          className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                            form.type === t
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-200 text-gray-600 hover:border-green-300'
                          }`}
                        >
                          {capitalise(t)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={e => setForm(f => f ? { ...f, address: e.target.value } : f)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Rating</label>
                    <StarRating
                      value={form.rating}
                      onChange={v => setForm(f => f ? { ...f, rating: v || undefined } : f)}
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visited date</label>
                    <input
                      type="date"
                      value={form.visitedAt ?? ''}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={e => setForm(f => f ? { ...f, visitedAt: e.target.value || undefined } : f)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      rows={3}
                      value={form.notes ?? ''}
                      onChange={e => setForm(f => f ? { ...f, notes: e.target.value || undefined } : f)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
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
                                : 'border-gray-200 text-gray-500 hover:border-green-300'
                            }`}
                          >
                            {tag}
                          </button>
                        )
                      })}
                    </div>
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
                    {customTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {customTags.map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500 text-white flex items-center gap-1"
                          >
                            {tag} <span className="opacity-70">×</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* API error */}
                  {updateMutation.isError && (
                    <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                      {(updateMutation.error as Error).message}
                    </p>
                  )}
                </form>
              )}

              {/* ── Delete confirmation ───────────────────────────── */}
              {mode === 'confirm-delete' && (
                <div className="px-5 py-8 flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Delete &ldquo;{place.name}&rdquo;?</p>
                    <p className="text-sm text-gray-500 mt-1">This cannot be undone.</p>
                  </div>
                  {deleteMutation.isError && (
                    <p className="text-xs text-red-500">{(deleteMutation.error as Error).message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer — changes per mode */}
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3 shrink-0">
              {mode === 'view' && (
                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-600 transition-colors"
                >
                  Close
                </button>
              )}

              {mode === 'edit' && (
                <>
                  <button
                    type="button"
                    onClick={() => setMode('view')}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="edit-place-form"
                    disabled={updateMutation.isPending}
                    className="flex-1 py-2.5 bg-green-500 hover:bg-green-400 disabled:opacity-60 rounded-xl text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Saving…
                      </>
                    ) : 'Save changes'}
                  </button>
                </>
              )}

              {mode === 'confirm-delete' && (
                <>
                  <button
                    type="button"
                    onClick={() => setMode('view')}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 disabled:opacity-60 rounded-xl text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
                  >
                    {deleteMutation.isPending ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Deleting…
                      </>
                    ) : 'Delete'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
