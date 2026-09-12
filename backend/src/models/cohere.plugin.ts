import { ChatCohere } from "@langchain/cohere";
import {
      HumanMessage,
      SystemMessage,
      AIMessage,
} from "@langchain/core/messages";

import config from "../config/config.js";

import type {
      ModelPlugin,
      ModelMessage,
      ModelResponse,
      GenerateOptions,
} from "./models.types.js";


export class CoherePlugin implements ModelPlugin {

      readonly id = "cohere";

      readonly name = "Cohere";

      readonly provider = "Cohere";


      readonly capabilities = {
            streaming: true,
            toolCalling: true,
            structuredOutput: true,
            vision: false,
            reasoning: true,
      };


      private model: ChatCohere;


      constructor() {

            this.model = new ChatCohere({
                  model: "command-a-03-2025",
                  apiKey: config.COHERE_API_KEY,
            });
      }


      private convertMessages(messages: ModelMessage[]) {

            return messages.map((message) => {

                  if (message.role === "system") {
                        return new SystemMessage(message.content);
                  }

                  if (message.role === "assistant") {
                        return new AIMessage(message.content);
                  }

                  return new HumanMessage(message.content);
            });
      }


      async generate(
            messages: ModelMessage[],
            options?: GenerateOptions
      ): Promise<ModelResponse> {

            const response = await this.model.invoke(
                  this.convertMessages(messages)
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

            const structuredModel =
                  this.model.withStructuredOutput(
                        schema as any
                  );


            const response =
                  await structuredModel.invoke(
                        this.convertMessages(messages)
                  );


            return response as T;
      }
}