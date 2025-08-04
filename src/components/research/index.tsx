"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRealtimeRunsWithTag } from "@trigger.dev/react-hooks";
import type { deepResearch } from "@/trigger/deep-research";
import type { evaluate } from "@/trigger/evaluate";
import type { generateResearchQueries } from "@/trigger/generate-research-queries";
import type { filterSearchResults } from "@/trigger/filter-search-results";
import type { search, SearchResult } from "@/trigger/search";
import type { answer } from "@/trigger/answer";
import type { summarize } from "@/trigger/summarize";

// Import separated components
import { StatusDisplay } from "./status-display";
import { ResearchDetails } from "./research-details";
import { ResearchResponse } from "./research-response";
import { useResearchStatus } from "./use-research-status";

interface Query {
  query: string;
  results: SearchResult[];
}

interface ResearchData {
  id: string;
  token: string;
  query: string;
  clarification: string;
  timestamp: number;
}

export function Research({ id, token }: { id: string; token: string }) {
  const [researchData, setResearchData] = React.useState<ResearchData | null>(null);

  // Store dr_id: token mapping in localStorage when both are available
  React.useEffect(() => {
    if (id && token) {
      localStorage.setItem(`dr_${id}`, token);
    }
  }, [id, token]);

  // Load research data from localStorage
  React.useEffect(() => {
    const savedResearch = localStorage.getItem(`research_${id}`);
    if (savedResearch) {
      setResearchData(JSON.parse(savedResearch));
    }
  }, [id]);

  const { runs, error } = useRealtimeRunsWithTag<
    | typeof deepResearch
    | typeof generateResearchQueries
    | typeof search
    | typeof summarize
    | typeof evaluate
    | typeof filterSearchResults
    | typeof answer
  >(id, {
    accessToken: token,
    enabled: !!token,
  });

  // Process queries from runs
  const queries = React.useMemo((): Query[] => {
    const queries: Query[] = [];

    // First pass: collect all search queries
    runs.forEach((run) => {
      if (run.taskIdentifier === "search") {
        queries.push({
          query: run.payload.query,
          results: [],
        });
      }
    });

    // Second pass: populate results for completed searches
    runs.forEach((run) => {
      if (
        run.taskIdentifier === "search" &&
        run.status === "COMPLETED" &&
        run.output
      ) {
        const queryObj = queries.find((q) => q.query === run.payload.query);
        if (queryObj) {
          queryObj.results = run.output.results;
        }
      }
    });

    return queries;
  }, [runs]);

  // Check if we're in answering phase
  const isAnswering = React.useMemo(() => {
    return runs.some((run) => run.taskIdentifier === "answer");
  }, [runs]);

  // Get answer run if it exists
  const answerRun = React.useMemo(() => {
    return runs.find((run) => run.taskIdentifier === "answer");
  }, [runs]);

  // Use custom hook for status management
  const currentStatus = useResearchStatus({ queries, isAnswering });

  if (error) {
    return (
      <div className="font-mono text-terminal-error text-xs">
        <div>ERROR: {error.message}</div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-4 font-mono text-xs"
    >
      {/* Research Title and Description */}
      {researchData && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="border border-terminal-border bg-terminal-bg"
        >
          <div className="px-3 py-2 bg-terminal-primary/10 border-b border-terminal-border">
            <div className="text-terminal-primary">RESEARCH PARAMETERS</div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <div className="text-terminal-secondary mb-1">QUERY:</div>
              <div className="text-terminal-primary-soft">{researchData.query}</div>
            </div>
            <div>
              <div className="text-terminal-secondary mb-1">CLARIFICATION:</div>
              <div className="text-terminal-primary-soft">{researchData.clarification}</div>
            </div>
            <div>
              <div className="text-terminal-secondary mb-1">INITIATED:</div>
              <div className="text-terminal-muted">
                {new Date(researchData.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Status Part - only show when NOT answering */}
      <AnimatePresence>
        {!isAnswering && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="border border-terminal-border bg-terminal-bg overflow-hidden"
          >
            <StatusDisplay status={currentStatus} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Part - Always show */}
      <ResearchDetails queries={queries} />

      {/* Answer Section */}
      <AnimatePresence>
        {answerRun && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ 
              duration: 0.6, 
              ease: "easeOut",
              delay: 0.2
            }}
            className="border border-terminal-border bg-terminal-bg"
          >
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="px-3 py-2 bg-terminal-primary/10 border-b border-terminal-border"
            >
              <div className="text-terminal-primary">RESEARCH RESULTS</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="p-4"
            >
              <ResearchResponse id={answerRun.id} token={token} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
