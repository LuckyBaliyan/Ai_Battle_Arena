import express from "express";
import graphAIInvoke from "./services/graphs/standardGraph.ai.service.js";
import cors from "cors";
import { modelRegistry } from "./models/model.registry.js";
import { z } from "zod";
import { searchInternetTool } from "./tools/search.tool.js";

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
            const { input, model1, model2 } = req.body;
            console.log('Received input:', input);

            const result = await graphAIInvoke(input, model1, model2);

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

export default app;