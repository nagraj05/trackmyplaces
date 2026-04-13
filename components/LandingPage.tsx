'use client'

import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import Navbar from './Navbar'
import SignInModal from './auth/SignInModal'
import SignUpModal from './auth/SignUpModal'

// ─── Animation variants ────────────────────────────────────────────────────

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

// ─── Feature data ──────────────────────────────────────────────────────────

const features = [
  {
    icon: (
      <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    ),
    title: 'Interactive Map',
    description:
      'Drop pins anywhere in the world. Search by name or tap the map to log a visit in seconds.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ),
    title: 'Rate & Remember',
    description:
      'Log star ratings, visit dates, personal notes and custom tags so you never forget a great spot.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
      </svg>
    ),
    title: 'Browse History',
    description:
      'Switch between map and list view. Filter your collection by type, rating, or date visited.',
  },
]

// ─── Map preview ───────────────────────────────────────────────────────────

const PINS = [
  { color: '#22C55E', top: '28%', left: '33%' },
  { color: '#EF4444', top: '52%', left: '54%' },
  { color: '#F59E0B', top: '38%', left: '68%' },
  { color: '#9CA3AF', top: '64%', left: '38%' },
  { color: '#22C55E', top: '22%', left: '58%' },
  { color: '#F59E0B', top: '70%', left: '62%' },
]

function MapPreview() {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl shadow-black/40">
      {/* Browser chrome */}
      <div className="bg-slate-900 px-4 py-3 flex items-center gap-3 border-b border-slate-800">
        <div className="flex gap-1.5">
          {['bg-red-500/60', 'bg-amber-500/60', 'bg-green-500/60'].map(c => (
            <div key={c} className={`w-3 h-3 rounded-full ${c}`} />
          ))}
        </div>
        <div className="flex-1 bg-slate-800 rounded-md h-5 max-w-xs mx-auto" />
      </div>

      {/* Map body */}
      <div
        className="relative h-56 sm:h-72 bg-slate-800"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }}
      >
        {/* Subtle roads */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/3 left-0 right-0 h-px bg-slate-400" />
          <div className="absolute top-2/3 left-0 right-0 h-px bg-slate-400" />
          <div className="absolute left-1/3 top-0 bottom-0 w-px bg-slate-400" />
          <div className="absolute left-2/3 top-0 bottom-0 w-px bg-slate-400" />
        </div>

        {/* Pins */}
        {PINS.map((pin, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 300 }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ top: pin.top, left: pin.left }}
          >
            <div
              className="w-3.5 h-3.5 rounded-full border-2 border-white/30 shadow-lg"
              style={{ backgroundColor: pin.color }}
            />
          </motion.div>
        ))}

        {/* Detail card overlay */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="absolute bottom-4 right-4 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-xl p-3 shadow-xl w-44"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
            <span className="text-white text-xs font-semibold truncate">The Ivy Chelsea</span>
          </div>
          <div className="flex gap-0.5 mb-1.5">
            {[1, 2, 3, 4, 5].map(i => (
              <svg
                key={i}
                className={`w-3 h-3 ${i <= 4 ? 'text-amber-400' : 'text-slate-600'}`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </div>
          <div className="flex gap-1 flex-wrap">
            {['date night', 'great vibes'].map(tag => (
              <span key={tag} className="text-slate-400 text-[10px] bg-slate-800 rounded px-1.5 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────

export default function LandingPage() {
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)

  function openSignIn() { setShowSignUp(false); setShowSignIn(true) }
  function openSignUp() { setShowSignIn(false); setShowSignUp(true) }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-green-500/30">
      <Navbar onSignIn={openSignIn} onSignUp={openSignUp} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="pt-36 pb-20 px-4 sm:px-6 flex flex-col items-center text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-3xl mx-auto flex flex-col items-center gap-7"
        >
          {/* Badge */}
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-700 bg-slate-800/60 text-slate-300 text-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Your personal place journal
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.06]"
          >
            Track every place
            <br />
            <span className="text-green-400">you love.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={fadeUp}
            className="text-lg sm:text-xl text-slate-400 max-w-xl leading-relaxed"
          >
            Drop a pin for every restaurant, pub, or café you visit. Log ratings, notes and
            tags — then relive every great meal, anytime.
          </motion.p>

          {/* CTA buttons */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={openSignUp}
              className="w-full sm:w-auto bg-green-500 hover:bg-green-400 text-white font-semibold px-8 py-3.5 rounded-full text-base transition-colors"
            >
              Get started free
            </motion.button>
            <button
              onClick={openSignIn}
              className="w-full sm:w-auto border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-medium px-8 py-3.5 rounded-full text-base transition-all"
            >
              Sign in
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Map preview ──────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-4xl mx-auto"
        >
          <MapPreview />
        </motion.div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-32">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-center mb-4"
          >
            Everything you need to remember
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-slate-400 text-center mb-12 max-w-lg mx-auto"
          >
            Built for people who love good food and good places.
          </motion.p>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5"
          >
            {features.map(f => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 hover:border-slate-600 transition-colors cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-700/80 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center bg-gradient-to-b from-slate-800 to-slate-800/60 border border-slate-700 rounded-3xl p-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Start tracking today.
          </h2>
          <p className="text-slate-400 mb-8">
            Free to use. No credit card required.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={openSignUp}
            className="bg-green-500 hover:bg-green-400 text-white font-semibold px-10 py-3.5 rounded-full text-base transition-colors"
          >
            Create your map
          </motion.button>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span className="font-medium text-slate-400">TrackMyPlaces</span>
          </div>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </footer>

      {/* ── Auth modals ──────────────────────────────────────────────── */}
      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSwitchToSignUp={openSignUp}
      />
      <SignUpModal
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToSignIn={openSignIn}
      />
    </div>
  )
}
