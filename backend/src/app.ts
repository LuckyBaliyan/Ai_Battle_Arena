import express, { response } from "express";
import graphAIInvoke from "./services/graph.ai.service.js";

const app = express();

/**
 * health check route
 */
app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok' });
});


app.post('/use-graph', async (req, res) => {
      await graphAIInvoke(`give a diplomatic answer to "why AI is threat to humanity but not more 
            than 70 words in each soltuion?"`);

      res.status(200).json({
            message: "api hit sucessfully!"
      });
});

export default app;