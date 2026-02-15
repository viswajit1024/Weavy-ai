import { z } from 'zod';

// ─── Workflow Schemas ───────────────────────────────────────

export const createWorkflowSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nodes: z.array(z.record(z.string(), z.unknown())).default([]),
  edges: z.array(z.record(z.string(), z.unknown())).default([]),
});

export const updateWorkflowSchema = z.object({
  id: z.string().min(1, 'Workflow ID is required'),
  name: z.string().min(1).max(100).optional(),
  nodes: z.array(z.record(z.string(), z.unknown())).optional(),
  edges: z.array(z.record(z.string(), z.unknown())).optional(),
});

// ─── Trigger Schemas ────────────────────────────────────────

export const triggerTaskSchema = z.object({
  taskType: z.enum(['llm', 'crop-image', 'extract-frame']),
  payload: z.record(z.string(), z.unknown()),
});

// ─── Execute Schemas ────────────────────────────────────────

export const executeWorkflowSchema = z.object({
  workflowId: z.string().optional(),
  nodes: z.array(z.record(z.string(), z.unknown())).min(1, 'At least one node is required'),
  edges: z.array(z.record(z.string(), z.unknown())),
});

// ─── API Key Schemas ────────────────────────────────────────

export const upsertApiKeySchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  apiKey: z.string().min(1, 'API key is required'),
});

export const deleteApiKeySchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
});

// ─── Helpers ────────────────────────────────────────────────

/**
 * Parse and validate request body with a Zod schema.
 * Returns { success: true, data } or { success: false, error }.
 */
export function parseBody<T>(schema: z.ZodType<T>, body: unknown):
  | { success: true; data: T }
  | { success: false; error: string } {
  const result = schema.safeParse(body);
  if (!result.success) {
    const messages = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    return { success: false, error: messages };
  }
  return { success: true, data: result.data };
}
