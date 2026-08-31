import { createAgent, SystemMessage, tool } from "langchain";
import { scrapWeb } from "./webScrap.service.js";
import { mistralaiModel, cohereModel, qwenModel, groqClient } from "./model.service.js";
import config from "../config/config.js";
const now = new Date();

const getCurrDate = () => {
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');

      const formattedDate = `${yyyy}-${mm}-${dd}`;
      return formattedDate;
}


//for the cohore or langchain models
const searchWeb = tool(scrapWeb, {
      name: "searchInternet",
      description: "Search the internet for current, recent, or time-sensitive information.",
      schema: {
            type: "object",
            properties: {
                  query: { type: "string", description: "The search query" }
            },
            required: ["query"],
            additionalProperties: false,
      },
});


// Add this near the top of ai.service.ts, separate from the LangChain `searchWeb` tool
const searchInternetTool = {
      type: "function" as const,
      function: {
            name: "searchInternet",
            description: "Search the internet for current, recent, or time-sensitive information.",
            parameters: {
                  type: "object",
                  properties: {
                        query: {
                              type: "string",
                              description: "The search query",
                        },
                  },
                  required: ["query"],
                  additionalProperties: false,
            },
      },
};

export const mistralAgent = createAgent({
      model: mistralaiModel,
      tools: [],
      systemMessage: new SystemMessage(`You are a helpful assistant participating in an AI Battle Arena.

            Answer the user's question accurately.
            
            If the question requires current, recent, or time-sensitive
            information, ALWAYS use the searchInternet tool before answering.

            Current Date: ${getCurrDate()} give relevant information according to this 
            current date
            
            Use the information returned by the tool to formulate your answer.
            
            Do not claim information is current unless you verified it
            using the search tool.
            
            Provide a clear and concise final answer.
      `),
})


export const cohoreAgent = createAgent({
      model: cohereModel,
      tools: [searchWeb],
      systemMessage: new SystemMessage(`You are a helpful assistant participating in an AI Battle Arena.

            Answer the user's question accurately.
            
            If the question requires current, recent, or time-sensitive
            information, ALWAYS use the searchInternet tool before answering.
            
            Use the information returned by the tool to formulate your answer.

            Current Date: ${getCurrDate()} give relevant information according to this 
            current date
            
            Do not claim information is current unless you verified it
            using the search tool.
            
            Provide a clear and concise final answer. 
      `),
})



export const qwenAgent = createAgent({
      model: qwenModel,
      tools: [],
      systemMessage: new SystemMessage(`You are a helpful assistant participating in an AI Battle Arena.

            Answer the user's question accurately.
            
            If the question requires current, recent, or time-sensitive
            information, ALWAYS use the searchInternet tool before answering.
            
            Use the information returned by the tool to formulate your answer.

            Current Date: ${getCurrDate()} give relevant information according to this 
            current date
            
            Do not claim information is current unless you verified it
            using the search tool.
            
            Provide a clear and concise final answer. 
      `),
})


//Direct Groq model to fix the structure issue of zod langchain in weSearch features

const SYSTEM_PROMPT = `You are a helpful assistant participating in an AI Battle Arena.

                       Answer the user's question accurately.
                       
                       If the question requires current, recent, or time-sensitive
                       information, ALWAYS use the searchInternet tool before answering.
                       
                       Current Date: ${getCurrDate()} give relevant information according to this
                       current date
                       
                       Use the information returned by the tool to formulate your answer.
                       
                       Do not claim information is current unless you verified it
                       using the search tool.
                       
                       Provide a clear and concise final answer.
`;

//multiple times tool calling cause more credits in Tavily
const MAX_TOOL_ITERATIONS = 2;

export async function runQwenAgent(userMessage: string): Promise<string> {

      const messages: any[] = [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
      ];

      for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {

            const response = await groqClient.chat.completions.create({
                  model: config.GROQ_AI_MODEL,
                  messages,
                  tools: [searchInternetTool],
                  tool_choice: "auto",
            });

            const choice = response.choices[0];
            const message = choice.message;

            // No tool call — this is the final answer
            if (!message.tool_calls || message.tool_calls.length === 0) {
                  return message.content ?? "";
            }

            // Push the assistant's tool-call message, then run each tool
            messages.push(message);

            for (const toolCall of message.tool_calls) {
                  let query = "";
                  try {
                        query = JSON.parse(toolCall.function.arguments).query;
                  } catch {
                        query = toolCall.function.arguments;
                  }

                  const result = await scrapWeb({ query });

                  messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: result,
                  });
            }
      }

      // Fallback if it never converges within the iteration cap
      const finalResponse = await groqClient.chat.completions.create({
            model: config.GROQ_AI_MODEL,
            messages,
      });

      return finalResponse.choices[0]?.message?.content ?? "";
}
