import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useGSAP } from '../../shared/hooks/useGSAP'
import ConfigureMatch from './components/ConfigureMatch'
import ActiveEngagements from './components/ActiveEngagements'

/**
 * SetupPage — "Initiate Protocol: Battle Setup" page.
 * Contains the hero heading, ConfigureMatch form, and ActiveEngagements section.
 * GSAP animates the hero text and card in on mount.
 * On "ENGAGE PROTOCOL" click, navigates to the battle page.
 */
const SetupPage = () => {
  const navigate = useNavigate()
  const [modelAlpha, setModelAlpha] = useState('')
  const [modelBeta, setModelBeta] = useState('')

  const { containerRef } = useGSAP((self) => {
    self.add(() => {
      gsap.from('.setup-heading', {
        y: 40,
        opacity: 0,
        duration: 0.65,
        ease: 'power3.out',
      })
      gsap.from('.setup-content', {
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.55,
        delay: 0.2,
        ease: 'power2.out',
      })
    })
  }, [])

  /**
   * handleEngage — validates both models are selected, then navigates
   * to the battle view. In production, this can pass selected models
   * as route state or query params.
   */
  const handleEngage = () => {
    if (!modelAlpha || !modelBeta) return
    navigate('/battle', { state: { modelAlpha, modelBeta } })
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-arena-white">
      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">
        {/* Hero heading */}
        <div className="setup-heading">
          <p className="font-mono text-sm font-bold uppercase tracking-widest text-arena-black/50 mb-2">
            Initiate Protocol:
          </p>
          <h1 className="font-mono text-5xl md:text-6xl font-bold uppercase leading-none text-arena-black">
            Battle{' '}
            <span
              className="text-arena-yellow"
              style={{ WebkitTextStroke: '2px #000' }}
            >
              Setup
            </span>
          </h1>
        </div>

        {/* Configure Match form */}
        <div className="setup-content">
          <ConfigureMatch
            modelAlpha={modelAlpha}
            modelBeta={modelBeta}
            onAlphaChange={setModelAlpha}
            onBetaChange={setModelBeta}
            onEngage={handleEngage}
          />
        </div>

        {/* Active Engagements */}
        <div className="setup-content">
          <ActiveEngagements />
        </div>
      </div>
    </div>
  )
}

export default SetupPage
