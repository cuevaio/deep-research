"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Research } from "@/components/research";
import { DefaultChatTransport, type UIDataTypes, type UIMessage } from "ai";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion, AnimatePresence } from "motion/react";

interface ResearchData {
  id: string;
  token: string;
  query: string;
  clarification: string;
  timestamp: number;
}

export default function Chat() {
  const [input, setInput] = useState("");
  const [researchHistory, setResearchHistory] = useState<ResearchData[]>([]);
  const router = useRouter();
  
  const { messages, sendMessage } = useChat<
    UIMessage<
      unknown,
      UIDataTypes,
      {
        startDeepResearch: {
          input: {
            query: string;
            clarification: string;
          };
          output: {
            id: string;
            token: string;
          };
        };
      }
    >
  >({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  // Load research history on mount
  useEffect(() => {
    const savedResearch = localStorage.getItem('research_list');
    if (savedResearch) {
      setResearchHistory(JSON.parse(savedResearch));
    }
  }, []);

  // Persist messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Store research data and redirect
  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (latestMessage?.role === "assistant") {
      const researchPart = latestMessage.parts.find(
        (part) => part.type === "tool-startDeepResearch" && part.state === "output-available"
      );
      if (researchPart && 'output' in researchPart && researchPart.output?.id) {
        const output = researchPart.output as { id: string; token: string };
        
        // Extract query and clarification from the tool input
        const toolInput = 'input' in researchPart ? researchPart.input as { query: string; clarification: string } : null;
        
        if (toolInput) {
          const research = {
            id: output.id,
            token: output.token,
            query: toolInput.query,
            clarification: toolInput.clarification,
            timestamp: Date.now()
          };
          
          // Store individual research data
          localStorage.setItem(`research_${output.id}`, JSON.stringify(research));
          
          // Update research list
          const existingResearch: ResearchData[] = JSON.parse(localStorage.getItem('research_list') || '[]');
          const updatedResearch = [research, ...existingResearch.filter((r) => r.id !== output.id)];
          localStorage.setItem('research_list', JSON.stringify(updatedResearch));
          setResearchHistory(updatedResearch);
          
          router.push(`/research/${output.id}`);
        }
      }
    }
  }, [messages, router]);

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
            <div className="text-terminal-primary-soft text-sm">
              DEEP-RESEARCH-TERMINAL v1.0.0
            </div>
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
                  System initialized...
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="text-xs mb-4"
                >
                  Ready for input.
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                  className="text-xs"
                >
                  Type your message below to begin conversation.
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Research History */}
          <AnimatePresence>
            {messages.length === 0 && researchHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="space-y-3"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.3 }}
                  className="text-xs text-terminal-secondary"
                >
                  PREVIOUS RESEARCH SESSIONS:
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6, duration: 0.5 }}
                  className="space-y-2"
                >
                  {researchHistory.slice(0, 5).map((research, index) => (
                    <motion.button
                      key={research.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.8 + index * 0.1, duration: 0.3 }}
                      onClick={() => router.push(`/research/${research.id}`)}
                      className="w-full text-left p-3 border border-terminal-border bg-terminal-bg hover:bg-terminal-primary/5 hover:border-terminal-primary/30 transition-colors duration-200"
                    >
                      <div className="text-xs text-terminal-primary-soft truncate">
                        {research.query}
                      </div>
                      <div className="text-xs text-terminal-muted mt-1 truncate">
                        {new Date(research.timestamp).toLocaleDateString()}
                      </div>
                    </motion.button>
                  ))}
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
                                  id={part.output.id}
                                  token={part.output.token}
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

          {/* Loading Indicator */}
          <AnimatePresence>
            {messages.length > 0 &&
              messages[messages.length - 1]?.role === "user" &&
              !messages.some(
                (m) =>
                  m.role === "assistant" &&
                  m.id === messages[messages.length - 1]?.id,
              ) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="text-terminal-secondary text-xs flex items-center gap-2"
                >
                  <div className="animate-pulse">Processing...</div>
                  <div className="flex gap-1">
                    <motion.div
                      className="w-1 h-1 bg-terminal-secondary rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-1 h-1 bg-terminal-secondary rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0.1,
                      }}
                    />
                    <motion.div
                      className="w-1 h-1 bg-terminal-secondary rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0.2,
                      }}
                    />
                  </div>
                </motion.div>
              )}
          </AnimatePresence>
        </div>

        {/* Input Section - Fixed Styling */}
        <div className="sticky bottom-0 border-t border-terminal-border bg-terminal-bg/95 backdrop-blur-sm p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) {
                sendMessage({ text: input });
                setInput("");
              }
            }}
            className="space-y-3"
          >
            <div className="text-xs text-terminal-secondary">INPUT:</div>
            <div className="flex items-start gap-3 p-3 border border-terminal-border bg-terminal-primary/5 rounded-sm">
              <span className="text-terminal-primary mt-1">$</span>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter command..."
                className="flex-1 bg-transparent border-none outline-none text-terminal-primary-soft placeholder-terminal-muted focus:text-terminal-primary focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[24px] max-h-32 p-0"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim()) {
                      sendMessage({ text: input });
                      setInput("");
                    }
                  }
                }}
              />
              <div className="text-xs text-terminal-muted mt-1">[READY]</div>
            </div>
          </form>

          {/* Status Bar - Moved Inside Input Section */}
          <div className="flex justify-between text-xs text-terminal-secondary mt-2 pt-2 border-t border-terminal-border/30">
            <div>STATUS: CONNECTED</div>
            <div>MSGS: {messages.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
