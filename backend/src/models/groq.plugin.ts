import Groq from "groq-sdk";
import { z } from "zod";

import config from "../config/config.js";

import type {
      ModelPlugin,
      ModelMessage,
      ModelResponse,
      GenerateOptions,
      ModelTool,
} from "./models.types.js";

import { executeSearchTool } from "../tools/search.tool.js";

type GroqPluginOptions = {
      id: string;
      name: string;
      model: string;
};

export class GroqPlugin implements ModelPlugin {
      readonly id: string;
      readonly name: string;
      readonly provider = "Groq";

      readonly capabilities = {
            streaming: true,
            toolCalling: true,
            structuredOutput: true,
            vision: false,
            reasoning: true,
      };

      private client: Groq;
      private modelName: string;

      constructor(options: GroqPluginOptions) {
            this.id = options.id;
            this.name = options.name;
            this.modelName = options.model;

            this.client = new Groq({
                  apiKey: config.GROQ_API_KEY,
            });
      }

      async generate(
            messages: ModelMessage[],
            options?: GenerateOptions
      ): Promise<ModelResponse> {
            const groqMessages: any[] = messages.map((message) => ({
                  role: message.role,
                  content: message.content,
            }));

            // ==========================================
            // FIRST REQUEST
            // ==========================================

            const request: any = {
                  model: this.modelName,
                  messages: groqMessages,
                  temperature: 0,
                  parallel_tool_calls: false,
                  tools: options?.tools,
                  tool_choice: "auto",
            };


            if (options?.maxTokens !== undefined) {
                  request.max_tokens = options.maxTokens;
            }

            if (options?.tools && options.tools.length > 0) {
                  request.tools = options.tools;
                  request.tool_choice = "auto";
            }

            console.log(`🤖 Calling Groq: ${this.modelName}`);

            const response =
                  await this.client.chat.completions.create(request);

            const message = response.choices[0]?.message;

            if (!message) {
                  throw new Error("Groq returned an empty response");
            }

            // ==========================================
            // NO TOOL CALL
            // ==========================================

            if (!message.tool_calls || message.tool_calls.length === 0) {
                  return {
                        text: message.content ?? "",
                  };
            }

            // ==========================================
            // TOOL CALL
            // ==========================================

            console.log("🛠️ Groq requested a tool");

            groqMessages.push(message);

            for (const toolCall of message.tool_calls) {
                  if (toolCall.function.name !== "searchInternet") {
                        continue;
                  }

                  let query = "";

                  try {
                        const args = JSON.parse(toolCall.function.arguments);
                        query = args.query;

                        if (typeof query !== "string" || query.trim() === "") {
                              throw new Error("Invalid search query");
                        }
                  } catch {
                        throw new Error(
                              `Invalid searchInternet arguments: ${toolCall.function.arguments}`
                        );
                  }

                  console.log("🔎 Searching Tavily:", query);

                  const result = await executeSearchTool(query);

                  console.log("✅ Tavily search completed");

                  groqMessages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: result,
                  });
            }

            // ==========================================
            // FINAL RESPONSE
            // ==========================================

            console.log("🤖 Sending Tavily result back to Groq...");

            const finalMessages: any[] = [
                  {
                        role: "system",
                        content:
                              "You are answering the user's question using the web search results provided below. " +
                              "Do not call any tools. " +
                              "Answer the user's original question directly and naturally.",
                  },
                  {
                        role: "user",
                        content:
                              `Original question:\n\n${messages[0].content}\n\n` +
                              `Web search results:\n\n${groqMessages
                                    .filter((msg) => msg.role === "tool")
                                    .map((msg) => msg.content)
                                    .join("\n\n")}`,
                  },
            ];

            const finalResponse =
                  await this.client.chat.completions.create({
                        model: this.modelName,
                        messages: finalMessages,
                        tools: [],
                        temperature: 0,
                  });

            const finalMessage =
                  finalResponse.choices[0]?.message;

            if (!finalMessage) {
                  throw new Error(
                        "Groq returned an empty final response"
                  );

            }

            console.log("✅ Final Groq response received");

            return {
                  text: finalMessage.content ?? "",
            };
      }

      async generateStructured<T>(
            messages: ModelMessage[],
            schema: unknown,
            options?: GenerateOptions
      ): Promise<T> {
            const groqMessages = messages.map((message) => ({
                  role: message.role,
                  content: message.content,
            }));

            // ==========================================
            // ZOD → JSON SCHEMA
            // ==========================================

            const jsonSchema =
                  schema &&
                        typeof schema === "object" &&
                        "_zod" in schema
                        ? z.toJSONSchema(schema as z.ZodType)
                        : schema;

            console.log(
                  "🧾 Groq JSON Schema:",
                  JSON.stringify(jsonSchema, null, 2)
            );


            // ==========================================
            // STRUCTURED REQUEST
            // ==========================================

            const request: any = {
                  model: this.modelName,
                  messages: groqMessages,

                  response_format: {
                        type: "json_schema",
                        json_schema: {
                              name: "evaluation",
                              strict: true,
                              schema: jsonSchema,
                        },
                  },

                  //reasoning_effort: "high",
                  temperature: options?.temperature ?? 0,
            };

            if (options?.maxTokens !== undefined) {
                  request.max_tokens = options.maxTokens;
            }

            console.log(
                  `🤖 Calling structured Groq model: ${this.modelName}`
            );

            const response =
                  await this.client.chat.completions.create(request);

            const content =
                  response.choices[0]?.message?.content;

            if (!content) {
                  throw new Error(
                        "Groq returned an empty structured response"
                  );
            }

            try {
                  return JSON.parse(content) as T;
            } catch {
                  throw new Error(
                        `Groq returned invalid JSON: ${content}`
                  );
            }
      }
}