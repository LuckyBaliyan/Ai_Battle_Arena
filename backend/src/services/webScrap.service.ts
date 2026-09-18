import config from "../config/config.js";
import { tavily as Tavily } from '@tavily/core';


const tavily = Tavily({
      apiKey: config.TAVLY_API_KEY,
});


/**
 * @description Web scrapping service using Tavily API.
 * @param {string} query - 
 */
export const scrapWeb = async ({ query }: { query: string }) => {
      const results = await tavily.search(
            query,
            {
                  maxResults: 5,
                  searchDepth: "advanced",
            }
      );

      return results.results
            .map((item, index) => `
SEARCH RESULT ${index + 1}

Title:
${item.title}

Source:
${item.url}

Content:
${item.content.slice(0, 3000)}
            `)
            .join("\n\n--------------------\n\n");
};