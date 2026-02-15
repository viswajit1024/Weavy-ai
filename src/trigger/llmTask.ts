import { task } from '@trigger.dev/sdk/v3';
import { GoogleGenerativeAI, type Part } from '@google/generative-ai';

interface LLMPayload {
  model: string;
  systemPrompt: string;
  userMessage: string;
  images: string[];
}

export const llmTask = task({
  id: 'llm-gemini',
  maxDuration: 120, // 2 minutes
  run: async (payload: LLMPayload) => {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY environment variable is not set');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: payload.model || 'gemini-1.5-flash',
    });

    // Build the content parts
    const parts: Part[] = [];

    // Add system prompt if provided
    if (payload.systemPrompt) {
      parts.push({ text: `System Instructions: ${payload.systemPrompt}\n\n` });
    }

    // Add user message
    parts.push({ text: payload.userMessage || '' });

    // Add images if provided (as URLs, convert to inline data)
    if (payload.images && payload.images.length > 0) {
      for (const imageUrl of payload.images) {
        try {
          const response = await fetch(imageUrl);
          const buffer = await response.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const mimeType = response.headers.get('content-type') || 'image/jpeg';

          parts.push({
            inlineData: {
              data: base64,
              mimeType,
            },
          });
        } catch (error) {
          console.error(`Failed to fetch image: ${imageUrl}`, error);
        }
      }
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    const output = response.text();

    return { output };
  },
});
