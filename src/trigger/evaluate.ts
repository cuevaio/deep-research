import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { SearchResultSchema } from "./search";
import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { EVALUATION_PROMPT } from "@/prompts/evaluation";
import { EVALUATION_PARSING_PROMPT } from "@/prompts/evaluation-parsing";

export const evaluate = schemaTask({
  id: "evaluate",
  schema: z.object({
    originalQuery: z.string(),
    searchResults: z.array(SearchResultSchema),
    queries: z.array(z.string()),
  }),
  run: async ({ originalQuery, searchResults, queries }) => {
    logger.log("Evaluating", { originalQuery, searchResults, queries });

    const evaluationResults = await generateText({
      model: openai("o3"),
      system: EVALUATION_PROMPT,
      prompt: `
      Original Query: ${originalQuery}
      Search Results: ${searchResults.map((result) => `${result.title} - ${result.url}`).join("\n")}
      Queries: ${queries.join("\n")}
      `.trim(),
    });

    logger.log("Evaluation results", {
      evaluationResults: evaluationResults.text,
    });

    logger.log("Generating evaluation results object");

    const evaluationResultsObject = await generateObject({
      model: openai("gpt-4.1"),
      system: EVALUATION_PARSING_PROMPT,
      prompt: evaluationResults.text,
      schema: z.object({
        queries: z.array(z.string()),
      }),
    });

    logger.log("Evaluation results object", {
      evaluationResultsObject: evaluationResultsObject.object,
    });

    return {
      queries: evaluationResultsObject.object.queries.filter(
        (query) =>  query.length > 0
      ),
    };
  },
});
