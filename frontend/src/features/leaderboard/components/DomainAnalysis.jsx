import React from 'react'

/**
 * DomainAnalysis — stacked horizontal bar chart showing
 * comparative performance of the top 3 models across 4 cognitive domains:
 * Math, Reasoning, Creativity, Code.
 *
 * Each bar is divided into 3 colored segments (one per model)
 * with a legend at the bottom.
 *
 * No props needed — uses hardcoded design-matching demo data.
 */
const DomainAnalysis = () => {
  // Top 3 models represented in the chart
  const models = [
    { name: 'Nexus-Omega-9', color: 'bg-arena-yellow', legendColor: '#dcff00' },
    { name: 'Vanguard-7B', color: 'bg-arena-black', legendColor: '#0a0a0a' },
    { name: 'SynthWeaver-Creative', color: 'bg-arena-white border border-arena-black', legendColor: '#f5f5f0' },
  ]

  // Domain data: each domain has a score for each model (0-100)
  const domains = [
    { label: 'MATH', scores: [72, 55, 18] },
    { label: 'REASONING', scores: [85, 40, 20] },
    { label: 'CREATIVITY', scores: [38, 50, 30] },
    { label: 'CODE', scores: [60, 22, 55] },
  ]

  return (
    <div className="brutal-card text-black bg-arena-black p-5 flex flex-col gap-5">
      {/* Header */}
      <h3 className="font-mono text-black text-sm font-bold uppercase tracking-widest text-arena-white">
        Domain Analysis
      </h3>

      {/* Subtext */}
      <p className="font-sans text-black text-xs text-arena-white/40 leading-relaxed border-l-2 border-arena-yellow pl-3">
        Comparative performance across core cognitive domains.
        <br />
        Top 3 models visualized.
      </p>

      {/* Bar chart */}
      <div className="flex flex-col gap-4">
        {domains.map((domain) => {
          const total = domain.scores.reduce((a, b) => a + b, 0)
          return (
            <div key={domain.label}>
              {/* Domain label + scale */}
              <div className="flex text-black items-center justify-between mb-1">
                <span className="font-mono text-black text-xs text-arena-white/60 uppercase tracking-widest">
                  {domain.label}
                </span>
                <span className="font-mono text-black text-xs text-arena-white/30">SCALE: 0-100</span>
              </div>
              {/* Stacked bar */}
              <div className="w-full h-5 brutal-border flex overflow-hidden">
                {domain.scores.map((score, mi) => (
                  <div
                    key={mi}
                    className={`${models[mi].color} h-full transition-all duration-300`}
                    style={{ width: `${(score / 100) * 100}%` }}
                  />
                ))}
                {/* Remaining empty space */}
                <div
                  className="flex-1 bg-arena-surface"
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 border-t border-arena-white/10 pt-4 flex-wrap">
        {models.map((m) => (
          <div key={m.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 brutal-border flex-shrink-0"
              style={{ backgroundColor: m.legendColor }}
            />
            <span className="font-mono text-black text-xs text-arena-white/60">{m.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DomainAnalysis
