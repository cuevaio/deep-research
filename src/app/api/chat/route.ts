import { openai } from "@ai-sdk/openai";
import {
  streamText,
  convertToModelMessages,
  type UIMessage,
  stepCountIs,
} from "ai";
import { systemPrompt } from "./prompt";
import { startDeepResearchTool } from "./start-deep-research-tool";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    system: `${systemPrompt}

Today's date: ${new Date().toISOString()}`,
    tools: {
      startDeepResearch: startDeepResearchTool,
    },
  });

  return result.toUIMessageStreamResponse();
}
