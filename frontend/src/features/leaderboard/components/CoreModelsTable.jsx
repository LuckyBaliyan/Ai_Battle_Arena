import React from 'react'

/**
 * CoreModelsTable — neobrutalism-styled rankings table.
 * Displays RANK, ENTITY, ELO, WIN RATE, and PEAK columns.
 * Rank #1 gets a highlighted yellow row. Uses a thick top border header.
 *
 * @param {Array} models - Array of model objects:
 *   { rank, name, elo, winRate, peak }
 */
const CoreModelsTable = ({ models = [] }) => {
  // Default mock leaderboard data
  const defaultModels = [
    { rank: '01', name: 'Nexus-Omega-9', elo: 3452, winRate: '88.4%', peak: 3501 },
    { rank: '02', name: 'Vanguard-7B', elo: 3390, winRate: '82.1%', peak: 3410 },
    { rank: '03', name: 'LogicEngine-X', elo: 3215, winRate: '79.5%', peak: 3250 },
    { rank: '04', name: 'SynthWeaver-Creative', elo: 3100, winRate: '75.0%', peak: 3180 },
    { rank: '05', name: 'CodeMonkey-Prime', elo: 2980, winRate: '68.2%', peak: 3050 },
  ]

  const items = models.length ? models : defaultModels

  return (
    <div className="brutal-card overflow-hidden">
      {/* Table header bar */}
      <div className="bg-arena-yellow border-b-2 border-arena-black px-5 py-3 flex items-center justify-between">
        <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-arena-black">
          Core Models
        </h3>
        <span className="font-mono text-xs text-arena-black/60">≡ Filter</span>
      </div>

      {/* Column labels */}
      <div className="grid grid-cols-5 border-b-2 border-arena-black bg-arena-white">
        {['Rank', 'Entity', 'ELO', 'Win Rate', 'Peak'].map((col) => (
          <div
            key={col}
            className="font-mono text-xs font-bold uppercase tracking-widest text-arena-black px-4 py-3 border-r last:border-r-0 border-arena-black/20"
          >
            {col}
          </div>
        ))}
      </div>

      {/* Data rows */}
      {items.map((model, i) => (
        <div
          key={model.rank}
          className={`grid grid-cols-5 border-b border-arena-black/10 items-center hover:bg-arena-yellow/10 transition-colors duration-100 ${
            i === 0 ? 'bg-arena-yellow/20' : 'bg-arena-white'
          }`}
        >
          {/* Rank */}
          <div
            className={`px-4 py-3 font-mono text-sm font-bold ${
              i === 0 ? 'bg-arena-yellow text-arena-black' : 'text-arena-black/70'
            }`}
          >
            {model.rank}
          </div>
          {/* Entity */}
          <div className="px-4 py-3 font-sans text-sm text-arena-black">
            {model.name}
          </div>
          {/* ELO */}
          <div className="px-4 py-3 font-mono text-sm text-arena-black">
            {model.elo}
          </div>
          {/* Win Rate */}
          <div className="px-4 py-3 font-mono text-sm text-arena-black text-right">
            {model.winRate}
          </div>
          {/* Peak */}
          <div className="px-4 py-3 font-mono text-sm text-arena-black text-right">
            {model.peak}
          </div>
        </div>
      ))}
    </div>
  )
}

export default CoreModelsTable
