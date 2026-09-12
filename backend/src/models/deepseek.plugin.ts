import OpenAI from "openai";

import config from "../config/config.js";

import type {
      ModelPlugin,
      ModelMessage,
      ModelResponse,
      GenerateOptions,
} from "./models.types.js";


export class DeepSeekPlugin implements ModelPlugin {

      readonly id = "deepseek";

      readonly name = "DeepSeek V4 Pro";

      readonly provider = "DeepSeek";


      readonly capabilities = {
            streaming: true,
            toolCalling: true,
            structuredOutput: true,
            vision: false,
            reasoning: true,
      };


      private client: OpenAI;


      constructor() {

            this.client = new OpenAI({

                  apiKey: config.DEEPSEEK_API_KEY,

                  baseURL: "https://api.deepseek.com",
            });
      }


      async generate(
            messages: ModelMessage[],
            options?: GenerateOptions
      ): Promise<ModelResponse> {

            const response =
                  await this.client.chat.completions.create({

                        model: "deepseek-v4-pro",

                        messages: messages.map((message) => ({
                              role: message.role,
                              content: message.content,
                        })),
                  });


            return {
                  text:
                        response.choices[0]?.message?.content ?? "",
            };
      }

      async generateStructured<T>(
            messages: ModelMessage[],
            schema: unknown,
            options?: GenerateOptions
      ): Promise<T> {

            const request = {
                  model: "deepseek-v4-pro",

                  messages: messages.map((message) => ({
                        role: message.role,
                        content: message.content,
                  })),

                  response_format: {
                        type: "json_object",
                  },

                  temperature: options?.temperature,

                  max_tokens: options?.maxTokens,
            };


            const response =
                  await this.client.chat.completions.create(
                        request as any
                  );


            const content =
                  response.choices[0]?.message?.content ?? "{}";


            return JSON.parse(content) as T;
      }
}