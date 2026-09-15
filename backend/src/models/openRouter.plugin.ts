import OpenAI from "openai";
import config from "../config/config.js";

import type {
      ModelPlugin,
      ModelMessage,
      ModelResponse,
      GenerateOptions,
} from "./models.types.js";

import { executeSearchTool } from "../tools/search.tool.js";

type OpenRouterPluginOptions = {
      id: string;
      name: string;
      model: string;
};

export class OpenRouterPlugin implements ModelPlugin {
      readonly id: string;
      readonly name: string;
      readonly provider = "OpenRouter";

      readonly capabilities = {
            streaming: false,
            toolCalling: true,
            structuredOutput: true,
            vision: false,
            reasoning: false,
      };

      private client: OpenAI;
      private modelName: string;

      constructor(options: OpenRouterPluginOptions) {
            this.id = options.id;
            this.name = options.name;
            this.modelName = options.model;

            this.client = new OpenAI({
                  apiKey: config.OPEN_ROUTER_API_KEY,
                  baseURL: "https://openrouter.ai/api/v1",
            });
      }

      async generate(
            messages: ModelMessage[],
            options?: GenerateOptions
      ): Promise<ModelResponse> {

            const openRouterMessages: any[] =
                  messages.map((message) => ({
                        role: message.role,
                        content: message.content,
                  }));

            const request: any = {
                  model: this.modelName,
                  messages: openRouterMessages,
            };

            if (options?.temperature !== undefined) {
                  request.temperature = options.temperature;
            }

            if (options?.maxTokens !== undefined) {
                  request.max_tokens = options.maxTokens;
            }

            if (options?.tools && options.tools.length > 0) {
                  request.tools = options.tools;
                  request.tool_choice = "auto";
            }

            const response =
                  await this.client.chat.completions.create(request);

            const message = response.choices[0]?.message;

            if (!message) {
                  throw new Error(
                        "OpenRouter returned an empty response"
                  );
            }

            // No tool call
            if (
                  !message.tool_calls ||
                  message.tool_calls.length === 0
            ) {
                  return {
                        text: message.content ?? "",
                  };
            }

            // Add assistant tool-call message
            openRouterMessages.push(message);

            // Execute requested tools
            for (const toolCall of message.tool_calls as any[]) {

                  if (
                        toolCall.function.name !==
                        "searchInternet"
                  ) {
                        continue;
                  }

                  let query = "";

                  try {
                        const args =
                              JSON.parse(
                                    toolCall.function.arguments
                              );

                        query = args.query;
                  } catch {
                        query =
                              toolCall.function.arguments;
                  }

                  const result =
                        await executeSearchTool(query);

                  openRouterMessages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: result,
                  });
            }

            // Send tool result back
            const finalResponse =
                  await this.client.chat.completions.create({
                        model: this.modelName,
                        messages: openRouterMessages,
                  });

            return {
                  text:
                        finalResponse.choices[0]?.message
                              ?.content ?? "",
            };
      }

      async generateStructured<T>(
            messages: ModelMessage[],
            schema: unknown,
            options?: GenerateOptions
      ): Promise<T> {

            const openRouterMessages =
                  messages.map((message) => ({
                        role: message.role,
                        content: message.content,
                  })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

            const request:
                  OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming =
            {
                  model: this.modelName,
                  messages: openRouterMessages,

                  response_format: {
                        type: "json_object",
                  },
            };

            if (options?.temperature !== undefined) {
                  request.temperature =
                        options.temperature;
            }

            if (options?.maxTokens !== undefined) {
                  request.max_tokens =
                        options.maxTokens;
            }

            const response =
                  await this.client.chat.completions.create(
                        request
                  );

            const content =
                  response.choices[0]?.message?.content;

            if (!content) {
                  throw new Error(
                        "OpenRouter returned empty response"
                  );
            }

            return JSON.parse(content) as T;
      }
}