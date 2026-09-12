import express, { response } from "express";
import graphAIInvoke from "./services/graph.ai.service.js";
import cors from "cors";
import { modelRegistry } from "./models/model.registry.js";
import { z } from "zod";

const app = express();
app.use(express.json());

app.use(cors({
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
}));


/**
 * health check route
*/
app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok' });
});


/*app.post('/use-graph', async (req, res) => {
      await graphAIInvoke(`give a diplomatic answer to "why AI is threat to humanity but not more 
            than 70 words in each soltuion?"`);

      res.status(200).json({
            message: "api hit sucessfully!"
      });
});
*/



/**
 *invoke graphAI with input from user
 * @param input - the prompt from the user
 * @returns the response from the graphAI
 * @throws Error if the graphAI fails to invoke
*/

app.post('/invoke', async (req, res) => {
      try {
            const { input } = req.body;
            console.log('Received input:', input);

            const result = await graphAIInvoke(input);

            console.log('Result:', result);
            res.status(200).json({
                  message: "Battle Executed Successfully!",
                  success: true,
                  data: result,
            });

      } catch (err) {
            console.error('Error in /invoke:', err);
            res.status(500).json({ success: false, error: err.message });
      }
});


/*
const EvaluationSchema = z.object({
      solution_1: z.object({
        correctness: z.number().min(0).max(10),
        reasoning_quality: z.number().min(0).max(10),
        code_quality: z.number().min(0).max(10),
        efficiency: z.number().min(0).max(10),
        robustness: z.number().min(0).max(10),
        instruction_adherence: z.number().min(0).max(10),
        overall_score: z.number().min(0).max(10),
        reasoning: z.string(),
      }),
    
      solution_2: z.object({
        correctness: z.number().min(0).max(10),
        reasoning_quality: z.number().min(0).max(10),
        code_quality: z.number().min(0).max(10),
        efficiency: z.number().min(0).max(10),
        robustness: z.number().min(0).max(10),
        instruction_adherence: z.number().min(0).max(10),
        overall_score: z.number().min(0).max(10),
        reasoning: z.string(),
      }),
    
      winner: z.enum(["solution_1", "solution_2"]),
    });
    
    async function testJudge() {
      const judge = modelRegistry.get("groq-gpt-oss-120b");
    
      const messages = [
        {
          role: "system" as const,
          content: `
    You are an expert evaluator of AI-generated solutions.
    
    Evaluate both solutions independently using these six dimensions:
    
    1. Correctness
    2. Reasoning Quality
    3. Code Quality
    4. Efficiency
    5. Robustness
    6. Instruction Adherence
    
    Give each dimension a score from 0 to 10.
    
    Then give an overall score from 0 to 10.
    
    Your evaluation should consider:
    - Whether the solution correctly solves the given problem
    - Whether the reasoning is clear and logically sound
    - Whether the implementation is simple, readable and appropriate
    - Time and space efficiency
    - Handling of edge cases and unusual inputs
    - Whether the solution follows the problem requirements
    
    Finally, select the better solution as the winner.
    
    Return only the requested structured output.
          `,
        },
    
        {
          role: "user" as const,
          content: `
    Problem:
    Given an integer array, find the maximum element.
    
    Solution 1:
    Loop through the array once.
    Initialize max with the first element.
    For every element, if it is greater than max, update max.
    Return max.
    
    Solution 2:
    Sort the array in ascending order.
    Return the last element of the sorted array.
    
    Evaluate both solutions.
          `,
        },
      ];
    
      console.log("\n==============================");
      console.log("GPT-OSS 120B — FULL EVALUATION");
      console.log("==============================");
    
      const result = await judge.generateStructured(
        messages,
        EvaluationSchema
      );
    
      console.dir(result, { depth: null });
    }
    
    testJudge().catch((error) => {
      console.error("\n❌ Judge test failed:");
      console.error(error);
});*/

export default app;