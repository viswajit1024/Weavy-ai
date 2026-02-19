import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExecuteLLMSchema } from "@/lib/validators/workflowEditor";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const parsed = ExecuteLLMSchema.parse(body);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { success: false, error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: parsed.model });

  const parts = parsed.inputs.map((input) =>
    input.type === "text"
      ? { text: input.value }
      : {
          inlineData: {
            data: input.data,
            mimeType: input.mimeType,
          },
        }
  );

  if (parsed.systemPrompt) {
    parts.unshift({ text: parsed.systemPrompt });
  }

  // STREAMING RESPONSE
  const stream = await model.generateContentStream(parts);

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream.stream) {
          const text = chunk.text();

          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
