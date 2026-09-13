export type ModelMessage = {
      role: "system" | "user" | "assistant";
      content: string;
};

export type ModelTool = {
      type: "function";

      function: {
            name: string;
            description: string;

            parameters: {
                  type: "object";
                  properties: Record<string, unknown>;
                  required: string[];
                  additionalProperties?: boolean;
            };

            strict?: boolean;
      };
};

export type GenerateOptions = {
      temperature?: number;
      maxTokens?: number;
      tools?: ModelTool[];
};

export type ModelResponse = {
      text: string;
};

export interface ModelCapabilities {
      streaming: boolean;
      toolCalling: boolean;
      structuredOutput: boolean;
      vision: boolean;
      reasoning: boolean;
}

export interface ModelPlugin {
      readonly id: string;
      readonly name: string;
      readonly provider: string;
      readonly capabilities: ModelCapabilities;

      generate(
            messages: ModelMessage[],
            options?: GenerateOptions
      ): Promise<ModelResponse>;

      generateStructured<T>(
            messages: ModelMessage[],
            schema: unknown,
            options?: GenerateOptions
      ): Promise<T>;
}