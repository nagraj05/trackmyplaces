'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { UserButton } from '@clerk/nextjs'

interface TopBarProps {
  currentView: 'map' | 'list'
}

export default function TopBar({ currentView }: TopBarProps) {
  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="h-14 bg-white border-b border-gray-200 flex items-center px-4 sm:px-5 gap-4 z-30 shrink-0"
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-1.5 text-gray-900 hover:text-green-600 transition-colors shrink-0"
      >
        <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        <span className="font-semibold text-sm hidden sm:inline">TrackMyPlaces</span>
      </Link>

      {/* View toggle — centred */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mx-auto">
        <Link
          href="/map"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            currentView === 'map'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" strokeLinejoin="round" />
            <line x1="9" y1="3" x2="9" y2="18" />
            <line x1="15" y1="6" x2="15" y2="21" />
          </svg>
          Map
        </Link>
        <Link
          href="/list"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            currentView === 'list'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6" strokeLinecap="round" />
            <line x1="8" y1="12" x2="21" y2="12" strokeLinecap="round" />
            <line x1="8" y1="18" x2="21" y2="18" strokeLinecap="round" />
            <circle cx="3" cy="6" r="1" fill="currentColor" stroke="none" />
            <circle cx="3" cy="12" r="1" fill="currentColor" stroke="none" />
            <circle cx="3" cy="18" r="1" fill="currentColor" stroke="none" />
          </svg>
          List
        </Link>
      </div>

      {/* User */}
      <div className="shrink-0">
        <UserButton afterSignOutUrl="/" />
      </div>
    </motion.header>
  )
}
