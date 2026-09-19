import express from "express";
import graphAIInvoke from "./services/graphs/standardGraph.ai.service.js";
import reasoningGraphAIInvoke from "./services/graphs/reasoningGraph.ai.service.js";
import cors from "cors";
import { modelRegistry } from "./models/model.registry.js";

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
            const {
                  input,
                  model1,
                  model2,
                  mode = "standard",
            } = req.body;

            console.log('Received input:', input);

            // -----------------------------
            // SSE headers
            // -----------------------------

            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            res.flushHeaders();

            // -----------------------------
            // Helper to send SSE event
            // -----------------------------

            const sendEvent = (
                  event: string,
                  data: unknown
            ) => {

                  res.write(
                        `event: ${event}\n` +
                        `data: ${JSON.stringify(data)}\n\n`
                  );

            };

            // -----------------------------
            // Run graph
            // -----------------------------

            const invokeGraph =
                  mode === "reasoning"
                        ? reasoningGraphAIInvoke
                        : graphAIInvoke;

            const result = await invokeGraph(
                  input,
                  model1,
                  model2,
                  (event) => {

                        console.log(
                              '📡 Sending SSE:',
                              event
                        );

                        sendEvent(
                              event.event,
                              event.data
                        );
                  }
            );
            // -----------------------------
            // Final result
            // -----------------------------

            sendEvent('battle_result', {
                  success: true,
                  data: result,
            });

            // Close SSE connection
            res.end();

      } catch (err) {

            console.error(
                  'Error in /invoke:',
                  err
            );

            // If SSE has already started,
            // send error through SSE.
            if (!res.headersSent) {

                  res.status(500).json({
                        success: false,
                        error:
                              err instanceof Error
                                    ? err.message
                                    : "Unknown error",
                  });

            } else {

                  res.write(
                        `event: error\n` +
                        `data: ${JSON.stringify({
                              message:
                                    err instanceof Error
                                          ? err.message
                                          : "Unknown error",
                        })}\n\n`
                  );

                  res.end();
            }
      }
});


/**
 * @description get all registered models with thier details
 */

app.get("/models", (req, res) => {
      try {
            const models = modelRegistry.list();

            res.status(200).json({
                  success: true,
                  count: models.length,
                  models,
            });

      } catch (err) {
            console.error("Error fetching models:", err);

            res.status(500).json({
                  success: false,
                  error:
                        err instanceof Error
                              ? err.message
                              : "Failed to fetch models",
            });
      }
});

export default app;