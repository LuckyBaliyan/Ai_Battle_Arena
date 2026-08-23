import React from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * ActiveEngagements — table of currently live battles.
 * Each row shows a domain badge (e.g. CODE ARENA), model matchup,
 * task description, LIVE indicator, and a WATCH button to navigate to
 * the battle view.
 *
 * @param {Array} engagements - List of active battle objects with:
 *   { id, domain, modelA, modelB, task }
 */
const ActiveEngagements = ({ engagements = [] }) => {
  const navigate = useNavigate()

  // Default demo data used when no engagements are provided
  const defaultEngagements = [
    {
      id: 1,
      domain: 'CODE ARENA',
      modelA: 'GPT-4o',
      modelB: 'Claude-3.5',
      task: 'Quantum Algorithm Optimization',
    },
    {
      id: 2,
      domain: 'REASONING',
      modelA: 'Llama-3',
      modelB: 'Gemini-1.5',
      task: 'Ethical Dilemma Resolution',
    },
  ]

  const items = engagements.length ? engagements : defaultEngagements

  // Domain badge color map for visual distinction
  const domainColors = {
    'CODE ARENA': 'bg-arena-yellow',
    REASONING: 'bg-arena-pink',
    STANDARD: 'bg-arena-cyan',
    FANTASY: 'bg-arena-purple',
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center gap-0">
        <h2 className="font-mono text-sm font-bold uppercase tracking-widest bg-arena-black text-arena-white px-4 py-2">
          Active Engagements
        </h2>
      </div>

      {/* Engagement rows */}
      <div className="flex flex-col gap-3">
        {items.map((engagement) => {
          const domainBg = domainColors[engagement.domain] ?? 'bg-arena-white'

          return (
            <div
              key={engagement.id}
              className="brutal-card flex items-center gap-4 px-4 py-3 flex-wrap"
            >
              {/* Domain badge */}
              <span
                className={`${domainBg} brutal-border font-mono text-xs font-bold px-2 py-1 text-arena-black flex-shrink-0 uppercase`}
              >
                {engagement.domain}
              </span>

              {/* Matchup info */}
              <div className="flex-1 min-w-0">
                <span className="font-mono text-sm font-bold text-arena-black">
                  {engagement.modelA} v {engagement.modelB}
                </span>
                <span className="font-sans text-xs text-arena-black/50 ml-3">
                  Task: {engagement.task}
                </span>
              </div>

              {/* Live indicator + Watch button */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <span className="live-dot w-2 h-2 rounded-full bg-arena-live inline-block" />
                  <span className="font-mono text-xs text-arena-live font-bold">LIVE</span>
                </div>
                <button
                  onClick={() => navigate('/battle')}
                  className="brutal-btn bg-arena-yellow text-arena-black px-4 py-1 text-xs"
                >
                  WATCH
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ActiveEngagements
