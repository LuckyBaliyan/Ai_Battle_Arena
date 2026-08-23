import React from 'react'

/**
 * ConfigureMatch — form section for selecting Model Alpha and Model Beta
 * before initiating a battle. Renders two styled dropdowns and an
 * "ENGAGE PROTOCOL" CTA button.
 *
 * @param {string}   modelAlpha     - Currently selected model A value
 * @param {string}   modelBeta      - Currently selected model B value
 * @param {Function} onAlphaChange  - Callback when model A dropdown changes
 * @param {Function} onBetaChange   - Callback when model B dropdown changes
 * @param {Function} onEngage       - Callback when "ENGAGE PROTOCOL" is clicked
 */
const ConfigureMatch = ({
  modelAlpha,
  modelBeta,
  onAlphaChange,
  onBetaChange,
  onEngage,
}) => {
  // Available AI models for selection
  const modelOptions = [
    { value: '', label: 'Select Model...' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'claude-3-opus', label: 'Claude-3 Opus' },
    { value: 'claude-3-sonnet', label: 'Claude-3.5 Sonnet' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'llama-3', label: 'Llama-3 70B' },
    { value: 'mistral', label: 'Mistral Large' },
  ]

  /**
   * SelectField — inner reusable dropdown wrapper with neobrutalism styling.
   * Renders a label above a themed <select> element.
   */
  const SelectField = ({ id, label, value, onChange }) => (
    <div className="flex flex-col gap-2 flex-1">
      <label
        htmlFor={id}
        className="font-mono text-xs text-arena-black/60 uppercase tracking-widest"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full brutal-border bg-arena-white font-mono text-sm text-arena-black px-4 py-3 appearance-none outline-none cursor-pointer focus:bg-arena-yellow/10 transition-colors duration-150"
        >
          {modelOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-arena-black/50 pointer-events-none">
          ∨
        </span>
      </div>
    </div>
  )

  return (
    <div className="brutal-card p-6 flex flex-col gap-5">
      {/* Section header */}
      <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-arena-black">
        Configure Match
      </h2>

      {/* Model selectors row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SelectField
          id="model-alpha"
          label="Model Alpha"
          value={modelAlpha}
          onChange={onAlphaChange}
        />
        <SelectField
          id="model-beta"
          label="Model Beta"
          value={modelBeta}
          onChange={onBetaChange}
        />
      </div>

      {/* Engage CTA */}
      <button
        onClick={onEngage}
        disabled={!modelAlpha || !modelBeta}
        id="engage-protocol-btn"
        className="brutal-btn bg-arena-yellow text-arena-black py-4 text-sm w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[4px_4px_0px_#000]"
      >
        ENGAGE PROTOCOL
      </button>
    </div>
  )
}

export default ConfigureMatch
