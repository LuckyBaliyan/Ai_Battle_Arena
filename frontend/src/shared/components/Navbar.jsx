import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useGSAP } from '../hooks/useGSAP'

/**
 * Navbar top navigation bar shared across all pages.
 * Desktop: shows brand, inline nav links, and "INITIATE BATTLE" CTA.
 * Mobile: shows brand + hamburger icon; nav links drop into a full-width
 * mobile menu drawer below the bar when toggled.
 * GSAP animates items in on mount.
 */
const Navbar = () => {
  const navigate = useNavigate()
  // Controls mobile menu drawer open/closed state
  const [menuOpen, setMenuOpen] = useState(false)

  const { containerRef } = useGSAP((self) => {
    self.add(() => {
      // Slide nav items in from top on page load
      gsap.from('.nav-item', {
        y: -30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.5,
        ease: 'power2.out',
      })
    })
  }, [])

  /**
   * linkClass — returns appropriate Tailwind classes for NavLink based on
   * whether the route is currently active.
   */
  const linkClass = ({ isActive }) =>
    `nav-item font-mono text-sm font-bold uppercase tracking-widest px-1 py-1 transition-colors duration-150 ${isActive
      ? 'text-arena-black border-b-2 border-arena-black'
      : 'text-arena-black/50 hover:text-arena-black'
    }`

  /**
   * mobileLinkClass — larger touch targets for the mobile drawer.
   */
  const mobileLinkClass = ({ isActive }) =>
    `font-mono text-base font-bold uppercase tracking-widest py-3 px-2 border-b border-arena-black/10 w-full block transition-colors duration-150 ${isActive ? 'text-arena-black' : 'text-arena-black/50'
    }`

  return (
    <nav
      ref={containerRef}
      className="w-full border-b-2 border-arena-black bg-arena-white sticky top-0 z-50"
    >
      {/* ─── Main bar ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <NavLink to="/" className="nav-item flex-shrink-0">
          <span className="font-mono text-base sm:text-xl font-bold tracking-tight text-arena-black select-none">
            AI_ARENA_V1.0
          </span>
        </NavLink>

        {/* Desktop nav links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <NavLink to="/" end className={linkClass}>Arena</NavLink>
          <NavLink to="/leaderboard" className={linkClass}>Leaderboard</NavLink>
          <NavLink to="/setup" className={linkClass}>Fantasy Mode</NavLink>
        </div>

        {/* Right side: CTA + hamburger */}
        <div className="flex items-center gap-3">
          {/* CTA — hidden on very small screens, shown from sm */}
          <button
            className="nav-item brutal-btn bg-arena-yellow text-arena-black -translate-y-[20%] px-3 sm:px-5 py-2 text-xs sm:text-sm hidden sm:block"
            onClick={() => navigate('/setup')}
          >
            Initiate Battle
          </button>

          {/* Hamburger button — visible only on mobile */}
          <button
            id="nav-hamburger"
            className="md:hidden brutal-border bg-arena-white p-2 flex flex-col justify-center items-center gap-1 cursor-pointer"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span
              className={`block w-5 h-0.5 bg-arena-black transition-transform duration-200 origin-center ${menuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}
            />
            <span
              className={`block w-5 h-0.5 bg-arena-black transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''
                }`}
            />
            <span
              className={`block w-5 h-0.5 bg-arena-black transition-transform duration-200 origin-center ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
            />
          </button>
        </div>
      </div>

      {/* ─── Mobile drawer — slides in when menuOpen ─── */}
      {menuOpen && (
        <div className="md:hidden border-t-2 border-arena-black bg-arena-white px-4 py-2">
          <NavLink
            to="/"
            end
            className={mobileLinkClass}
            onClick={() => setMenuOpen(false)}
          >
            Arena
          </NavLink>
          <NavLink
            to="/leaderboard"
            className={mobileLinkClass}
            onClick={() => setMenuOpen(false)}
          >
            Leaderboard
          </NavLink>
          <NavLink
            to="/setup"
            className={mobileLinkClass}
            onClick={() => setMenuOpen(false)}
          >
            Fantasy Mode
          </NavLink>
          {/* CTA in drawer for xs screens */}
          <div className="pt-3 pb-2 sm:hidden">
            <button
              className="brutal-btn bg-arena-yellow text-arena-black px-5 py-3 text-sm w-full"
              onClick={() => { navigate('/setup'); setMenuOpen(false) }}
            >
              Initiate Battle
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
