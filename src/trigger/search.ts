import { batch, logger, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

import { tavily } from "@tavily/core";
import { summarize } from "./summarize";

const tavilyClient = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

export const SearchResultSchema = z.object({
  title: z.string().nullable(),
  url: z.string(),
  summary: z.string(),
  favicon: z.string().nullable(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

export const search = schemaTask({
  id: "search",
  schema: z.object({
    query: z.string(),
  }),
  run: async ({ query }, { ctx }) => {
    logger.log("Searching", { query });

    const searchResults = await tavilyClient.search(query, {
      searchDepth: "basic",
      includeFavicon: true,
    });

    const summaryResults = await batch.triggerByTaskAndWait<
      (typeof summarize)[]
    >(
      searchResults.results.map((result) => ({
        task: summarize,
        payload: {
          query,
          searchResult: result,
        },
        options: {
          tags: ctx.run.tags,
        },
      })),
    );

    const summaries: {
      url: string;
      summary: string;
    }[] = [];

    summaryResults.runs.forEach((run) => {
      if (run.ok) {
        summaries.push(run.output);
      }
    });

    const results: SearchResult[] = [];

    searchResults.results.forEach((result) => {
      const summary = summaries.find((summary) => summary.url === result.url);

      if (summary) {
        results.push({
          ...result,
          summary: summary.summary,
          title: result.title ?? null,
          // @ts-ignore
          favicon: result.favicon ?? null,
        });
      }
    });

    return {
      results,
    };
  },
});


