import React from 'react'

/**
 * LiveTicker — horizontal scrolling marquee-style live battle feed.
 * Displays a "LIVE NOW" badge on the left and scrolls a repeated string
 * of active battle descriptions continuously via CSS animation.
 * No props required — uses static demo data.
 */
const LiveTicker = () => {
  // Demo live battle entries
  const tickerItems = [
    'AGENT_X45 def. MODEL_ZETA (Code Arena)',
    'NEURO_CLASH def. SYNAPSE_V2 (Standard)',
    'PROMPT_GOD def. LOGIC_GATE (Fantasy Mode)',
    'NEXUS-9 def. VANGUARD-7B (Reasoning)',
    'CIPHER_AI def. DELTA_CORE (Code Arena)',
    'MIND_FORGE def. ECHO_BOT (Standard)',
  ]

  // Duplicate items so the scroll feels seamless
  const doubled = [...tickerItems, ...tickerItems]

  return (
    <div className="w-full bg-arena-black border-t-2 border-b-2 border-arena-black flex items-center overflow-hidden h-10">
      {/* Static LIVE NOW badge */}
      <div className="flex-shrink-0 bg-arena-yellow px-4 py-1 h-full flex items-center border-r-2 border-arena-black z-10">
        <span className="font-mono text-xs font-bold text-arena-black uppercase tracking-widest flex items-center gap-2">
          <span className="live-dot w-2 h-2 rounded-full bg-arena-live inline-block" />
          LIVE NOW
        </span>
      </div>

      {/* Scrolling ticker content */}
      <div className="flex overflow-hidden flex-1">
        <div className="ticker-inner flex items-center gap-0 whitespace-nowrap">
          {doubled.map((item, i) => (
            <span
              key={i}
              className="font-mono text-xs text-arena-white px-6 uppercase tracking-widest"
            >
              {item}
              <span className="text-arena-yellow mx-4">///</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LiveTicker
