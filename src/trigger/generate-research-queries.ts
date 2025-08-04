import { openai } from "@ai-sdk/openai";
import { logger, schemaTask, wait } from "@trigger.dev/sdk/v3";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import { PLANNING_PROMPT } from "@/prompts/planning";
import { PLAN_PARSING_PROMPT } from "@/prompts/plan-parsing";

export const generateResearchQueries = schemaTask({
  id: "generate-research-queries",
  maxDuration: 300,
  schema: z.object({
    originalQuery: z.string(),
    clarification: z.string().optional(),
  }),
  run: async ({ originalQuery, clarification }) => {
    logger.log("Generating research queries", { originalQuery, clarification });

    const planningResponse = await generateText({
      model: openai("o3"),
      system: PLANNING_PROMPT,
      prompt: `
      Original Query: ${originalQuery}
      Clarification: ${clarification || "None"}
      `.trim(),
    });

    logger.log("Planning response", {
      planningResponse: planningResponse.text,
    });

    const planParsingResponse = await generateObject({
      model: openai("gpt-4.1"),
      system: PLAN_PARSING_PROMPT,
      prompt: `
      Plan: ${planningResponse.text}
      `.trim(),
      schema: z.object({
        queries: z.array(z.string()),
      }),
    });

    return {
      queries: planParsingResponse.object.queries,
    };
  },
});
