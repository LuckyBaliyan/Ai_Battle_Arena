import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

gsap.registerPlugin(ScrambleTextPlugin)

/**
 * ModelPanel — displays a single AI model's response in a terminal-style card.
 * Shows the model label as a header, terminal boot lines (simulated, with
 * a GSAP ScrambleText intro animation on mount), and the actual solution
 * text from the backend — which itself scrambles into view the moment it
 * arrives, then swaps to fully formatted markdown (tables, code blocks, etc).
 *
 * @param {string} modelLabel - Display name, e.g. "MODEL A [GPT-4]"
 * @param {string} solution   - The model's full response text (markdown) from backend
 * @param {string} score      - Numeric score from judge (e.g. "9.5")
 * @param {string} accentColor - Tailwind bg class for the header (e.g. "bg-arena-yellow")
 * @param {boolean} isLoading  - If true, shows animated terminal boot lines
 * @param {boolean} isWinner   - If true, renders a thin winner highlight border
 *
 * NOTE: ScrambleTextPlugin is part of GSAP's paid "Club GreenSock" bonus
 * plugins — it isn't in the free core bundle. Make sure it's installed/
 * licensed in your project (or swap in a free scramble implementation)
 * before this will resolve. Also requires `react-markdown` + `remark-gfm`
 * (npm i react-markdown remark-gfm) for the table/code formatting below.
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

  const bootLineRefs = useRef([])
  bootLineRefs.current = []

  const addBootLineRef = (el) => {
    if (el && !bootLineRefs.current.includes(el)) {
      bootLineRefs.current.push(el)
    }
  }

  // Boot lines scramble in on mount
  useEffect(() => {
    const targets = bootLineRefs.current
    if (!targets.length) return

    const tl = gsap.timeline()

    targets.forEach((el, i) => {
      const finalText = el.dataset.text || ''
      tl.to(
        el,
        {
          duration: 0.8,
          scrambleText: {
            text: finalText,
            chars: '01ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*',
            revealDelay: 0.1,
            speed: 0.4,
          },
          ease: 'none',
        },
        i * 0.35 // stagger each line's start
      )
    })

    return () => {
      tl.kill()
    }
  }, [modelLabel])

  // Solution scramble-reveal: fires the instant a real solution string
  // arrives from the backend. A plain-text layer scrambles into the raw
  // solution, then hands off to the fully-formatted markdown render.
  const scrambleLayerRef = useRef(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (isLoading || !solution) {
      setRevealed(false)
      return
    }

    setRevealed(false)
    const el = scrambleLayerRef.current
    if (!el) return

    const tween = gsap.to(el, {
      duration: Math.min(1.4, Math.max(0.6, solution.length / 350)),
      scrambleText: {
        text: solution,
        chars: '01ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*',
        revealDelay: 0.5,
        speed: 0.08,
      },
      ease: 'none',
      onComplete: () => setRevealed(true),
    })

    return () => tween.kill()
  }, [solution, isLoading])

  const markdownComponents = {
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
    strong: ({ children }) => (
      <strong className="text-arena-white font-bold">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="text-arena-white/80 italic">{children}</em>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
    ),
    li: ({ children }) => <li className="marker:text-arena-yellow">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-arena-yellow pl-3 my-2 text-arena-white/60 italic">
        {children}
      </blockquote>
    ),
    h1: ({ children }) => (
      <h1 className="font-mono text-sm font-bold uppercase text-arena-yellow mt-3 mb-2 first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="font-mono text-xs font-bold uppercase text-arena-yellow mt-3 mb-1 first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-mono text-xs font-bold uppercase text-arena-white/80 mt-2 mb-1 first:mt-0">
        {children}
      </h3>
    ),
    a: ({ children, href }) => (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-arena-yellow underline underline-offset-2 hover:text-arena-white"
      >
        {children}
      </a>
    ),
    hr: () => <div className="border-t border-arena-white/10 my-3" />,
    // Inline `code` vs fenced ```code blocks``` both come through here —
    // react-markdown distinguishes them via the presence of a `className`
    // (set from the fenced-block language, e.g. "language-js").
    code: ({ inline, className, children, ...props }) => {
      if (inline) {
        return (
          <code
            className="font-mono text-[11px] bg-arena-white/10 text-arena-green px-1 py-0.5 rounded"
            {...props}
          >
            {children}
          </code>
        )
      }
      const language = /language-(\w+)/.exec(className || '')?.[1]
      return (
        <div className="my-2 brutal-border bg-black/40 rounded overflow-hidden">
          {language && (
            <div className="px-3 py-1 bg-arena-white/5 border-b border-arena-white/10 font-mono text-[10px] uppercase tracking-wide text-arena-white/40">
              {language}
            </div>
          )}
          <pre className="overflow-x-auto p-3">
            <code
              className="font-mono text-[11px] text-arena-green leading-relaxed"
              {...props}
            >
              {children}
            </code>
          </pre>
        </div>
      )
    },
    table: ({ children }) => (
      <div className="my-2 overflow-x-auto brutal-border rounded">
        <table className="w-full text-[11px] font-mono border-collapse">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-arena-white/10">{children}</thead>
    ),
    tr: ({ children }) => (
      <tr className="border-b border-arena-white/10 last:border-b-0">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="text-left px-2 py-1 font-bold uppercase text-arena-yellow border-r border-arena-white/10 last:border-r-0">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-2 py-1 text-arena-white/90 border-r border-arena-white/10 last:border-r-0 align-top">
        {children}
      </td>
    ),
  }

  return (
    <div
      className={`brutal-card flex flex-col h-full ${isWinner ? 'ring-4 ring-arena-yellow ring-offset-2' : ''
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
            ref={addBootLineRef}
            data-text={line}
            className="font-mono text-xs text-arena-green/80 mb-1 leading-relaxed"
          >
            {/* Empty initially — ScrambleText fills this in on mount */}
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
          <div className="relative">
            {/* Scramble layer — plain text, decodes into the raw solution */}
            <p
              ref={scrambleLayerRef}
              className={`font-mono text-xs text-arena-green whitespace-pre-wrap leading-relaxed ${revealed ? 'hidden' : 'block'
                }`}
            />

            {/* Formatted layer — swapped in once the scramble completes */}
            <div
              className={`font-sans text-sm text-arena-white/90 leading-relaxed ${revealed ? 'block' : 'hidden'
                }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {solution}
              </ReactMarkdown>
            </div>
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