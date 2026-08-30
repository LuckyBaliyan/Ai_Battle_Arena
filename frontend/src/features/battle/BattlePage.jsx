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


const dummyBattleData = {
  solution_1: `
# Approach 1 — Sorting Based Solution

We can solve this problem by sorting the array first.

## Idea

1. Sort the array.
2. Iterate through the sorted array.
3. Return the processed result.

### Java Solution

\`\`\`java
import java.util.*;

class Solution {

    public int[] sortArray(int[] nums) {
        Arrays.sort(nums);
        return nums;
    }

    public static void main(String[] args) {
        Solution solution = new Solution();

        int[] nums = {5, 2, 8, 1, 3};

        int[] result = solution.sortArray(nums);

        System.out.println(Arrays.toString(result));
    }
}
\`\`\`

The time complexity is \`O(n log n)\`.

The space complexity is \`O(1)\` excluding the sorting implementation.

> This approach is simple and easy to understand.
`,

  solution_2: `
# Approach 2 — Merge Sort

Instead of using the built-in sorting function, we can implement **Merge Sort**.

## Algorithm

- Divide the array into two halves.
- Recursively sort both halves.
- Merge the sorted halves.

### Java Implementation

\`\`\`java
class Solution {

    public int[] sortArray(int[] nums) {

        if (nums.length <= 1) {
            return nums;
        }

        int mid = nums.length / 2;

        int[] left = new int[mid];
        int[] right = new int[nums.length - mid];

        System.arraycopy(
            nums,
            0,
            left,
            0,
            mid
        );

        System.arraycopy(
            nums,
            mid,
            right,
            0,
            nums.length - mid
        );

        left = sortArray(left);
        right = sortArray(right);

        return merge(left, right);
    }

    private int[] merge(
        int[] left,
        int[] right
    ) {
        int[] result =
            new int[left.length + right.length];

        int i = 0;
        int j = 0;
        int k = 0;

        while (
            i < left.length &&
            j < right.length
        ) {
            if (left[i] < right[j]) {
                result[k++] = left[i++];
            } else {
                result[k++] = right[j++];
            }
        }

        while (i < left.length) {
            result[k++] = left[i++];
        }

        while (j < right.length) {
            result[k++] = right[j++];
        }

        return result;
    }
}
\`\`\`

## Complexity

| Approach | Time Complexity | Space Complexity |
|---|---|---|
| Built-in Sort | \`O(n log n)\` | Depends on implementation |
| Merge Sort | \`O(n log n)\` | \`O(n)\` |

The Merge Sort solution demonstrates the underlying algorithm instead of relying on the built-in method.
`,

  judge_recommendation: {
    score_1: 8.5,

    score_2: 9.2,

    winner: "solution_2",

    reasoning: {
      score_1: `
Solution 1 is **correct, concise, and efficient**.

It uses Java's built-in \`Arrays.sort()\`, which provides an
\`O(n log n)\` sorting solution.

However, it does not demonstrate the underlying sorting algorithm,
which makes it less suitable if the goal is to evaluate algorithmic
understanding.
      `,

      score_2: `
Solution 2 is also **correct** and implements Merge Sort manually.

The solution clearly demonstrates:

- Divide and conquer
- Recursive decomposition
- Merge operation
- Time complexity analysis

Although it uses \`O(n)\` extra space, it better demonstrates the
algorithmic reasoning behind the solution.

Therefore, **Solution 2 receives the higher score**.
      `
    }
  }
}

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
    setIsLoading(false);
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
