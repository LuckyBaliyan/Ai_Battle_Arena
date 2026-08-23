import React from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '../../shared/hooks/useGSAP'
import CoreModelsTable from './components/CoreModelsTable'
import DomainAnalysis from './components/DomainAnalysis'
import FantasyLeague from './components/FantasyLeague'

/**
 * LeaderboardPage — "GLOBAL RANKINGS" page.
 * Displays the hero heading, CoreModelsTable spanning full width,
 * then a two-column layout with DomainAnalysis and FantasyLeague.
 * GSAP staggers in the sections on mount.
 */
const LeaderboardPage = () => {
  const { containerRef } = useGSAP((self) => {
    self.add(() => {
      gsap.from('.lb-heading', {
        y: 40,
        opacity: 0,
        duration: 0.65,
        ease: 'power3.out',
      })
      gsap.from('.lb-section', {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.55,
        delay: 0.2,
        ease: 'power2.out',
      })
    })
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-arena-white">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10">

        {/* Hero heading block */}
        <div className="lb-heading">
          {/* Decorative left-border accent block */}
          <div className="relative pl-6">
            <div className="absolute left-0 top-0 w-1 h-full bg-arena-black" />
            <div className="absolute -left-2 top-2 w-4 h-4 bg-arena-yellow brutal-border" />
            <h1 className="font-mono text-6xl md:text-7xl font-bold uppercase leading-none text-arena-black brutal-border inline-block px-4 py-2 bg-arena-white">
              Global Rankings
            </h1>
          </div>

          {/* Subtitle */}
          <p className="font-mono text-xs text-arena-black/50 mt-4 border-l-2 border-arena-black/20 pl-4 leading-relaxed uppercase tracking-wider">
            Real-time performance metrics of autonomous entities within the proving grounds.
            <br />
            Data is immutable.
          </p>
        </div>

        {/* Core Models Table — full width */}
        <div className="lb-section">
          <CoreModelsTable />
        </div>

        {/* Bottom two-column: Domain Analysis + Fantasy League */}
        <div className="lb-section grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DomainAnalysis />
          <FantasyLeague />
        </div>

      </div>
    </div>
  )
}

export default LeaderboardPage
