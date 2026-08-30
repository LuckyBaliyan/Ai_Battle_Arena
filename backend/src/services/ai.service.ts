import { createAgent, SystemMessage, tool } from "langchain";
import { scrapWeb } from "./webScrap.service.js";
import { mistralaiModel, cohereModel } from "./model.service.js";

import { z } from "zod";

//Webscrapper tool for models
/*export const searchWeb = tool(scrapWeb, {
      name: "searchInternet",
      description: "use this tool to search for latest information from the internet?",
      schema: z.object({
            query: z.string().describe("query to be searched"),
      }),
})*/
const now = new Date();

const getCurrDate = () => {
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');

      const formattedDate = `${yyyy}-${mm}-${dd}`;
      return formattedDate;
}

export const searchWeb = tool(
      scrapWeb, {
      name: "searchInternet",

      description:
            "Search the internet for current, recent, or time-sensitive information.",

      schema: z.object({
            query: z
                  .string()
                  .describe("The search query"),
      }),
}
);

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
