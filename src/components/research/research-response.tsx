import React from "react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRealtimeRunWithStreams, useRun } from "@trigger.dev/react-hooks";
import type { answer } from "@/trigger/answer";

interface ResearchResponseProps {
  id: string;
  token: string;
}

export function ResearchResponse({ id, token }: ResearchResponseProps) {
  const { streams } = useRealtimeRunWithStreams<typeof answer>(id, {
    accessToken: token,
  });

  const { run: answerRun, error: answerError } = useRun<typeof answer>(id, {
    accessToken: token,
  });

  const markdown = React.useMemo(
    () => answerRun?.output?.answer ?? streams?.answer?.join("") ?? "",
    [streams, answerRun],
  );

  if (answerError) {
    return (
      <div className="text-terminal-error font-mono text-xs">
        ERROR: {answerError?.message}
      </div>
    );
  }

  if (markdown.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-terminal-primary font-mono text-xs"
      >
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          GENERATING RESPONSE...
        </motion.span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="font-mono text-xs"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-terminal-primary-soft leading-relaxed"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p className="mb-3 text-terminal-primary-soft">{children}</p>
            ),
            h1: ({ children }) => (
              <h1 className="text-terminal-primary font-bold mb-3 border-b border-terminal-border pb-1">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-terminal-primary font-bold mb-2 mt-4">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-terminal-primary font-bold mb-2 mt-3">
                {children}
              </h3>
            ),
            ul: ({ children }) => (
              <ul className="mb-3 space-y-1 ml-4">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-3 space-y-1 ml-4">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-terminal-primary-soft">
                <span className="text-terminal-secondary">• </span>
                {children}
              </li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-terminal-secondary pl-3 my-3 text-terminal-primary">
                {children}
              </blockquote>
            ),
            code: ({ children, className }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className="bg-terminal-primary/10 px-1 text-terminal-primary-soft font-mono">
                    {children}
                  </code>
                );
              }
              return (
                <code className="block bg-terminal-primary/10 p-2 my-2 text-terminal-primary-soft font-mono overflow-x-auto border border-terminal-border">
                  {children}
                </code>
              );
            },
            a: ({ children, href }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-terminal-primary hover:text-terminal-primary-soft underline"
              >
                {children}
              </a>
            ),
            strong: ({ children }) => (
              <strong className="text-terminal-primary-soft font-bold">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="text-terminal-primary italic">{children}</em>
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </motion.div>
    </motion.div>
  );
}
