import { tool } from "ai";
import { z } from "zod";
import { nanoid } from "@/lib/nanoid";
import { deepResearch } from "@/trigger/deep-research";
import { auth } from "@trigger.dev/sdk/v3";

export const startDeepResearchTool = tool({
  description: "Start a deep research on a topic",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "The query to search for. Should include the most important information to find.",
      ),
    clarification: z
      .string()
      .describe(
        "Clarify the query if needed. Can be multiple sentences. This will be used to refine the query. This is like more context for the query.",
      ),
  }),
  execute: async ({ query, clarification }) => {
    const id = nanoid();
    await deepResearch.trigger(
      {
        originalQuery: query,
        clarification,
      },
      {
        tags: [id],
      },
    );

    const publicToken = await auth.createPublicToken({
      scopes: {
        read: {
          tags: [id],
        },
      },
      expirationTime: "7d",
    });

    return {
      id,
      token: publicToken,
    };
  },
});
