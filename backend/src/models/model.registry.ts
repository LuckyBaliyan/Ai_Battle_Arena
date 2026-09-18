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
                        id: "openrouter-ling",
                        name: "Ling 3.0 Flash VL",
                        model: "inclusionai/ling-3.0-flash-vl:free",
                  })
            );

            // OpenRouter Model 2
            this.register(
                  new OpenRouterPlugin({
                        id: "openrouter-llama",
                        name: "Llama 3.3 70B",
                        model: "meta-llama/llama-3.3-70b-instruct:free",
                  })
            );

            this.register(
                  new OpenRouterPlugin({
                        id: "openrouter-nex-mini",
                        name: "Nex-N2.5-Mini",
                        model: "nex-agi/nex-n2.5-mini:free",
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