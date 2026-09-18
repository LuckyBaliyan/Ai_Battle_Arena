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
import { searchInternetTool } from "../../tools/search.tool.js";


// --------------------------------------------------
// Judge output schema
// --------------------------------------------------

const judgeSchema = z.object({
      solution_1_score: z.number().min(0).max(10),
      solution_2_score: z.number().min(0).max(10),

      solution_1_reasoning: z.string(),
      solution_2_reasoning: z.string(),

      winner: z.enum(["solution_1", "solution_2"]),
});


// --------------------------------------------------
// Graph State
// --------------------------------------------------

const State = new StateSchema({

      messages: MessagesValue,

      // Models selected for each solver
      model_1: new ReducedValue(z.string().default(""), {
            reducer: (_, next) => next,
      }),

      model_2: new ReducedValue(z.string().default(""), {
            reducer: (_, next) => next,
      }),

      // Generated solutions
      solution_1: new ReducedValue(z.string().default(""), {
            reducer: (_, next) => next,
      }),

      solution_2: new ReducedValue(z.string().default(""), {
            reducer: (_, next) => next,
      }),

      // Generation timing
      generationTimeMs: new ReducedValue(
            z.object({
                  solution_1: z.number(),
                  solution_2: z.number(),
            }).default({
                  solution_1: 0,
                  solution_2: 0,
            }),
            {
                  reducer: (current, next) => ({
                        solution_1:
                              next.solution_1 !== 0
                                    ? next.solution_1
                                    : current.solution_1,

                        solution_2:
                              next.solution_2 !== 0
                                    ? next.solution_2
                                    : current.solution_2,
                  }),
            }
      ),

      // Judge result
      judge_recommendation: new ReducedValue(
            judgeSchema.default({
                  solution_1_score: 0,
                  solution_2_score: 0,
                  solution_1_reasoning: "",
                  solution_2_reasoning: "",
                  winner: "solution_1",
            }),
            {
                  reducer: (_, next) => next,
            }
      ),

      // Judge timing
      judgeTimeMs: new ReducedValue(
            z.number().default(0),
            {
                  reducer: (_, next) => next,
            }
      ),
});



const getSolverSystemPrompt = () => {
      const today = new Date()
            .toISOString()
            .split("T")[0];

      return `
You are an AI assistant answering the user's question.

Today's date is ${today}.

IMPORTANT RULES:

- For latest, current, today, recent, breaking, or
  time-sensitive questions, ALWAYS use the web search tool.

- For time-sensitive searches, include the current year
  and, when useful, the full current date.

- Treat search results as source material, not as automatically
  verified facts.

- Prefer information from reputable and authoritative sources.

- Pay attention to the publication date of search results.

- Do not present an older event as today's event.

- Do not assume that a person, event, position, statistic,
  or claim in a search result is correct.

- Cross-check important or surprising claims against
  multiple search results when possible.

- Remove duplicate, irrelevant, outdated, or conflicting
  results.

- Do NOT simply copy or dump search results.

- Synthesize the relevant information into a concise answer.

- If reliable sources disagree or the available results are
  insufficient to establish a fact, explicitly say so.

- Never invent missing information.

- Never fabricate names, dates, events, statistics, quotes,
  positions, or sources.

For news questions:
- Prefer developments actually reported on or immediately
  before today's date.
- Clearly distinguish today's developments from background
  information.
- Do not include future events as if they already happened.

Do not output tool-call syntax in your final answer.
`;
};


// --------------------------------------------------
// Solver 1
// --------------------------------------------------

const solver1Node: GraphNode<typeof State> = async (state) => {

      const writer = getWriter();

      // Get whichever model frontend selected
      const model = modelRegistry.get(state.model_1);

      const userMessage = state.messages[0].text;

      const tool = structuredClone(searchInternetTool);

      console.log(
            `🤖 Solver 1 using: ${model.name}`
      );

      writer({
            event: "solver_started",
            data: {
                  solver: "solver1",
                  model: model.name,
            },
      });

      const start = performance.now();

      const result = await model.generate(
            [
                  {
                        role: "system",
                        content: getSolverSystemPrompt(),
                  },
                  {
                        role: "user",
                        content: userMessage,
                  },
            ],
            {
                  tools: [tool],
            }
      );

      const generationTimeMs =
            performance.now() - start;

      console.log(
            `✅ Solver 1 completed in ${generationTimeMs.toFixed(2)} ms`
      );

      writer({
            event: "solver_completed",
            data: {
                  solver: "solver1",
                  model: model.name,
                  solution: result.text,
                  generationTimeMs,
            },
      });

      return {
            solution_1: result.text,

            generationTimeMs: {
                  solution_1: generationTimeMs,
                  solution_2: 0,
            },
      };
};


// --------------------------------------------------
// Solver 2
// --------------------------------------------------

const solver2Node: GraphNode<typeof State> = async (state) => {

      const writer = getWriter();

      // Get whichever model frontend selected
      const model = modelRegistry.get(state.model_2);

      const userMessage = state.messages[0].text;

      const tool = structuredClone(searchInternetTool);

      console.log(
            `🤖 Solver 2 using: ${model.name}`
      );

      writer({
            event: "solver_started",
            data: {
                  solver: "solver2",
                  model: model.name,
            },
      });

      const start = performance.now();

      const result = await model.generate(
            [
                  {
                        role: "system",
                        content: getSolverSystemPrompt(),
                  },
                  {
                        role: "user",
                        content: userMessage,
                  },
            ],
            {
                  tools: [tool],
            }
      );

      const generationTimeMs =
            performance.now() - start;

      writer({
            event: "solver_completed",
            data: {
                  solver: "solver2",
                  model: model.name,
                  solution: result.text,
                  generationTimeMs,
            },
      });

      console.log(
            `✅ Solver 2 completed in ${generationTimeMs.toFixed(2)} ms`
      );

      return {
            solution_2: result.text,

            generationTimeMs: {
                  solution_1: 0,
                  solution_2: generationTimeMs,
            },
      };
};


// --------------------------------------------------
// Judge
// --------------------------------------------------

const judgeNode: GraphNode<typeof State> = async (state) => {

      const writer = getWriter();

      console.log("⚖️ Invoking AI judge...");

      // For now judge is fixed.
      // Later we can make the judge selectable too.
      const judge =
            modelRegistry.get("groq-gpt-oss-120b");

      const {
            solution_1,
            solution_2,
      } = state;

      writer({
            event: "judge_started",
            data: {
                  judge: judge.name,
            },
      });

      const start = performance.now();

      const result =
            await judge.generateStructured(
                  [
                        {
                              role: "system",
                              content: `
You are an expert AI evaluator and judge.

Your task is to objectively compare two AI-generated
solutions to the same problem.

Evaluate both solutions based on:

1. Correctness
2. Relevance
3. Quality
4. Completeness
5. Reasoning
6. Efficiency
7. Overall usefulness

Rules:

- Do not favor Solution 1 or Solution 2.
- Do not favor verbosity.
- For coding problems, consider correctness,
  complexity, edge cases and implementation quality.
- For reasoning problems, prioritize logical correctness.
- For creative tasks, prioritize relevance and creativity.
- Give each solution a score from 0 to 10.
- Give concise reasoning for each score.
- Finally select the stronger solution as the winner.

Return only the structured response.
                              `,
                        },

                        {
                              role: "user",
                              content: `
The problem/question is:

${state.messages[0].text}


================ SOLUTION 1 ================

${solution_1}


================ SOLUTION 2 ================

${solution_2}


Compare both solutions and provide:

- score for solution 1
- score for solution 2
- concise reasoning for solution 1
- concise reasoning for solution 2
- winner
                              `,
                        },
                  ],
                  judgeSchema
            );

      const judgeTimeMs =
            performance.now() - start;

      writer({
            event: "judge_completed",
            data: {
                  judge: judge.name,
                  judgeTimeMs,
                  judge_recommendation: result,
            },
      });

      console.log(
            `⚖️ Judge completed in ${judgeTimeMs.toFixed(2)} ms`
      );

      return {
            judge_recommendation: result,
            judgeTimeMs,
      };
};


// --------------------------------------------------
// Graph
// --------------------------------------------------

const graph = new StateGraph(State)

      .addNode("solver1", solver1Node)

      .addNode("solver2", solver2Node)

      .addNode("judge", judgeNode)

      // Run both solvers in parallel
      .addEdge(START, "solver1")
      .addEdge(START, "solver2")

      // Judge waits for BOTH solvers
      .addEdge(
            ["solver1", "solver2"],
            "judge"
      )

      .addEdge("judge", END)

      .compile();


// --------------------------------------------------
// Graph Invoke
// --------------------------------------------------
type GraphEvent = {
      event: string;
      data?: unknown;
};

export default async function graphAIInvoke(
      userMessage: string,
      model1: string = "groq-gpt-oss-120b",
      model2: string = "cohere",
      onEvent?: (event: GraphEvent) => void
) {
      model1 = model1 || "groq-gpt-oss-120b";
      model2 = model2 || "cohere";

      const start = performance.now();

      onEvent?.({
            event: "battle_started",
            data: {
                  model1,
                  model2,
            },
      });

      const stream = await graph.stream(
            {
                  messages: [
                        new HumanMessage(userMessage),
                  ],

                  model_1: model1,
                  model_2: model2,
            },
            {
                  streamMode: ["updates", "custom"],
            }
      );

      let result: any = {};

      for await (const chunk of stream) {

            console.log(
                  "🌊 Graph stream chunk:",
                  chunk
            );

            // -----------------------------------------
            // Custom events
            // -----------------------------------------

            if (
                  Array.isArray(chunk) &&
                  chunk[0] === "custom"
            ) {

                  const customEvent = chunk[1] as GraphEvent;

                  onEvent?.(customEvent);

                  continue;
            }

            // -----------------------------------------
            // Graph state updates
            // -----------------------------------------

            if (
                  Array.isArray(chunk) &&
                  chunk[0] === "updates"
            ) {

                  const update = chunk[1];

                  result = {
                        ...result,
                        ...update,
                  };
            }
      }

      const totalTimeMs =
            performance.now() - start;

      console.log(
            `🏁 Total graph time: ${totalTimeMs.toFixed(2)} ms`
      );

      onEvent?.({
            event: "battle_completed",
            data: {
                  totalTimeMs,
            },
      });

      return {
            ...result,
            totalTimeMs,
      };
}