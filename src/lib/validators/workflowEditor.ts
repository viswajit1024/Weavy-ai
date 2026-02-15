import { z } from "zod";

export const SaveWorkflowSchema = z.object({
  id: z.string().nullable().optional(),
  name: z.string().min(1),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
});

export type SaveWorkflowInput = z.infer<typeof SaveWorkflowSchema>;

export const ImportWorkflowSchema = z.object({
  name: z.string(),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
});

export const ExecuteLLMSchema = z.object({
  model: z.string(),
  temperature: z.number().min(0).max(2).optional(),
  thinking: z.boolean().optional(),
  systemPrompt: z.string().optional(),
  inputs: z.array(
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("text"),
        value: z.string(),
      }),
      z.object({
        type: z.literal("image"),
        data: z.string(),
        mimeType: z.string(),
      }),
    ])
  ),
});
