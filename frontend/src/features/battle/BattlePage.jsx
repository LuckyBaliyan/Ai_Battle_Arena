import React, { useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '../../shared/hooks/useGSAP'
import ModelPanel from './components/ModelPanel'
import JudgePanel from './components/JudgePanel'
import WinnerModal from './components/WinnerModal'
import PromptBar from './components/PromptBar'
import useInvoke from '../../hooks/useInvoke'

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

  const invoke = useInvoke();

  console.log(invoke);

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
   * handleSubmit — simulates a battle API call.
   * to your backend and spread the real response into setBattleData.
   *
   * @param {string} prompt - The user's prompt text
   */
  const handleSubmit = async (prompt) => {
    setIsLoading(true)
    setBattleData(null)
    setShowModal(false)

    const res = await invoke(prompt);
    console.log(res.data);


    setBattleData(res.data);
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
          winner={battleData.judge_recommandation?.winner}
          solution1Score={battleData.judge_recommandation?.solution_1_score}
          solution2Score={battleData.judge_recommandation?.solution_2_score}
          solution1Reasoning={battleData.judge_recommandation?.solution_1_resoning}
          solution2Reasoning={battleData.judge_recommandation?.solution_2_resoning}
          onDismiss={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

export default BattlePage
