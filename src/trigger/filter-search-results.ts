import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { SearchResultSchema } from "./search";
import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { FILTER_PROMPT } from "@/prompts/filter";
import { FILTER_PARSING_PROMPT } from "@/prompts/filter-parsing";

export const filterSearchResults = schemaTask({
  id: "filter-search-results",
  schema: z.object({
    searchResults: z.array(SearchResultSchema.omit({ favicon: true })),
    originalQuery: z.string(),
    clarification: z.string().optional(),
  }),
  run: async ({ searchResults, originalQuery, clarification }) => {
    const filterResults = await generateText({
      model: openai("o3"),
      system: FILTER_PROMPT,
      prompt: `
      Original Query: ${originalQuery}
      Clarification: ${clarification || "None"}
      Search Results:\n${searchResults.map((result, index) => `[${index + 1}] ${result.title} - ${result.url}\n${result.summary}`).join("\n")}
      `.trim(),
    });

    logger.log("Filter prompt", { prompt: filterResults.text });

    const filteredSearchResults = await generateObject({
      model: openai("gpt-4.1"),
      system: FILTER_PARSING_PROMPT,
      prompt: filterResults.text,
      schema: z.object({
        filteredSearchResults: z.array(z.number()),
      }),
    });

    return {
      searchResults: filteredSearchResults.object.filteredSearchResults,
    };
  },
});
