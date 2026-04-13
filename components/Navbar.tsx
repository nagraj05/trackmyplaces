'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Show, UserButton } from '@clerk/nextjs'

interface NavbarProps {
  onSignIn: () => void
  onSignUp: () => void
}

export default function Navbar({ onSignIn, onSignUp }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 text-white">
          <svg className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span className="font-semibold text-lg tracking-tight">TrackMyPlaces</span>
        </div>

        {/* Auth controls */}
        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <button
              onClick={onSignIn}
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors px-2 py-1"
            >
              Sign in
            </button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onSignUp}
              className="bg-green-500 hover:bg-green-400 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
            >
              Get started
            </motion.button>
          </Show>

          <Show when="signed-in">
            <UserButton afterSignOutUrl="/" />
          </Show>
        </div>
      </div>
    </motion.header>
  )
}
