import React from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useGSAP } from '../../shared/hooks/useGSAP'
import BattlegroundCard from './components/BattlegroundCard'
import LiveTicker from './components/LiveTicker'

/**
 * ArenaPage — the main landing/home page of AI Battle Arena.
 * Displays the hero headline "CHOOSE YOUR BATTLEGROUND",
 * a 2x2 grid of arena mode cards, and the live ticker at the bottom.
 * GSAP animates the heading and cards in from below on mount.
 */
const ArenaPage = () => {
  const navigate = useNavigate()

  const { containerRef } = useGSAP((self) => {
    self.add(() => {
      // Animate heading
      gsap.from('.arena-heading', {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      })
      // Stagger the 4 arena cards
      gsap.from('.arena-card', {
        y: 50,
        opacity: 0,
        stagger: 0.12,
        duration: 0.6,
        delay: 0.2,
        ease: 'power2.out',
      })
    })
  }, [])

  // Arena mode configurations
  const arenaCards = [
    {
      id: 'standard',
      title: 'Standard 1v1',
      icon: '⚔',
      description:
        'Classic algorithmic combat. Two agents enter, one optimizes.',
      modeLabel: 'ELO Rated',
      activeCount: 'Active: 1,284',
      accentColor: 'bg-arena-cyan',
      path: '/setup',
    },
    {
      id: 'code',
      title: 'Code Arena',
      icon: '<>',
      description:
        'Syntax execution speed and logic puzzle domination. Raw compute wins.',
      modeLabel: 'Speed Run',
      activeCount: 'Active: 890',
      accentColor: 'bg-arena-yellow',
      path: '/battle',
    },
    {
      id: 'reasoning',
      title: 'Reasoning Arena',
      icon: '⚙',
      description:
        'Complex multi-step logical deduction. Deep thinking required.',
      modeLabel: 'Deep Eval',
      activeCount: 'Active: 342',
      accentColor: 'bg-arena-pink',
      path: '/battle',
    },
    {
      id: 'fantasy',
      title: 'Fantasy Mode',
      icon: '✦',
      description:
        'Unrestricted prompt battles. Creative destruction and hallu-combat.',
      modeLabel: 'Chaos Tier',
      activeCount: 'Experimental',
      accentColor: 'bg-arena-purple',
      path: '/',
    },
  ]

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col">
      {/* Hero section */}
      <section className="flex-1 max-w-7xl mx-auto w-full px-6 pt-16 pb-12">
        {/* Heading */}
        <div className="arena-heading mb-4">
          <h1 className="font-mono text-5xl md:text-7xl font-bold uppercase leading-none tracking-tight text-arena-black">
            Choose Your
            <br />
            Battleground
          </h1>
        </div>

        {/* Subheading */}
        <p className="arena-heading font-sans text-base text-arena-black/60 mb-12 max-w-lg">
          Deploy your autonomous agents into specialized combat environments.
          <br />
          High-stakes simulation protocol initiated.
        </p>

        {/* 2x2 Arena Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {arenaCards.map((card) => (
            <div key={card.id} className="arena-card">
              <BattlegroundCard
                title={card.title}
                icon={card.icon}
                description={card.description}
                modeLabel={card.modeLabel}
                activeCount={card.activeCount}
                accentColor={card.accentColor}
                onClick={() => navigate(card.path)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Live battle ticker — pinned above footer */}
      <LiveTicker />
    </div>
  )
}

export default ArenaPage
