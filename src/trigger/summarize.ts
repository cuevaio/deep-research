import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { logger } from "@trigger.dev/sdk/v3";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { RAW_CONTENT_SUMMARIZER_PROMPT } from "@/prompts/raw-content-summarizer";

export const summarize = schemaTask({
  id: "summarize",
  schema: z.object({
    query: z.string(),
    searchResult: z.object({
      title: z.string().optional(),
      url: z.string(),
      content: z.string(),
    }),
  }),
  run: async ({ query, searchResult }) => {
    logger.log("Summarizing", { query, searchResult });

    const summaryResults = await generateText({
      model: openai("gpt-4.1-nano"),
      system: RAW_CONTENT_SUMMARIZER_PROMPT,
      prompt: `
      Topic: ${query}
      Search Result: ${searchResult.content}
      `,
    });

    logger.log("Summary results", { summaryResults: summaryResults.text });

    return {
      summary: summaryResults.text,
      url: searchResult.url,
    };
  },
});
