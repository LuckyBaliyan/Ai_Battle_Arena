import React, { useState } from 'react'

/**
 * PromptBar — the bottom input section on the Battle page.
 * Allows the user to enter a prompt and submit it to pit the two models against each other.
 * Calls onSubmit with the trimmed prompt string.
 *
 * @param {Function} onSubmit   - Called with the prompt string when user submits
 * @param {boolean}  isLoading  - Disables input while a battle is in progress
 */
const PromptBar = ({ onSubmit, isLoading = false }) => {
  const [prompt, setPrompt] = useState('')

  /**
   * handleSubmit — prevents default form submission,
   * validates that prompt is non-empty, calls onSubmit, then clears the field.
   */
  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = prompt.trim()
    if (!trimmed || isLoading) return
    onSubmit(trimmed)
    setPrompt('')
  }

  return (
    <div className="w-full border-t-2 border-arena-black bg-arena-white">
      <div className="max-w-7xl mx-auto px-6 py-5">
        {/* Label */}
        <p className="font-mono text-xs text-arena-black/50 uppercase tracking-widest mb-3">
          Arena Prompt Input
        </p>

        <form onSubmit={handleSubmit} className="flex gap-0">
          {/* Text input */}
          <input
            type="text"
            id="arena-prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter prompt to pit models against each other..."
            disabled={isLoading}
            className="flex-1 brutal-border bg-arena-white font-sans text-sm text-arena-black px-4 py-3 outline-none focus:bg-arena-yellow/10 transition-colors duration-150 placeholder:text-arena-black/30 border-r-0 disabled:opacity-50"
          />

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            id="arena-submit-btn"
            className="brutal-btn bg-arena-yellow text-arena-black px-8 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'RUNNING...' : 'SUBMIT ←'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default PromptBar
