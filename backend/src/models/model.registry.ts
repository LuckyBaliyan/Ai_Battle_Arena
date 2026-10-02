import type { ModelPlugin } from "./models.types.js";

import { GroqPlugin } from "./groq.plugin.js";
import { CoherePlugin } from "./cohere.plugin.js";
import { OpenRouterPlugin } from "./openRouter.plugin.js";

import config from "../config/config.js";


class ModelRegistry {

      private models =
            new Map<string, ModelPlugin>();


      constructor() {

            // Fighter 1
            this.register(
                  new GroqPlugin({
                        id: "groq-gpt-oss-20b",
                        name: "GPT-OSS 20B",
                        model: config.GROQ_FIGHTER_MODEL,
                  })
            );


            // Judge
            this.register(
                  new GroqPlugin({
                        id: "groq-gpt-oss-120b",
                        name: "GPT-OSS 120B",
                        model: config.GROQ_JUDGE_MODEL,
                  })
            );


            // Fighter 2
            this.register(
                  new CoherePlugin()
            );


            // Fighter 3 / Alternative
            this.register(
                  new OpenRouterPlugin({
                        id: "openrouter-model-1",
                        name: config.OPENROUTER_MODEL_1_NAME,
                        model: config.OPENROUTER_MODEL_1,
                        capabilities: {
                              streaming: false,
                              toolCalling: true,
                              structuredOutput: true,
                              vision: true,
                              reasoning: false,
                        },
                  })
            );

            // OpenRouter Model 2
            this.register(
                  new OpenRouterPlugin({
                        id: "openrouter-model-2",
                        name: config.OPENROUTER_MODEL_2_NAME,
                        model: config.OPENROUTER_MODEL_2,
                        capabilities: {
                              streaming: false,
                              toolCalling: true,
                              structuredOutput: true,
                              vision: true,
                              reasoning: false,
                        },
                  })
            );

            this.register(
                  new OpenRouterPlugin({
                        id: "openrouter-model-3",
                        name: config.OPENROUTER_MODEL_3_NAME,
                        model: config.OPENROUTER_MODEL_3,
                        capabilities: {
                              streaming: false,
                              toolCalling: true,
                              structuredOutput: true,
                              vision: true,
                              reasoning: false,
                        },
                  })
            );
      }


      register(model: ModelPlugin) {

            this.models.set(
                  model.id,
                  model
            );
      }


      get(modelId: string): ModelPlugin {

            const model =
                  this.models.get(modelId);


            if (!model) {

                  throw new Error(
                        `Model "${modelId}" is not registered`
                  );
            }


            return model;
      }


      list() {
            return Array.from(this.models.values()).map((model) => ({
                  id: model.id,
                  name: model.name,
                  provider: model.provider,
                  capabilities: model.capabilities,
            }));
      }
}


export const modelRegistry =
      new ModelRegistry();