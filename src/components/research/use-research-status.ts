import React from "react";
import type { StatusState } from "./status-display";
import type { SearchResult } from "@/trigger/search";

interface Query {
  query: string;
  results: SearchResult[];
}

interface UseResearchStatusProps {
  queries: Query[];
  isAnswering: boolean;
}

export function useResearchStatus({ queries, isAnswering }: UseResearchStatusProps) {
  const [currentStatus, setCurrentStatus] = React.useState<StatusState>({
    type: "planning",
  });

  // Get all available results
  const allResults = React.useMemo(() => {
    const results: Array<{ title: string; url: string; favicon?: string }> = [];
    queries.forEach(q => {
      q.results.forEach(result => {
        if (result.title) {
          results.push({
            title: result.title,
            url: result.url,
            favicon: result.favicon ?? undefined,
          });
        }
      });
    });
    return results;
  }, [queries]);

  // Use a ref to store the latest results to avoid stale closures
  const allResultsRef = React.useRef(allResults);
  allResultsRef.current = allResults;

  // Use refs to store current state and avoid dependency issues
  const isAnsweringRef = React.useRef(isAnswering);
  isAnsweringRef.current = isAnswering;

  // Status cycling logic - minimal dependencies
  React.useEffect(() => {
    const updateStatus = () => {
      if (isAnsweringRef.current) {
        return; // Don't update status when answering
      }

      const currentResults = allResultsRef.current;
      
      if (currentResults.length === 0) {
        setCurrentStatus({ type: "planning" });
        return;
      }

      // Pick random result
      const randomResult = currentResults[Math.floor(Math.random() * currentResults.length)];
      setCurrentStatus({
        type: "reading",
        title: randomResult.title,
        url: randomResult.url,
        favicon: randomResult.favicon,
      });
    };

    // Initial update
    updateStatus();

    // Set up interval
    const interval = setInterval(updateStatus, 3000);

    return () => clearInterval(interval);
  }, []); // No dependencies - use refs for current values

  return currentStatus;
}