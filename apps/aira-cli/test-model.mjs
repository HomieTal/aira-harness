import { createAnthropic } from '@ai-sdk/anthropic';

const client = createAnthropic({
  apiKey: process.env.AIRA_API_KEY,
  baseURL: 'https://bigmodel.aira.invalid/api/anthropic',
});

const result = await client('glm-4.7').generateText({
  prompt: 'say hello in 3 words',
});

console.log('Result:', result);
