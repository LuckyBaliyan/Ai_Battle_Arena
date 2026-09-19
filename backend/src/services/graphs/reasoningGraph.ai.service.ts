import { HumanMessage } from "@langchain/core/messages";

import {
      StateSchema,
      MessagesValue,
      ReducedValue,
      START,
      END,
      StateGraph,
      getWriter,
      type GraphNode,
} from "@langchain/langgraph";

import { z } from "zod";

import { modelRegistry } from "../../models/model.registry.js";


// ============================================================
// REASONING SOLUTION SCHEMA
// ============================================================

const reasoningSolutionSchema = z.object({

      understanding: z.string(),

      approach: z.string(),

      reasoning: z.string(),

      verification: z.string(),

      final_answer: z.string(),

});


// ============================================================
// REASONING JUDGE SCHEMA
// ============================================================

const reasoningJudgeSchema = z.object({

      solution_1: z.object({

            correctness:
                  z.number().min(0).max(10),

            reasoning_quality:
                  z.number().min(0).max(10),

            verification_quality:
                  z.number().min(0).max(10),

            completeness:
                  z.number().min(0).max(10),

            overall_score:
                  z.number().min(0).max(10),

      }),

      solution_2: z.object({

            correctness:
                  z.number().min(0).max(10),

            reasoning_quality:
                  z.number().min(0).max(10),

            verification_quality:
                  z.number().min(0).max(10),

            completeness:
                  z.number().min(0).max(10),

            overall_score:
                  z.number().min(0).max(10),

      }),

      winner: z.enum([
            "solution_1",
            "solution_2",
      ]),

      verdict: z.string(),

});


// ============================================================
// REASONING GRAPH STATE
// ============================================================

const State = new StateSchema({

      messages: MessagesValue,


      // --------------------------------------------------------
      // ORIGINAL PROBLEM
      // --------------------------------------------------------

      problem: new ReducedValue(

            z.string().default(""),

            {
                  reducer: (_, next) => next,
            }

      ),


      // --------------------------------------------------------
      // SOLUTION 1
      // --------------------------------------------------------

      solution_1: new ReducedValue(

            reasoningSolutionSchema.default({

                  understanding: "",

                  approach: "",

                  reasoning: "",

                  verification: "",

                  final_answer: "",

            }),

            {
                  reducer: (_, next) => next,
            }

      ),


      // --------------------------------------------------------
      // SOLUTION 2
      // --------------------------------------------------------

      solution_2: new ReducedValue(

            reasoningSolutionSchema.default({

                  understanding: "",

                  approach: "",

                  reasoning: "",

                  verification: "",

                  final_answer: "",

            }),

            {
                  reducer: (_, next) => next,
            }

      ),


      // --------------------------------------------------------
      // JUDGE RESULT
      // --------------------------------------------------------

      judge: new ReducedValue(

            reasoningJudgeSchema.default({

                  solution_1: {

                        correctness: 0,

                        reasoning_quality: 0,

                        verification_quality: 0,

                        completeness: 0,

                        overall_score: 0,

                  },

                  solution_2: {

                        correctness: 0,

                        reasoning_quality: 0,

                        verification_quality: 0,

                        completeness: 0,

                        overall_score: 0,

                  },

                  winner: "solution_1",

                  verdict: "",

            }),

            {
                  reducer: (_, next) => next,
            }

      ),


      // --------------------------------------------------------
      // MODEL 1
      // --------------------------------------------------------

      model_1: new ReducedValue(

            z.string().default(""),

            {
                  reducer: (_, next) => next,
            }

      ),


      // --------------------------------------------------------
      // MODEL 2
      // --------------------------------------------------------

      model_2: new ReducedValue(

            z.string().default(""),

            {
                  reducer: (_, next) => next,
            }

      ),

});


// ============================================================
// REASONING SYSTEM PROMPT
// ============================================================

const getReasoningSystemPrompt = () => {

      return `

You are an AI reasoning solver participating in
REASONING MODE of an AI Battle Arena.

============================================================
PURPOSE OF REASONING MODE
============================================================

Reasoning Mode is specifically designed for:

- Complex problem solving
- Logical reasoning
- Mathematical reasoning
- Strategic problem solving
- Multi-step analysis
- Decision analysis
- Structured problem decomposition
- Algorithmic reasoning
- Planning
- Constraint-based reasoning
- Careful verification of conclusions

The goal is NOT simply to produce an answer.

The goal is to demonstrate a clear and reliable
problem-solving process.

============================================================
IMPORTANT MODE LIMITATION
============================================================

Reasoning Mode is NOT designed for:

- Live events
- Breaking news
- Today's news
- Current affairs
- Real-time information
- Live sports scores
- Current market prices
- Current weather
- Time-sensitive events
- Information that requires live web access

There is NO web-search tool available in Reasoning Mode.

If the user's query requires current or live information,
do NOT invent or guess the information.

Instead, clearly remind the user that:

"Reasoning Mode is designed for complex problem solving,
strategic breakdowns, and structured reasoning. It is not
intended for live or time-sensitive information. Please
use Standard Mode for queries that require current
information."

Then explain what can still be answered reliably from
the information provided in the problem.

============================================================
REASONING PROCESS
============================================================

For suitable reasoning problems, follow these stages:

1. UNDERSTANDING

Identify:

- What the problem is asking
- Important information
- Constraints
- Requirements
- Relevant assumptions

Do not solve the problem yet.

------------------------------------------------------------

2. APPROACH

Determine:

- The appropriate strategy
- Relevant concepts
- Possible approaches
- Why the selected approach is appropriate

If multiple approaches exist, compare them briefly.

------------------------------------------------------------

3. REASONING

Work through the problem logically.

Include:

- Important deductions
- Calculations
- Logical transitions
- Relevant cases
- Important decisions
- Necessary intermediate results

Do not skip critical reasoning steps.

However, do NOT expose private hidden chain-of-thought.

Provide a concise reasoning summary containing the
important externally observable reasoning steps.

------------------------------------------------------------

4. VERIFICATION

Verify the result.

Check:

- Calculations
- Logical consistency
- Assumptions
- Constraints
- Edge cases where relevant
- Whether the conclusion actually follows from the reasoning

If an error is discovered, correct it before producing
the final answer.

------------------------------------------------------------

5. FINAL ANSWER

Give the final answer clearly and directly.

============================================================
IMPORTANT RULES
============================================================

- Do not invent facts.
- Do not assume access to the internet.
- Do not claim that current information is verified.
- Do not fabricate live or time-sensitive information.
- Prefer correctness over verbosity.
- Prefer logical clarity over unnecessary explanation.
- Do not expose private chain-of-thought.
- Provide a concise reasoning summary.
- The final answer must follow from the reasoning.
- Verify the result before giving the final answer.

Return the requested reasoning information only.

`;

};


// ============================================================
// SOLVER 1 NODE
// ============================================================

const solver1Node: GraphNode<typeof State> = async (
      state
) => {

      const writer = getWriter();

      const modelId =
            state.model_1;

      const model =
            modelRegistry.get(modelId);

      const problem =
            state.problem ||
            state.messages[0]?.text ||
            "";


      console.log(
            `🧠 Reasoning Solver 1: ${model.name}`
      );


      writer({

            event:
                  "reasoning_solver_started",

            data: {

                  solver:
                        "solution_1",

                  model:
                        model.name,

            },

      });


      const start =
            performance.now();


      // ========================================================
      // STEP 1 — REASONING
      // ========================================================

      /*
       * IMPORTANT:
       *
       * No web-search tools are provided in Reasoning Mode.
       *
       * The model must reason only from:
       *
       * 1. Its existing knowledge
       * 2. The information supplied by the user
       *
       * If the problem requires live information,
       * the system prompt instructs the model to remind
       * the user about the purpose of Reasoning Mode.
       */

      const reasoningResponse =
            await model.generate(

                  [

                        {

                              role:
                                    "system",

                              content:
                                    getReasoningSystemPrompt(),

                        },

                        {

                              role:
                                    "user",

                              content:
                                    problem,

                        },

                  ],

                  {

                        temperature: 0,

                  }

            );


      // ========================================================
      // STEP 2 — STRUCTURED REASONING OUTPUT
      // ========================================================

      const structuredPrompt = `

The original problem was:

${problem}


============================================================
PREVIOUS REASONING ANALYSIS
============================================================

${reasoningResponse.text}


============================================================
TASK
============================================================

Convert the previous analysis into the required
structured reasoning format.

Return these five sections:

1. Understanding
2. Approach
3. Reasoning
4. Verification
5. Final Answer


IMPORTANT:

- Preserve the important reasoning from the previous analysis.
- Do not invent information.
- Do not introduce information that was not available.
- Verify the conclusion.
- If the query requires live/current information, clearly
  explain that Reasoning Mode is not intended for such
  queries and remind the user to use Standard Mode.
- Do not expose hidden chain-of-thought.
- Provide a concise reasoning summary instead.
- Keep the final answer directly related to the problem.

`;


      const result =
            await model.generateStructured(

                  [

                        {

                              role:
                                    "system",

                              content:
                                    getReasoningSystemPrompt(),

                        },

                        {

                              role:
                                    "user",

                              content:
                                    structuredPrompt,

                        },

                  ],

                  reasoningSolutionSchema,

                  {

                        temperature: 0,

                  }

            );


      const generationTimeMs =
            performance.now() - start;


      // ========================================================
      // SSE EVENT
      // ========================================================

      writer({
            event: "reasoning_solver_completed",

            data: {
                  solver: "solution_1",
                  model: model.name,
                  solution: result,
                  generationTimeMs,
            },
      });


      console.log(

            `🧠 Reasoning Solver 1 completed in ` +
            `${generationTimeMs.toFixed(2)} ms`

      );


      return {

            solution_1:
                  result,

      };

};


// ============================================================
// SOLVER 2 NODE
// ============================================================

const solver2Node: GraphNode<typeof State> = async (
      state
) => {

      const writer = getWriter();

      const modelId =
            state.model_2;

      const model =
            modelRegistry.get(modelId);

      const problem =
            state.problem ||
            state.messages[0]?.text ||
            "";


      console.log(
            `🧠 Reasoning Solver 2: ${model.name}`
      );


      writer({

            event:
                  "reasoning_solver_started",

            data: {

                  solver:
                        "solution_2",

                  model:
                        model.name,

            },

      });


      const start =
            performance.now();


      // ========================================================
      // STEP 1 — REASONING
      // ========================================================

      /*
       * No tools are provided here intentionally.
       *
       * Reasoning Mode is not a live-information mode.
       */

      const reasoningResponse =
            await model.generate(

                  [

                        {

                              role:
                                    "system",

                              content:
                                    getReasoningSystemPrompt(),

                        },

                        {

                              role:
                                    "user",

                              content:
                                    problem,

                        },

                  ],

                  {

                        temperature: 0,

                  }

            );


      // ========================================================
      // STEP 2 — STRUCTURED REASONING OUTPUT
      // ========================================================

      const structuredPrompt = `

The original problem was:

${problem}


============================================================
PREVIOUS REASONING ANALYSIS
============================================================

${reasoningResponse.text}


============================================================
TASK
============================================================

Convert the previous analysis into the required
structured reasoning format.

Return these five sections:

1. Understanding
2. Approach
3. Reasoning
4. Verification
5. Final Answer


IMPORTANT:

- Preserve the important reasoning from the previous analysis.
- Do not invent information.
- Do not introduce information that was not available.
- Verify the conclusion.
- If the query requires live/current information, clearly
  explain that Reasoning Mode is not intended for such
  queries and remind the user to use Standard Mode.
- Do not expose hidden chain-of-thought.
- Provide a concise reasoning summary instead.
- Keep the final answer directly related to the problem.


IMPORTANT OUTPUT FORMAT:

Every field MUST be a plain string.

The required structure is exactly:

{
  "understanding": "string",
  "approach": "string",
  "reasoning": "string",
  "verification": "string",
  "final_answer": "string"
}

DO NOT return arrays.
DO NOT return objects.
DO NOT return nested JSON inside any field.

If the reasoning naturally contains multiple steps,
represent those steps as text inside the "reasoning" string.

If verification contains multiple checks,
represent them as text inside the "verification" string.

For example:

"reasoning": "Step 1: ... Step 2: ... Step 3: ..."

NOT:

"reasoning": [
  {...},
  {...}
]

Likewise:

"verification": "The first branch is valid. The second branch is valid."

NOT:

"verification": [
  "...",
  "..."
]
`;


      const result =
            await model.generateStructured(

                  [

                        {

                              role:
                                    "system",

                              content:
                                    getReasoningSystemPrompt(),

                        },

                        {

                              role:
                                    "user",

                              content:
                                    structuredPrompt,

                        },

                  ],

                  reasoningSolutionSchema,

                  {

                        temperature: 0,

                  }

            );


      const generationTimeMs =
            performance.now() - start;


      // ========================================================
      // SSE EVENT
      // ========================================================

      writer({
            event: "reasoning_solver_completed",

            data: {
                  solver: "solution_2",
                  model: model.name,
                  solution: result,
                  generationTimeMs,
            },
      });


      console.log(

            `🧠 Reasoning Solver 2 completed in ` +
            `${generationTimeMs.toFixed(2)} ms`

      );


      return {

            solution_2:
                  result,

      };

};


// ============================================================
// JUDGE NODE
// ============================================================

const judgeNode: GraphNode<typeof State> = async (
      state
) => {

      const writer = getWriter();


      const judge =
            modelRegistry.get(
                  "groq-gpt-oss-120b"
            );


      console.log(
            `⚖️ Reasoning Judge: ${judge.name}`
      );


      writer({

            event:
                  "reasoning_judge_started",

            data: {

                  judge:
                        judge.name,

            },

      });


      const start =
            performance.now();


      // ========================================================
      // JUDGE PROMPT
      // ========================================================

      const judgePrompt = `

You are the final evaluator in an AI Reasoning Battle.

Two AI models independently attempted to solve the
same problem.

Your task is NOT simply to determine which answer looks
better.

You must evaluate the actual reasoning artifacts and
produce:

1. Independent scores for both solutions.
2. A final winner.
3. A clear final verdict explaining WHY the winner was
   selected.


============================================================
PROBLEM
============================================================

${state.problem}


============================================================
SOLUTION 1
============================================================

UNDERSTANDING:

${state.solution_1.understanding}


APPROACH:

${state.solution_1.approach}


REASONING:

${state.solution_1.reasoning}


VERIFICATION:

${state.solution_1.verification}


FINAL ANSWER:

${state.solution_1.final_answer}


============================================================
SOLUTION 2
============================================================

UNDERSTANDING:

${state.solution_2.understanding}


APPROACH:

${state.solution_2.approach}


REASONING:

${state.solution_2.reasoning}


VERIFICATION:

${state.solution_2.verification}


FINAL ANSWER:

${state.solution_2.final_answer}


============================================================
EVALUATION CRITERIA
============================================================

Evaluate each solution independently.


1. CORRECTNESS
---------------

Determine whether the final answer is correct.

Consider:

- Mathematical correctness
- Logical correctness
- Factual correctness
- Consistency with the problem
- Whether the conclusion actually follows from the reasoning


2. REASONING QUALITY
--------------------

Evaluate:

- Logical progression
- Important deductions
- Clarity
- Soundness of reasoning
- Whether conclusions follow from previous steps
- Unsupported assumptions
- Unnecessary reasoning

Do NOT reward verbosity by itself.


3. VERIFICATION QUALITY
-----------------------

Evaluate:

- Whether the solution actually checks its result
- Calculation verification
- Assumption checking
- Edge-case consideration
- Internal consistency
- Whether the verification supports the final answer


4. COMPLETENESS
---------------

Evaluate:

- Whether important constraints were considered
- Whether important cases were addressed
- Whether assumptions were identified
- Whether the answer actually addresses the question
- Whether important reasoning is missing


============================================================
WINNER SELECTION
============================================================

Choose the winner based on the complete reasoning quality.

Do NOT favor:

- A model because of its identity
- Solution 1 because it appears first
- A longer response
- A more confident response
- More complicated vocabulary

A concise and correct solution can beat a verbose solution.

A solution claiming that it verified something should NOT
receive verification credit unless the verification actually
supports the conclusion.

If both solutions are very similar, use the quality of
verification and reasoning reliability to distinguish them.


============================================================
FINAL VERDICT
============================================================

The verdict is extremely important.

Do NOT only provide scores.

Explain:

- Which solution won
- Why it won
- The key reasoning difference
- Whether both solutions were correct
- Whether either solution contained weaknesses
- What specifically made the winning reasoning more reliable


The verdict should be concise but informative.

Example style:

"Solution 2 wins because both solutions reach the correct
answer, but Solution 2 provides a clearer decomposition of
the problem and performs a direct verification of the
calculation. Solution 1 is correct but provides less
explicit verification."

Do NOT copy this example unless it actually applies.


============================================================
IMPORTANT
============================================================

Evaluate only the provided problem and solution artifacts.

Do not introduce unrelated information.

Return only the structured evaluation requested by the schema.

`;


      // ========================================================
      // STRUCTURED JUDGMENT
      // ========================================================

      const result =
            await judge.generateStructured(

                  [

                        {

                              role:
                                    "system",

                              content: `

You are a neutral AI reasoning evaluator.

Evaluate the two solutions strictly from:

1. The original problem.
2. Solution 1 reasoning artifacts.
3. Solution 2 reasoning artifacts.

Do not favor either model.

Do not reward verbosity.

Do not invent missing information.

The final verdict must explain the reasoning behind
the winner.

Return only the requested structured evaluation.

`,

                        },

                        {

                              role:
                                    "user",

                              content:
                                    judgePrompt,

                        },

                  ],

                  reasoningJudgeSchema,

                  {

                        temperature: 0,

                  }

            );


      const judgeTimeMs =
            performance.now() - start;


      // ========================================================
      // JUDGE SSE EVENT
      // ========================================================

      writer({

            event:
                  "reasoning_judge_completed",

            data: {

                  judge:
                        result,

                  judgeTimeMs,

            },

      });


      console.log(

            `⚖️ Reasoning Judge completed in ` +
            `${judgeTimeMs.toFixed(2)} ms`

      );


      return {

            judge:
                  result,

      };

};


// ============================================================
// BUILD REASONING GRAPH
// ============================================================

const reasoningGraph =

      new StateGraph(State)

            // -------------------------------------------------
            // Nodes
            // -------------------------------------------------

            .addNode(
                  "solver1",
                  solver1Node
            )

            .addNode(
                  "solver2",
                  solver2Node
            )

            /*
             * IMPORTANT:
             *
             * State already contains a channel called `judge`.
             *
             * Therefore the graph node cannot also be named
             * `judge`.
             *
             * We use `evaluate` as the node name.
             */

            .addNode(
                  "evaluate",
                  judgeNode
            )


            // -------------------------------------------------
            // Parallel Solver Execution
            // -------------------------------------------------

            .addEdge(
                  START,
                  "solver1"
            )

            .addEdge(
                  START,
                  "solver2"
            )


            // -------------------------------------------------
            // Both Solvers → Judge
            // -------------------------------------------------

            .addEdge(
                  [
                        "solver1",
                        "solver2",
                  ],
                  "evaluate"
            )


            // -------------------------------------------------
            // Judge → END
            // -------------------------------------------------

            .addEdge(
                  "evaluate",
                  END
            )


            .compile();


// ============================================================
// GRAPH EVENT TYPE
// ============================================================

type GraphEvent = {

      event: string;

      data?: unknown;

};


// ============================================================
// GRAPH INVOKE FUNCTION
// ============================================================

export default async function reasoningGraphAIInvoke(

      userMessage: string,

      model1 =
            "groq-gpt-oss-20b",

      model2 =
            "cohere",

      onEvent?: (
            event: GraphEvent
      ) => void

) {

      const start =
            performance.now();


      // ========================================================
      // START GRAPH
      // ========================================================

      const stream =
            await reasoningGraph.stream(

                  {

                        messages: [

                              new HumanMessage(
                                    userMessage
                              ),

                        ],

                        problem:
                              userMessage,

                        model_1:
                              model1,

                        model_2:
                              model2,

                  },

                  {

                        streamMode: [
                              "updates",
                              "custom",
                        ],

                  }

            );


      let finalResult: any =
            null;


      // ========================================================
      // PROCESS GRAPH STREAM
      // ========================================================

      for await (
            const chunk of stream
      ) {


            // ==================================================
            // CUSTOM EVENTS
            // ==================================================

            if (
                  Array.isArray(chunk)
            ) {

                  const [
                        mode,
                        data,
                  ] = chunk;


                  if (
                        mode === "custom"
                  ) {

                        onEvent?.(
                              data as GraphEvent
                        );

                  }


                  continue;

            }


            // ==================================================
            // GRAPH STATE UPDATES
            // ==================================================

            if (
                  chunk &&
                  typeof chunk === "object"
            ) {

                  const [
                        node,
                        update,
                  ] =
                        Object.entries(
                              chunk
                        )[0] ?? [];


                  if (
                        node ===
                        "solver1"
                  ) {

                        finalResult = {

                              ...finalResult,

                              ...update,

                        };

                  }


                  if (
                        node ===
                        "solver2"
                  ) {

                        finalResult = {

                              ...finalResult,

                              ...update,

                        };

                  }


                  if (
                        node ===
                        "evaluate"
                  ) {

                        finalResult = {

                              ...finalResult,

                              ...update,

                        };

                  }

            }

      }


      // ========================================================
      // TOTAL TIME
      // ========================================================

      const totalTimeMs =
            performance.now() - start;


      // ========================================================
      // FINAL RESPONSE
      // ========================================================

      return {

            success:
                  true,

            model_1:
                  model1,

            model_2:
                  model2,

            solution_1:
                  finalResult?.solution_1,

            solution_2:
                  finalResult?.solution_2,

            judge:
                  finalResult?.judge,

            totalTimeMs,

      };

}