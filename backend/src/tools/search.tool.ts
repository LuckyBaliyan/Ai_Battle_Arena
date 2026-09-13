import { scrapWeb } from "../services/webScrap.service.js";
import type { ModelTool } from "../models/models.types.js";

export const searchInternetTool: ModelTool = {
      type: "function",

      function: {
            name: "searchInternet",
            description:
                  "Search the internet for current, recent, or time-sensitive information.",

            parameters: {
                  type: "object",
                  properties: {
                        query: {
                              type: "string",
                              description:
                                    "The exact search query to send to the internet search engine.",
                        },
                  },
                  required: ["query"],
                  additionalProperties: false,
            },
      },
};

export const executeSearchTool = async (query: string) => {
      return await scrapWeb({ query });
};