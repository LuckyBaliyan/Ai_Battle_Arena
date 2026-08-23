import React from 'react'

/**
 * BattlegroundCard — displays a single arena mode card.
 * Each card has a title, icon, description, two action tags (mode label + active count),
 * and a colored accent block. Uses neobrutalism border + shadow styling.
 *
 * @param {string} title - Arena mode name (e.g. "STANDARD 1V1")
 * @param {string} icon - Emoji or symbol shown in top-right corner
 * @param {string} description - Short description text
 * @param {string} modeLabel - Left badge label (e.g. "ELO RATED")
 * @param {string} activeCount - Right badge text (e.g. "ACTIVE: 1,284")
 * @param {string} accentColor - Tailwind bg class for accent block (e.g. "bg-arena-cyan")
 * @param {Function} onClick - Click handler for card
 */
const BattlegroundCard = ({
  title,
  icon,
  description,
  modeLabel,
  activeCount,
  accentColor = 'bg-arena-yellow',
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="brutal-card bg-arena-white text-left w-full p-6 flex flex-col gap-4 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all duration-150 cursor-pointer group"
    >
      {/* Header row */}
      <div className="flex items-start justify-between">
        <h3 className="font-mono text-xl font-bold uppercase tracking-tight text-arena-black leading-tight">
          {title}
        </h3>
        {/* Accent icon block */}
        <div
          className={`${accentColor} brutal-border w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0`}
        >
          {icon}
        </div>
      </div>

      {/* Description */}
      <p className="font-sans text-sm text-arena-black/70 leading-relaxed flex-1">
        {description}
      </p>

      {/* Bottom badges row */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="brutal-btn bg-arena-black text-arena-white px-3 py-1 text-xs">
          {modeLabel}
        </span>
        <span
          className={`${accentColor} brutal-border px-3 py-1 font-mono text-xs font-bold text-arena-black`}
        >
          {activeCount}
        </span>
      </div>
    </button>
  )
}

export default BattlegroundCard
