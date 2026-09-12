import OpenAI from "openai";
import config from "../config/config.js";

import type {
      ModelPlugin,
      ModelMessage,
      ModelResponse,
      GenerateOptions,
} from "./models.types.js";

export class OpenRouterPlugin implements ModelPlugin {
      readonly id = "openrouter-llama";
      readonly name = "Llama 3.3 70B";
      readonly provider = "OpenRouter";

      readonly capabilities = {
            streaming: false,
            toolCalling: true,
            structuredOutput: true,
            vision: false,
            reasoning: false,
      };

      private client: OpenAI;

      private modelName =
            "inclusionai/ling-3.0-flash-vl:free";

      constructor() {
            this.client = new OpenAI({
                  apiKey: config.OPEN_ROUTER_API_KEY,
                  baseURL: "https://openrouter.ai/api/v1",
            });
      }

      async generate(
            messages: ModelMessage[],
            options?: GenerateOptions
      ): Promise<ModelResponse> {

            const openRouterMessages =
                  messages.map((message) => ({
                        role: message.role,
                        content: message.content,
                  })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

            const request: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
                  model: this.modelName,
                  messages: openRouterMessages,
            };

            if (options?.temperature !== undefined) {
                  request.temperature = options.temperature;
            }

            if (options?.maxTokens !== undefined) {
                  request.max_tokens = options.maxTokens;
            }

            const response =
                  await this.client.chat.completions.create(request);

            return {
                  text: response.choices[0]?.message?.content ?? "",
            };
      }

      async generateStructured<T>(
            messages: ModelMessage[],
            schema: any,
            options?: GenerateOptions
      ): Promise<T> {

            const openRouterMessages =
                  messages.map((message) => ({
                        role: message.role,
                        content: message.content,
                  })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

            const request: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
                  model: this.modelName,
                  messages: openRouterMessages,

                  response_format: {
                        type: "json_object",
                  },
            };

            if (options?.temperature !== undefined) {
                  request.temperature = options.temperature;
            }

            if (options?.maxTokens !== undefined) {
                  request.max_tokens = options.maxTokens;
            }

            const response =
                  await this.client.chat.completions.create(request);

            const content = response.choices[0]?.message?.content;

            if (!content) {
                  throw new Error("OpenRouter returned empty response");
            }

            return JSON.parse(content) as T;
      }
}