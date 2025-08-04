import { motion } from "motion/react";

type StatusState = 
  | { type: "planning" }
  | { type: "reading"; title: string; url: string; favicon?: string };

interface StatusDisplayProps {
  status: StatusState;
}

export function StatusDisplay({ status }: StatusDisplayProps) {
  const getStatusText = (status: StatusState) => {
    switch (status.type) {
      case "planning":
        return {
          status: "PLANNING",
          message: "Generating research queries...",
          indicator: "●",
        };
      case "reading":
        return {
          status: "READING",
          message: status.title,
          indicator: "◑",
        };
    }
  };

  const config = getStatusText(status);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="px-4 py-3"
    >
      <div className="flex items-center gap-3">
        <motion.span 
          className="text-terminal-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          {config.indicator}
        </motion.span>
        <motion.span 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-terminal-primary-soft"
        >
          [{config.status}]
        </motion.span>
        <motion.span 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="text-terminal-primary truncate"
        >
          {config.message}
        </motion.span>
      </div>
    </motion.div>
  );
}

export type { StatusState };