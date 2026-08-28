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
import { cohereModel, geminiModel, mistralaiModel } from "./model.service.js";
import { createAgent, providerStrategy } from "langchain";

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

//Start --> solution --> judge
const solutionNode: GraphNode<typeof State> = async (State) => {
      const [mistral_Solution, cohere_Solution] = await Promise.all([
            mistralaiModel.invoke(State.messages[0].text),
            cohereModel.invoke(State.messages[0].text)
      ])

      return {
            solution_1: mistral_Solution.text,
            solution_2: cohere_Solution.text,
      }
}

//soltuion --> judge --> end
const judgeNode: GraphNode<typeof State> = async (State) => {
      console.log('invoking judge with state...');

      const { solution_1, solution_2 } = State;

      const judge = createAgent({
            model: geminiModel,
            tools: [],
            responseFormat: providerStrategy(judgeSchema),
            systemPrompt: `You are an expert evaluator. Compare the two solutions 
            objectively based on correctness,relevance,
            quality, completeness, reasoning, efficiency, and how well they address the given problem or question. 
            Consider the context and requirements of the task, regardless of the domain. Give each solution a score 
            from 0–10 with a concise justification. Do not favor verbosity or style over substance. 
            Finally, select the stronger solution as the winner.`
      })

      const judgeResponse = await judge.invoke({
            messages: [
                  new HumanMessage(
                        `You are a judge task with evalvaiting the quality of 2 solutions to a problem. The
                        problem is: ${State.messages[0].text}. The first Solution is ${solution_1}. The 
                        Second solution is ${solution_2}. Provide a score between 0 - 10 for each solution,
                        where 0 means the solution is completely incorrect or irrelavent, and 10 means the
                        solution is perfect and fully addresses the problem. Also give a concise reasoning
                        for each score in solution_1_resoning and solution_2_resoning.`
                  )
            ]
      })

      const result = judgeResponse.structuredResponse;
      console.log(result);

      return {
            judge_recommandation: result,
      }
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