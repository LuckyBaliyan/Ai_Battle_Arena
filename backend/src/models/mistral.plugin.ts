import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import config from "../config/config.js";

import type {
      ModelPlugin,
      ModelMessage,
      ModelResponse,
      GenerateOptions,
} from "./models.types.js";

export class MistralPlugin implements ModelPlugin {

    readonly id = "mistral";
    readonly name = "Mistral";
    readonly provider = "Mistral AI";

    readonly capabilities = {
        streaming: true,
        toolCalling: true,
        structuredOutput: true,
        vision: false,
        reasoning: true,
    };

    private model: ChatMistralAI;

    constructor() {
        this.model = new ChatMistralAI({
            model: "mistral-medium-latest",
            apiKey: config.MISTRAL_API_KEY,
        });
    }

    async generate(
        messages: ModelMessage[],
        options?: GenerateOptions
    ): Promise<ModelResponse> {

        const langchainMessages = messages.map((message) => {

            if (message.role === "system") {
                return new SystemMessage(message.content);
            }

            return new HumanMessage(message.content);
        });

        const response = await this.model.invoke(
            langchainMessages
        );

        return {
            text: response.text,
        };
    }

    async generateStructured<T>(
        messages: ModelMessage[],
        schema: unknown,
        options?: GenerateOptions
    ): Promise<T> {

        const structuredModel = this.model.withStructuredOutput(
            schema as any
        );

        const langchainMessages = messages.map((message) => {

            if (message.role === "system") {
                return new SystemMessage(message.content);
            }

            return new HumanMessage(message.content);
        });

        const response = await structuredModel.invoke(
            langchainMessages
        );

        return response as T;
    }
}