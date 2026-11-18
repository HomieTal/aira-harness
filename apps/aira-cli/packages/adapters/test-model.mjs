import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

const client = createAnthropic({
  apiKey: process.env.AIRA_API_KEY,
  baseURL: "https://bigmodel.aira.invalid/api/coding/paas/v4",
});

const result = await generateText({
  model: client("glm-4"),
  prompt: "say hello in 3 words",
});

console.log("Result:", result);
