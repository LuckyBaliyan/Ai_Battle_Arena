import React, { useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '../../shared/hooks/useGSAP'
import ModelPanel from './components/ModelPanel'
import JudgePanel from './components/JudgePanel'
import WinnerModal from './components/WinnerModal'
import PromptBar from './components/PromptBar'

/**
 * BattlePage — the main live-battle view.
 * Shows two side-by-side ModelPanel terminals for Model A (GPT-4) and Model B (Claude-3),
 * a central JudgePanel button, and the bottom PromptBar for submitting prompts.
 *
 * State management:
 * - battleData: holds the full backend response (solution_1, solution_2, scores, winner)
 * - isLoading: true while waiting for backend response
 * - showModal: controls WinnerModal visibility
 *
 * In the UI-only phase, handleSubmit uses mock data matching the real backend shape.
 */
const BattlePage = () => {
  const [battleData, setBattleData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const { containerRef } = useGSAP((self) => {
    self.add(() => {
      // Slide panels in from opposite sides
      gsap.from('.model-panel-a', {
        x: -60,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
      })
      gsap.from('.model-panel-b', {
        x: 60,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
      })
    })
  }, [])

  /**
   * handleSubmit — simulates a battle API call with mock data.
   * In production, replace the setTimeout block with an actual fetch/axios call
   * to your backend and spread the real response into setBattleData.
   *
   * @param {string} prompt - The user's prompt text
   */
  const handleSubmit = async (prompt) => {
    setIsLoading(true)
    setBattleData(null)
    setShowModal(false)

    // --- Mock API delay (replace with real backend call) ---
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock response matching the real backend data shape
    const mockResponse = {
      messages: [{ content: prompt }],
      solution_1:
        'Here are three concise, diplomatic responses under 70 words each:\n\n1. **Balanced Perspective**\n"AI poses risks like job displacement, misinformation, or unintended autonomy, but these are manageable with ethical frameworks, regulation, and human oversight. The threat lies in misuse, not AI itself."\n\n2. **Collaborative Approach**\n"AI challenges humanity by amplifying biases or disrupting systems, yet its benefits outweigh dangers if governed responsibly."\n\n3. **Optimistic Caution**\n"AI\'s risks are serious but not existential if we prioritize transparency and adaptive policies."',
      solution_2:
        'AI, like any powerful technology, poses risks if misused or uncontrolled. Concerns about AI as a threat to humanity often stem from fears of unintended consequences, job displacement, or autonomous systems making harmful decisions. However, these risks can be mitigated through ethical development, robust regulation, and international collaboration. AI also offers immense potential to solve global challenges, such as climate change and healthcare, making it a tool that can benefit humanity when managed responsibly.',
      judge_recommandation: {
        solution_1_score: 9.5,
        solution_2_score: 6.5,
      },
      solution_1_score: 9.5,
      solution_2_score: 6.5,
      solution_1_resoning:
        'Solution 1 gives three varied, well-crafted, and highly diplomatic responses. Each individual option strictly adheres to the negative constraint of remaining well under the 70-word limit.',
      solution_2_resoning:
        'Solution 2 provides a well-structured and diplomatic response, but it contains 74 words, violating the strict constraint of not exceeding 70 words.',
      winner: 'solution_1',
    }

    setBattleData(mockResponse)
    setIsLoading(false)
  }

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-arena-white">
      {/* Main battle arena */}
      <section className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Split-screen model panels */}
        <div className="flex flex-col lg:flex-row gap-0 items-stretch min-h-[500px]">
          {/* Model A Panel */}
          <div className="model-panel-a flex-1">
            <ModelPanel
              modelLabel="MODEL A [GPT-4]"
              solution={battleData?.solution_1}
              score={battleData?.solution_1_score}
              accentColor="bg-arena-yellow"
              isLoading={isLoading}
              isWinner={battleData?.winner === 'solution_1'}
            />
          </div>

          {/* Center Judge Panel */}
          <div className="flex items-center justify-center py-4 lg:py-0 lg:px-4">
            <JudgePanel
              hasResult={!!battleData && !isLoading}
              onReveal={() => setShowModal(true)}
            />
          </div>

          {/* Model B Panel */}
          <div className="model-panel-b flex-1">
            <ModelPanel
              modelLabel="MODEL B [CLAUDE-3]"
              solution={battleData?.solution_2}
              score={battleData?.solution_2_score}
              accentColor="bg-arena-pink"
              isLoading={isLoading}
              isWinner={battleData?.winner === 'solution_2'}
            />
          </div>
        </div>
      </section>

      {/* Bottom prompt input bar */}
      <PromptBar onSubmit={handleSubmit} isLoading={isLoading} />

      {/* Winner modal overlay */}
      {battleData && (
        <WinnerModal
          isOpen={showModal}
          winner={battleData.winner}
          solution1Score={battleData.solution_1_score}
          solution2Score={battleData.solution_2_score}
          solution1Reasoning={battleData.solution_1_resoning}
          solution2Reasoning={battleData.solution_2_resoning}
          onDismiss={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

export default BattlePage
