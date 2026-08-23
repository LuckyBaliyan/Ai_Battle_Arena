import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

/**
 * WinnerModal — overlay popup that announces the winning model.
 * Matches the design: dark overlay, centered white brutal-card with bold winner text,
 * score comparison, reasoning, and a DISMISS button.
 * GSAP animates the card bouncing in on mount.
 *
 * @param {boolean} isOpen             - Controls visibility
 * @param {string}  winner             - 'solution_1' | 'solution_2'
 * @param {number}  solution1Score     - Score for model A
 * @param {number}  solution2Score     - Score for model B
 * @param {string}  solution1Reasoning - Judge reasoning for model A
 * @param {string}  solution2Reasoning - Judge reasoning for model B
 * @param {Function} onDismiss         - Callback to close modal
 */
const WinnerModal = ({
  isOpen,
  winner,
  solution1Score,
  solution2Score,
  solution1Reasoning,
  solution2Reasoning,
  onDismiss,
}) => {
  const cardRef = useRef(null)

  // GSAP bounce-in animation when modal opens
  useEffect(() => {
    if (isOpen && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.7, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.7)' }
      )
    }
  }, [isOpen])

  if (!isOpen) return null

  // Derive winner display label and reasoning
  const isModelAWinner = winner === 'solution_1'
  const winnerLabel = isModelAWinner ? 'MODEL A WINS' : 'MODEL B WINS'
  const winnerReasoning = isModelAWinner ? solution1Reasoning : solution2Reasoning

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-arena-black/70 backdrop-blur-sm px-4">
      {/* Modal Card */}
      <div
        ref={cardRef}
        className="brutal-card bg-arena-white max-w-md w-full p-8 flex flex-col items-center gap-5"
      >
        {/* Header label */}
        <p className="font-mono text-xs text-arena-black/50 uppercase tracking-widest">
          REF AI DECISION
        </p>

        {/* Winner announcement */}
        <div className="brutal-border-thick bg-arena-yellow w-full py-5 text-center brutal-shadow-lg">
          <h2 className="font-mono text-3xl font-bold uppercase text-arena-black">
            {winnerLabel}
          </h2>
        </div>

        {/* Score comparison */}
        <div className="flex items-center gap-6 w-full justify-center">
          <div className="text-center">
            <p className="font-mono text-xs text-arena-black/50 uppercase mb-1">Model A</p>
            <p className="font-mono text-2xl font-bold text-arena-black">{solution1Score}</p>
          </div>
          <div className="font-mono text-xl text-arena-black/30 font-bold">vs</div>
          <div className="text-center">
            <p className="font-mono text-xs text-arena-black/50 uppercase mb-1">Model B</p>
            <p className="font-mono text-2xl font-bold text-arena-black">{solution2Score}</p>
          </div>
        </div>

        {/* Judge reasoning */}
        <p className="font-sans text-sm text-arena-black/70 text-center leading-relaxed max-w-sm">
          {winnerReasoning}
        </p>

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="brutal-btn bg-arena-black text-arena-white px-8 py-2 text-sm mt-2"
        >
          DISMISS
        </button>
      </div>
    </div>
  )
}

export default WinnerModal
