import React from 'react'

/**
 * JudgePanel — center "JUDGE / REF AI" badge shown between the two model panels.
 * Renders a vertical connector with a floating judge label.
 * Tapping the button opens/activates the judge decision flow.
 *
 * @param {boolean} hasResult  - Whether a result has been received
 * @param {Function} onReveal  - Callback to reveal the winner modal
 */
const JudgePanel = ({ hasResult = false, onReveal }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-2 flex-shrink-0">
      {/* Vertical line top */}
      <div className="w-0.5 flex-1 bg-arena-black/20 hidden lg:block max-h-20" />

      {/* Judge badge button */}
      <button
        onClick={hasResult ? onReveal : undefined}
        disabled={!hasResult}
        className={`brutal-btn px-4 py-3 text-xs font-bold text-center min-w-[110px] ${
          hasResult
            ? 'bg-arena-yellow text-arena-black animate-pulse cursor-pointer'
            : 'bg-arena-white text-arena-black cursor-not-allowed opacity-60'
        }`}
      >
        {hasResult ? '⚡ JUDGE READY' : 'JUDGE / REF AI'}
      </button>

      {/* Vertical line bottom */}
      <div className="w-0.5 flex-1 bg-arena-black/20 hidden lg:block max-h-20" />
    </div>
  )
}

export default JudgePanel
