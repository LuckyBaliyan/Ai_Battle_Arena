import React from 'react'

/**
 * ModelPanel — displays a single AI model's response in a terminal-style card.
 * Shows the model label as a header, terminal boot lines (simulated),
 * and the actual solution text from the backend.
 *
 * @param {string} modelLabel - Display name, e.g. "MODEL A [GPT-4]"
 * @param {string} solution   - The model's full response text from backend
 * @param {string} score      - Numeric score from judge (e.g. "9.5")
 * @param {string} accentColor - Tailwind bg class for the header (e.g. "bg-arena-yellow")
 * @param {boolean} isLoading  - If true, shows animated terminal boot lines
 * @param {boolean} isWinner   - If true, renders a thin winner highlight border
 */
const ModelPanel = ({
  modelLabel,
  solution,
  score,
  accentColor = 'bg-arena-yellow',
  isLoading = false,
  isWinner = false,
}) => {
  // Terminal boot sequence lines shown while loading
  const bootLines = [
    `> INITIATING ${modelLabel} RESPONSE PROTOCOL...`,
    '> PROCESSING PROMPT...',
    '> GENERATING OUTPUT...',
  ]

  return (
    <div
      className={`brutal-card flex flex-col h-full ${
        isWinner ? 'ring-4 ring-arena-yellow ring-offset-2' : ''
      }`}
    >
      {/* Model Header */}
      <div
        className={`${accentColor} brutal-border border-b-2 px-4 py-3 flex items-center justify-between`}
      >
        <h2 className="font-mono text-base font-bold uppercase tracking-tight text-arena-black">
          {modelLabel}
        </h2>
        {score !== undefined && (
          <span className="font-mono text-xs font-bold bg-arena-black text-arena-white px-2 py-1 brutal-border">
            SCORE: {score}
          </span>
        )}
      </div>

      {/* Terminal body */}
      <div className="flex-1 bg-arena-black p-4 overflow-y-auto min-h-[280px] max-h-[400px]">
        {/* Boot lines */}
        {bootLines.map((line, i) => (
          <p
            key={i}
            className="font-mono text-xs text-arena-green/80 mb-1 leading-relaxed"
          >
            {line}
          </p>
        ))}

        {/* Separator */}
        <div className="border-t border-arena-white/10 my-3" />

        {/* Solution output */}
        {isLoading ? (
          <p className="font-mono text-xs text-arena-white/40 cursor-blink">
            AWAITING RESPONSE
          </p>
        ) : solution ? (
          <div className="font-sans text-sm text-arena-white/90 leading-relaxed whitespace-pre-wrap">
            {solution}
          </div>
        ) : (
          <p className="font-mono text-xs text-arena-white/30">
            NO OUTPUT YET
          </p>
        )}
      </div>
    </div>
  )
}

export default ModelPanel
