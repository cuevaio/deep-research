import { motion, AnimatePresence } from "motion/react";
import type { SearchResult } from "@/trigger/search";

interface Query {
  query: string;
  results: SearchResult[];
}

interface ResearchDetailsProps {
  queries: Query[];
}

export function ResearchDetails({ queries }: ResearchDetailsProps) {
  if (queries.length === 0) {
    return (
      <div className="border border-terminal-border bg-terminal-bg">
        <div className="px-3 py-2 bg-terminal-primary/10 border-b border-terminal-border">
          <div className="text-terminal-primary">RESEARCH DETAILS</div>
          <div className="text-terminal-secondary">
            All queries and sources discovered during research
          </div>
        </div>
        <div className="p-3">
          <div className="text-center text-terminal-secondary animate-pulse">
            INITIALIZING RESEARCH QUERIES...
          </div>
        </div>
      </div>
    );
  }

  const totalSources = queries.reduce((acc, q) => acc + q.results.length, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border border-terminal-border bg-terminal-bg"
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="px-3 py-2 bg-terminal-primary/10 border-b border-terminal-border"
      >
        <div className="flex items-center justify-between">
          <div className="text-terminal-primary">RESEARCH DETAILS</div>
          <div className="text-terminal-secondary text-xs">
            QUERIES:{queries.length} SOURCES:{totalSources}
          </div>
        </div>
        <div className="text-terminal-secondary text-xs">
          All queries and sources discovered during research
        </div>
      </motion.div>

      <div className="max-h-80 overflow-y-auto">
        <div className="p-4 space-y-6">
          <AnimatePresence>
            {queries.map((query, index) => (
              <QuerySection 
                key={query.query} 
                query={query} 
                index={index} 
                totalQueries={queries.length}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

interface QuerySectionProps {
  query: Query;
  index: number;
  totalQueries: number;
}

function QuerySection({ query, index, totalQueries }: QuerySectionProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.3,
        ease: "easeOut" 
      }}
      className="space-y-3"
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.3 + 0.2, duration: 0.3 }}
        className="flex items-center gap-2"
      >
        <span className="text-terminal-secondary">[Q{index + 1}]</span>
        <span className="text-terminal-primary-soft">{query.query}</span>
      </motion.div>

      <div className="pl-6 space-y-2">
        {query.results.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.3 + 0.4, duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <span className="text-terminal-secondary">├─</span>
            <motion.span 
              className="text-terminal-secondary"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              SEARCHING...
            </motion.span>
          </motion.div>
        ) : (
          <AnimatePresence>
            {query.results.map((result, resultIndex) => (
              <ResultItem 
                key={result.url} 
                result={result} 
                delay={index * 0.3 + 0.5 + resultIndex * 1.0} // 1 second gap between websites
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {index < totalQueries - 1 && (
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: index * 0.3 + 0.6, duration: 0.4 }}
          className="border-t border-terminal-border/30 my-3" 
        />
      )}
    </motion.div>
  );
}

interface ResultItemProps {
  result: SearchResult;
  delay: number;
}

function ResultItem({ result, delay }: ResultItemProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 30, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -30, scale: 0.9 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
      className="flex items-center gap-2"
    >
      <span className="text-terminal-secondary">├─</span>
      {result.favicon && (
        // biome-ignore lint: External favicon from search results
        <motion.img
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.2, duration: 0.3 }}
          src={result.favicon}
          alt="Site favicon"
          className="w-3 h-3 flex-shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
      <motion.a
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.3, duration: 0.4 }}
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-terminal-primary hover:text-terminal-primary-soft hover:underline truncate flex-1 transition-colors duration-200"
      >
        {result.title ?? result.url}
      </motion.a>
      <motion.span 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.4, duration: 0.3 }}
        className="text-terminal-muted text-xs"
      >
        [{new URL(result.url).hostname}]
      </motion.span>
    </motion.div>
  );
}