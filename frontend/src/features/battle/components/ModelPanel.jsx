import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

gsap.registerPlugin(ScrambleTextPlugin)


const ModelPanel = ({
  modelLabel,
  solution,
  score,
  accentColor = 'bg-arena-yellow',
  isLoading = false,
  isWinner = false,
}) => {
  // --------------------------------------------------
  // TERMINAL BOOT LINES
  // --------------------------------------------------

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

  // --------------------------------------------------
  // BOOT SCRAMBLE ANIMATION
  // --------------------------------------------------

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
        i * 0.35
      )
    })

    return () => {
      tl.kill()
    }
  }, [modelLabel])

  // --------------------------------------------------
  // SOLUTION SCRAMBLE
  // --------------------------------------------------

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
      duration: Math.min(
        1.4,
        Math.max(0.6, solution.length / 350)
      ),

      scrambleText: {
        text: solution,
        chars: '01ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*',
        revealDelay: 0.5,
        speed: 0.08,
      },

      ease: 'none',

      onComplete: () => {
        setRevealed(true)
      },
    })

    return () => tween.kill()
  }, [solution, isLoading])

  // --------------------------------------------------
  // MARKDOWN COMPONENTS
  // --------------------------------------------------

  const markdownComponents = {
    // Paragraph
    p: ({ children }) => (
      <p className="mb-3 last:mb-0">
        {children}
      </p>
    ),

    // Bold
    strong: ({ children }) => (
      <strong className="text-arena-white font-bold">
        {children}
      </strong>
    ),

    // Italic
    em: ({ children }) => (
      <em className="text-arena-white/80 italic">
        {children}
      </em>
    ),

    // Unordered list
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-3 space-y-1">
        {children}
      </ul>
    ),

    // Ordered list
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-3 space-y-1">
        {children}
      </ol>
    ),

    // List item
    li: ({ children }) => (
      <li className="marker:text-arena-yellow">
        {children}
      </li>
    ),

    // Blockquote
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-arena-yellow pl-3 my-3 text-arena-white/60 italic">
        {children}
      </blockquote>
    ),

    // H1
    h1: ({ children }) => (
      <h1 className="font-mono text-sm font-bold uppercase text-arena-yellow mt-4 mb-2 first:mt-0">
        {children}
      </h1>
    ),

    // H2
    h2: ({ children }) => (
      <h2 className="font-mono text-xs font-bold uppercase text-arena-yellow mt-4 mb-2 first:mt-0">
        {children}
      </h2>
    ),

    // H3
    h3: ({ children }) => (
      <h3 className="font-mono text-xs font-bold uppercase text-arena-white/80 mt-3 mb-1 first:mt-0">
        {children}
      </h3>
    ),

    // Links
    a: ({ children, href }) => (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-arena-yellow underline underline-offset-2 hover:text-arena-white transition-colors"
      >
        {children}
      </a>
    ),

    // Horizontal rule
    hr: () => (
      <div className="border-t border-arena-white/10 my-4" />
    ),

    // --------------------------------------------------
    // CODE BLOCK
    // --------------------------------------------------

    code: ({ node, className, children, ...props }) => {
      const match = /language-([\w-]+)/.exec(className || '')

      const isInline =
        node?.position?.start.line === node?.position?.end.line &&
        !match

      if (isInline) {
        return (
          <code
            className="font-mono text-[11px] bg-arena-white/10 text-arena-green px-1.5 py-0.5 rounded"
            {...props}
          >
            {children}
          </code>
        )
      }

      const language = match?.[1] || 'text'

      const code = String(children).replace(/\n$/, '')

      return (
        <CodeBlock
          code={code}
          language={language}
        />
      )
    },

    // --------------------------------------------------
    // TABLE
    // --------------------------------------------------

    table: ({ children }) => (
      <div className="my-3 overflow-x-auto brutal-border rounded">
        <table className="w-full text-[11px] font-mono border-collapse">
          {children}
        </table>
      </div>
    ),

    thead: ({ children }) => (
      <thead className="bg-arena-white/10">
        {children}
      </thead>
    ),

    tr: ({ children }) => (
      <tr className="border-b border-arena-white/10 last:border-b-0">
        {children}
      </tr>
    ),

    th: ({ children }) => (
      <th className="text-left px-2 py-2 font-bold uppercase text-arena-yellow border-r border-arena-white/10 last:border-r-0">
        {children}
      </th>
    ),

    td: ({ children }) => (
      <td className="px-2 py-2 text-arena-white/90 border-r border-arena-white/10 last:border-r-0 align-top">
        {children}
      </td>
    ),
  }

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div
      className={`
        brutal-card
        flex
        flex-col
        h-full
        lg:max-w-[35vw]
        ${isWinner
          ? 'ring-4 ring-arena-yellow ring-offset-2'
          : ''
        }
      `}
    >

      {/* ================================================
          MODEL HEADER
      ================================================= */}

      <div
        className={`
          ${accentColor}
          brutal-border
          border-b-2
          px-4
          py-3
          flex
          items-center
          justify-between
        `}
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

      {/* ================================================
          TERMINAL BODY
      ================================================= */}

      <div className="flex-1 bg-arena-black p-4 overflow-y-auto min-h-[280px] max-h-[400px]">

        {/* Boot lines */}

        {bootLines.map((line, i) => (
          <p
            key={i}
            ref={addBootLineRef}
            data-text={line}
            className="font-mono text-xs text-arena-green/80 mb-1 leading-relaxed"
          />
        ))}

        {/* Separator */}

        <div className="border-t border-arena-white/10 my-3" />

        {/* ================================================
            SOLUTION
        ================================================= */}

        {isLoading ? (

          <p className="font-mono text-xs text-arena-white/40 cursor-blink">
            AWAITING RESPONSE....
          </p>

        ) : solution ? (

          <div className="relative">

            {/* --------------------------------------------
                SCRAMBLE LAYER
            --------------------------------------------- */}

            <p
              ref={scrambleLayerRef}
              className={`
                font-mono
                text-xs
                text-arena-green
                whitespace-pre-wrap
                leading-relaxed
                ${revealed ? 'hidden' : 'block'}
              `}
            />

            {/* --------------------------------------------
                MARKDOWN LAYER
            --------------------------------------------- */}

            <div
              className={`
                font-sans
                text-sm
                text-arena-white/90
                leading-relaxed
                ${revealed ? 'block' : 'hidden'}
              `}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
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


// ======================================================
// CODE BLOCK COMPONENT
// ======================================================

const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)

      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 1500)

    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  return (
    <div className="my-4 brutal-border overflow-hidden rounded bg-black/60">

      {/* ================================================
          CODE HEADER
      ================================================= */}

      <div className="flex items-center justify-between px-3 py-2 bg-arena-white/5 border-b border-arena-white/10">

        {/* Language */}

        <div className="flex items-center gap-2">

          <span className="w-2 h-2 rounded-full bg-arena-green" />

          <span className="font-mono text-[10px] uppercase tracking-widest text-arena-white/50">
            {language}
          </span>

        </div>

        {/* Copy Button */}

        <button
          onClick={handleCopy}
          className="
            font-mono
            text-[10px]
            uppercase
            tracking-wide
            px-2
            py-1
            border
            border-arena-white/10
            text-arena-white/50
            hover:text-arena-yellow
            hover:border-arena-yellow
            transition-colors
          "
        >
          {copied ? 'COPIED ✓' : 'COPY'}
        </button>

      </div>

      {/* ================================================
          CODE
      ================================================= */}

      <div className="overflow-x-auto">

        <SyntaxHighlighter
          language={language}
          style={oneDark}
          showLineNumbers={true}
          wrapLongLines={false}
          customStyle={{
            margin: 0,
            padding: '14px',
            background: 'transparent',
            fontSize: '11px',
            lineHeight: '1.6',
            fontFamily: 'monospace',
          }}
          lineNumberStyle={{
            minWidth: '2.5em',
            paddingRight: '1em',
            userSelect: 'none',
            opacity: 0.35,
          }}
        >
          {code}
        </SyntaxHighlighter>

      </div>

    </div>
  )
}

export default ModelPanel