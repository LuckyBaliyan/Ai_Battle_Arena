import { HumanMessage } from "@langchain/core/messages";
import {
      StateSchema,
      MessagesValue,
      ReducedValue,
      START,
      END,
      StateGraph,
      type GraphNode,
} from "@langchain/langgraph";

import { z } from "zod";
import { GroqJudgeModel, groqClient, mistralaiModel, qwenModel } from "./model.service.js";
import { mistralAgent, cohoreAgent, qwenAgent, runQwenAgent } from "./ai.service.js";


// single source of truth for the judge's output shape —
// used both for the agent's responseFormat and for State validation
const judgeSchema = z.object({
      solution_1_score: z.number().min(0).max(10),
      solution_2_score: z.number().min(0).max(10),
      solution_1_resoning: z.string(),
      solution_2_resoning: z.string(),
      winner: z.enum(["solution_1", "solution_2"]),
});

const State = new StateSchema({
      messages: MessagesValue,
      solution_1: new ReducedValue(z.string().default(""), {
            reducer: (current, next) => {
                  return next
            }
      }),
      solution_2: new ReducedValue(z.string().default(""), {
            reducer: (current, next) => {
                  return next
            }
      }),
      judge_recommandation: new ReducedValue(
            judgeSchema.default({
                  solution_1_score: 0,
                  solution_2_score: 0,
                  solution_1_resoning: "",
                  solution_2_resoning: "",
                  winner: "solution_1",
            }),
            {
                  reducer: (current, next) => next,
            }
      )
});


const solutionNode: GraphNode<typeof State> = async (State) => {

      const [qwen_Solution, cohere_Solution] = await Promise.all([

            runQwenAgent(State.messages[0].text),

            cohoreAgent.invoke({
                  messages: [
                        new HumanMessage(State.messages[0].text)
                  ]
            })

      ]);

      const qwenMessages = qwen_Solution;
      const cohereMessages = cohere_Solution.messages;

      const cohereLastMessage =
            cohereMessages[cohereMessages.length - 1];

      return {
            solution_1: String(qwenMessages),
            solution_2: String(cohereLastMessage?.content),
      };
};


/*const judgeNode: GraphNode<typeof State> = async (State) => {

      console.log("invoking Groq judge with state...");

      const { solution_1, solution_2 } = State;

      const judgeResponse = await groqClient.chat.completions.create({

            // This comes from model.service.ts
            // Example:
            // openai/gpt-oss-20b
            // openai/gpt-oss-120b
            model: GroqJudgeModel,

            messages: [

                  {
                        role: "system",

                        content: `
                                    You are an expert AI evaluator and judge.
                                    
                                    Your task is to objectively compare two AI-generated solutions
                                    to the same problem.
                                    
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
                                    - For coding problems, consider correctness, complexity,
                                      edge cases and implementation quality.
                                    - For reasoning problems, prioritize logical correctness.
                                    - For creative tasks, prioritize relevance and creativity.
                                    - Give each solution a score from 0 to 10.
                                    - Give concise reasoning for each score.
                                    - Finally select the stronger solution as the winner.
                                    
                                    Return only the structured response.
                                    `
                  },

                  {
                        role: "user",

                        content: `
                                    The problem/question is:
                                    
                                    ${State.messages[0].text}
                                    
                                    
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
                                    `
                  }

            ],



            reasoning_effort: "low",

            response_format: {

                  type: "json_schema",

                  json_schema: {

                        name: "ai_battle_judgement",

                        strict: true,

                        schema: {

                              type: "object",

                              properties: {

                                    solution_1_score: {
                                          type: "number"
                                    },

                                    solution_2_score: {
                                          type: "number"
                                    },

                                    solution_1_resoning: {
                                          type: "string"
                                    },

                                    solution_2_resoning: {
                                          type: "string"
                                    },

                                    winner: {
                                          type: "string",

                                          enum: [
                                                "solution_1",
                                                "solution_2"
                                          ]
                                    }

                              },

                              required: [
                                    "solution_1_score",
                                    "solution_2_score",
                                    "solution_1_resoning",
                                    "solution_2_resoning",
                                    "winner"
                              ],

                              additionalProperties: false
                        }
                  }
            }

      });

      const rawResult =
            judgeResponse.choices[0]?.message?.content;


      if (!rawResult) {
            throw new Error(
                  "Groq judge returned an empty response"
            );
      }

      const result = judgeSchema.parse(
            JSON.parse(rawResult)
      );

      return {
            judge_recommandation: result,
      };
}
*/

//Back to use qwen Ai for the Judge Task
const structuredJudge = qwenModel.withStructuredOutput(judgeSchema, {
      name: "ai_battle_judgement",
      method: "jsonSchema",
});

const judgeNode: GraphNode<typeof State> = async (State) => {

      console.log("invoking Mistral judge with state...");

      const { solution_1, solution_2 } = State;

      const result = await structuredJudge.invoke([
            {
                  role: "system",
                  content: `
                              You are an expert AI evaluator and judge.
                              
                              Your task is to objectively compare two AI-generated solutions
                              to the same problem.
                              
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
                              - For coding problems, consider correctness, complexity,
                                edge cases and implementation quality.
                              - For reasoning problems, prioritize logical correctness.
                              - For creative tasks, prioritize relevance and creativity.
                              - Give each solution a score from 0 to 10.
                              - Give concise reasoning for each score.
                              - Finally select the stronger solution as the winner.
                              
                              Return only the structured response.
                              `
            },
            {
                  role: "user",
                  content: `
                              The problem/question is:
                              
                              ${State.messages[0].text}
                              
                              
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
                              `
            }
      ]);

      return {
            judge_recommandation: result,
      };
}


const graph = new StateGraph(State)
      .addNode("solution", solutionNode)
      .addNode("judge", judgeNode)
      .addEdge(START, "solution")
      .addEdge("solution", "judge")
      .addEdge("judge", END)
      .compile();


export default async function graphAIInvoke(userMessage: string) {
      const result = await graph.invoke({
            messages: [
                  new HumanMessage(userMessage),
            ]
      });

      console.log(result);
      return result;
};