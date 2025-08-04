import { generateText, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { logger, metadata, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { SearchResultSchema } from "./search";
import { ANSWER_PROMPT } from "@/prompts/answer";

export const answer = schemaTask({
  id: "answer",
  schema: z.object({
    originalQuery: z.string(),
    clarification: z.string().optional(),
    searchResults: z.array(SearchResultSchema),
  }),
  run: async ({ originalQuery, clarification, searchResults }) => {
    logger.log("Answering", { originalQuery, clarification, searchResults });

    const result = streamText({
      model: openai("o3"),
      system: ANSWER_PROMPT,
      prompt: `
    Original Query: ${originalQuery}
    Clarification: ${clarification}
    Search Results: ${searchResults.map((result) => `[${result.title}](${result.url}):\n${result.summary}`).join("\n")}
    `.trim(),
    });

    let answer = "";

    const stream = await metadata.stream("answer", result.textStream);

    for await (const chunk of stream) {
      answer += chunk;
    }

    return {
      answer,
    };
  },
});
