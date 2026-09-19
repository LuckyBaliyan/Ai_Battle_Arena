import { ChatCohere } from "@langchain/cohere";
import {
      HumanMessage,
      SystemMessage,
      AIMessage,
      ToolMessage,
      BaseMessage
} from "@langchain/core/messages";

import config from "../config/config.js";

import type {
      ModelPlugin,
      ModelMessage,
      ModelResponse,
      GenerateOptions,
} from "./models.types.js";

import { executeSearchTool } from "../tools/search.tool.js";


export class CoherePlugin implements ModelPlugin {

      readonly id = "cohere";
      readonly name = "Cohere";
      readonly provider = "Cohere";

      readonly capabilities = {
            streaming: false,
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

            let model = this.model;

            if (options?.tools && options.tools.length > 0) {
                  model = this.model.bindTools(
                        options.tools as any
                  ) as ChatCohere;
            }

            const langchainMessages: BaseMessage[] =
                  this.convertMessages(messages);

            const response = await model.invoke(langchainMessages);

            // No tool call → final answer
            if (
                  !response.tool_calls ||
                  response.tool_calls.length === 0
            ) {
                  return {
                        text: response.text,
                  };
            }

            // Add assistant response containing tool calls
            langchainMessages.push(response);

            // Execute requested tools
            for (const toolCall of response.tool_calls) {

                  if (toolCall.name !== "searchInternet") {
                        continue;
                  }

                  const query =
                        typeof toolCall.args === "object" &&
                              toolCall.args !== null
                              ? String(
                                    (toolCall.args as { query?: string })
                                          .query ?? ""
                              )
                              : String(toolCall.args);

                  const result =
                        await executeSearchTool(query);

                  langchainMessages.push(
                        new ToolMessage({
                              content: result,
                              tool_call_id: toolCall.id ?? "",
                        })
                  );
            }

            // Send tool result back to Cohere
            const finalResponse =
                  await model.invoke(langchainMessages);

            return {
                  text: finalResponse.text,
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