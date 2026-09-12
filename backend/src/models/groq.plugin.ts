import Groq from "groq-sdk";
import { z } from "zod";

import config from "../config/config.js";

import type {
  ModelPlugin,
  ModelMessage,
  ModelResponse,
  GenerateOptions,
} from "./models.types.js";

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
    const groqMessages = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    const request: any = {
      model: this.modelName,
      messages: groqMessages,
    };

    if (options?.temperature !== undefined) {
      request.temperature = options.temperature;
    }

    if (options?.maxTokens !== undefined) {
      request.max_tokens = options.maxTokens;
    }

    const response = await this.client.chat.completions.create(request);

    return {
      text: response.choices[0]?.message?.content ?? "",
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

    /*
     * Convert Zod schema → JSON Schema
     */
    const jsonSchema =
      schema &&
      typeof schema === "object" &&
      "_zod" in schema
        ? z.toJSONSchema(schema as z.ZodType)
        : schema;

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

      reasoning_effort: "high",
    };

    if (options?.maxTokens !== undefined) {
      request.max_tokens = options.maxTokens;
    }

    const response = await this.client.chat.completions.create(request);

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Groq returned an empty structured response");
    }

    return JSON.parse(content) as T;
  }
}