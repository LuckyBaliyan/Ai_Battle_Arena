import React from 'react'

/**
 * FantasyLeague — ranked list of fantasy league AI combatants.
 * Each entry shows rank number, entity name, universe/category label,
 * and a win-rate badge. Uses neobrutalism card + alternating row style.
 *
 * @param {Array} entries - List of fantasy league entries:
 *   { rank, name, category, winRate }
 */
const FantasyLeague = ({ entries = [] }) => {
  // Default mock fantasy league data matching the design screenshot
  const defaultEntries = [
    { rank: 1, name: 'STARK-TECH-V2', category: 'Marvel Universe', winRate: '92%' },
    { rank: 2, name: 'WAYNE-TACTICAL', category: 'DC Universe', winRate: '89%' },
    { rank: 3, name: 'MAMBA-MENTALITY', category: 'Sports Icons', winRate: '85%' },
    { rank: 4, name: 'JEDI-MASTER-Y', category: 'Star Wars', winRate: '81%' },
    { rank: 5, name: 'SHERLOCK-DEDUCTION', category: 'Literature', winRate: '78%' },
  ]

  const items = entries.length ? entries : defaultEntries

  return (
    <div className="brutal-card bg-arena-white overflow-hidden">
      {/* Header */}
      <div className="border-b-2 border-arena-black px-5 py-3 flex items-center justify-between">
        <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-arena-black">
          Fantasy League
        </h3>
        <span className="font-mono text-lg text-arena-black/60">⚡</span>
      </div>

      {/* Entries */}
      <div className="flex flex-col">
        {items.map((entry, i) => (
          <div
            key={entry.rank}
            className={`flex items-center gap-4 px-5 py-4 border-b last:border-b-0 border-arena-black/10 hover:bg-arena-yellow/5 transition-colors duration-100 ${
              i === items.length - 1 ? 'pt-8' : ''
            }`}
          >
            {/* Rank number */}
            <span
              className={`font-mono text-lg font-bold w-6 flex-shrink-0 ${
                entry.rank <= 3 ? 'text-arena-black' : 'text-arena-black/40'
              }`}
            >
              {entry.rank}
            </span>

            {/* Entity info */}
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm font-bold text-arena-black uppercase truncate">
                {entry.name}
              </p>
              <p className="font-sans text-xs text-arena-black/50">{entry.category}</p>
            </div>

            {/* Win rate badge */}
            <div className="brutal-border px-3 py-1 flex-shrink-0">
              <span className="font-mono text-xs font-bold text-arena-black">
                Win: {entry.winRate}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FantasyLeague
