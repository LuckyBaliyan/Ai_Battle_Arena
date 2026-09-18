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
                  temperature: options?.temperature ?? 0,
                  parallel_tool_calls: false,
            };

            if (options?.maxTokens !== undefined) {
                  request.max_tokens = options.maxTokens;
            }

            if (options?.tools && options.tools.length > 0) {
                  request.tools = options.tools;
                  request.tool_choice = "auto";
            }

            console.log(`🤖 Calling OpenRouter: ${this.modelName}`);

            const response =
                  await this.client.chat.completions.create(request);

            const message = response.choices[0]?.message;

            if (!message) {
                  throw new Error(
                        "OpenRouter returned an empty response"
                  );
            }

            /*
             * =========================================================
             * CASE 1: Proper structured tool call
             * =========================================================
             */

            if (
                  message.tool_calls &&
                  message.tool_calls.length > 0
            ) {

                  console.log("🛠️ OpenRouter requested a tool");

                  openRouterMessages.push(message);

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

                              throw new Error(
                                    `Invalid searchInternet arguments: ${toolCall.function.arguments}`
                              );
                        }

                        if (
                              typeof query !== "string" ||
                              query.trim() === ""
                        ) {
                              throw new Error(
                                    "Invalid search query"
                              );
                        }

                        console.log(
                              "🔎 Searching Tavily:",
                              query
                        );

                        const result =
                              await executeSearchTool(query);

                        console.log(
                              "✅ Tavily search completed"
                        );

                        openRouterMessages.push({
                              role: "tool",
                              tool_call_id: toolCall.id,
                              content: result,
                        });
                  }

                  /*
                   * Send the tool result back to Ling
                   */
                  console.log(
                        "🤖 Sending Tavily result back to OpenRouter..."
                  );

                  const finalResponse =
                        await this.client.chat.completions.create({
                              model: this.modelName,
                              messages: openRouterMessages,
                              temperature: options?.temperature ?? 0,
                              tools: [],
                        });

                  const finalMessage =
                        finalResponse.choices[0]?.message;

                  if (!finalMessage) {
                        throw new Error(
                              "OpenRouter returned an empty final response"
                        );
                  }

                  return {
                        text: finalMessage.content ?? "",
                  };
            }


            /*
             * =========================================================
             * CASE 2: Ling returns textual <tool_call>
             * =========================================================
             */

            const content =
                  typeof message.content === "string"
                        ? message.content
                        : "";

            const toolCallMatch =
                  content.match(
                        /<tool_call>\s*searchInternet\s*[\s\S]*?<arg_key>query<\/arg_key>\s*<arg_value>([\s\S]*?)<\/arg_value>\s*<\/tool_call>/i
                  );

            if (toolCallMatch) {

                  const query =
                        toolCallMatch[1].trim();

                  if (!query) {
                        throw new Error(
                              "Ling generated an empty search query"
                        );
                  }

                  console.log(
                        "🛠️ Ling generated textual tool call"
                  );

                  console.log(
                        "🔎 Searching Tavily:",
                        query
                  );

                  const result =
                        await executeSearchTool(query);

                  console.log(
                        "✅ Tavily search completed"
                  );

                  /*
                   * We don't send the fake <tool_call> back to Ling.
                   *
                   * Instead, give Ling the original question +
                   * Tavily results and explicitly tell it to answer.
                   */

                  const originalQuestion =
                        messages
                              .filter(
                                    (message) =>
                                          message.role === "user"
                              )
                              .map(
                                    (message) =>
                                          message.content
                              )
                              .join("\n\n");

                  const finalResponse =
                        await this.client.chat.completions.create({
                              model: this.modelName,

                              messages: [
                                    {
                                          role: "system",
                                          content:
                                                "Answer the user's original question using the provided web search results. " +
                                                "Do not call tools. " +
                                                "Do not output tool-call syntax. " +
                                                "Give the final answer directly.",
                                    },
                                    {
                                          role: "user",
                                          content:
                                                `Original question:\n\n` +
                                                `${originalQuestion}\n\n` +
                                                `Web search results:\n\n` +
                                                `${result}`,
                                    },
                              ],

                              temperature:
                                    options?.temperature ?? 0,

                              tools: [],
                        });

                  const finalMessage =
                        finalResponse.choices[0]?.message;

                  if (!finalMessage) {
                        throw new Error(
                              "OpenRouter returned an empty final response"
                        );
                  }

                  console.log(
                        "✅ Final OpenRouter response received"
                  );

                  return {
                        text: finalMessage.content ?? "",
                  };
            }


            /*
             * =========================================================
             * CASE 3: Normal answer, no tool required
             * =========================================================
             */

            return {
                  text: content,
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