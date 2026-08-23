import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Footer — shared bottom bar across all pages.
 * Displays brand name on the left, copyright notice,
 * and utility links (System Status, API Docs, Source, Privacy) on the right.
 * Uses neobrutalism dark background with mono font for the "terminal" feel.
 */
const Footer = () => {
  return (
    <footer className="w-full bg-arena-black border-t-2 border-arena-black">
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left — Brand + copyright */}
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs font-bold text-arena-yellow tracking-widest uppercase">
            AI_ARENA_V1.0
          </span>
          <span className="font-mono text-xs text-arena-white/40 tracking-wider">
            ©2024 AUTONOMOUS_AGENTS_NULL_SEC
          </span>
        </div>

        {/* Right — Links */}
        <div className="flex items-center gap-6">
          {['System Status', 'API Docs', 'Source', 'Privacy'].map((label) => (
            <Link
              key={label}
              to="#"
              className="font-mono text-xs text-arena-white/50 hover:text-arena-white uppercase tracking-widest transition-colors duration-150"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer
