"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Research } from "@/components/research";
import type { UIMessage } from "ai";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion, AnimatePresence } from "motion/react";

export default function ResearchPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [token, setToken] = useState<string>("");

  // Load messages from localStorage and token from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem("chat_messages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }

    const savedToken = localStorage.getItem(`dr_${id}`);
    if (savedToken) {
      setToken(savedToken);
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-terminal-bg font-mono text-terminal-primary flex flex-col">
      {/* Terminal Header - Made Sticky */}
      <div className="sticky top-0 z-50 border-b border-terminal-border bg-terminal-bg/95 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-terminal-error"></div>
              <div className="w-3 h-3 rounded-full bg-terminal-warning"></div>
              <div className="w-3 h-3 rounded-full bg-terminal-success"></div>
            </div>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-terminal-primary-soft text-sm hover:text-terminal-primary transition-colors duration-200"
            >
              ← DEEP-RESEARCH-TERMINAL v1.0.0
            </button>
            <div className="text-terminal-muted text-sm">Research: {id}</div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Welcome Message */}
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.7, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-terminal-primary opacity-70"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-xs mb-2"
                >
                  Loading research session...
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="text-xs mb-4"
                >
                  Research ID: {id}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Messages */}
          <AnimatePresence>
            {messages.map((message, messageIndex) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{
                  duration: 0.5,
                  delay: messageIndex * 0.1,
                  ease: "easeOut",
                }}
                className="space-y-3"
              >
                {/* Role Indicator */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: messageIndex * 0.1 + 0.2,
                    duration: 0.3,
                  }}
                  className="text-xs text-terminal-secondary"
                >
                  {message.role === "user" ? "> USER:" : "> ASSISTANT:"}
                </motion.div>

                {/* Message Content */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: messageIndex * 0.1 + 0.4,
                    duration: 0.4,
                  }}
                  className="pl-6 border-l-2 border-terminal-border"
                >
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <div
                            key={`${message.id}-${i}`}
                            className="whitespace-pre-wrap text-terminal-primary-soft leading-relaxed"
                          >
                            {part.text}
                          </div>
                        );
                      case "tool-startDeepResearch":
                        switch (part.state) {
                          case "output-available":
                            return (
                              <div key={`${message.id}-${i}`} className="mb-4">
                                <Research
                                  id={
                                    (
                                      part.output as {
                                        id: string;
                                        token: string;
                                      }
                                    ).id
                                  }
                                  token={
                                    (
                                      part.output as {
                                        id: string;
                                        token: string;
                                      }
                                    ).token
                                  }
                                />
                              </div>
                            );
                          case "output-error":
                            return (
                              <div key={`${message.id}-${i}`}>
                                Error: {part.errorText}
                              </div>
                            );
                          default:
                            return null;
                        }
                    }
                  })}
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Show live research if we have token but no messages with this research */}
          {token &&
            !messages.some((msg) =>
              msg.parts.some(
                (part) =>
                  part.type === "tool-startDeepResearch" &&
                  part.state === "output-available" &&
                  "output" in part &&
                  (part.output as { id?: string })?.id === id,
              ),
            ) && (
              <div className="mb-4">
                <Research id={id} token={token} />
              </div>
            )}
        </div>

        {/* Status Bar */}
        <div className="sticky bottom-0 border-t border-terminal-border bg-terminal-bg/95 backdrop-blur-sm p-6">
          <div className="flex justify-between items-center text-xs text-terminal-secondary">
            <div className="flex items-center gap-4">
              <div>STATUS: VIEWING RESEARCH SESSION</div>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="px-3 py-1 border border-terminal-border bg-terminal-bg hover:bg-terminal-primary/5 hover:border-terminal-primary/30 text-terminal-primary-soft hover:text-terminal-primary transition-colors duration-200"
              >
                NEW RESEARCH
              </button>
            </div>
            <div>RESEARCH ID: {id}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
