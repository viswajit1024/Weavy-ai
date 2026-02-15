import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// ID Generators
// ============================================================================

let nodeIdCounter = 0;

export function generateNodeId(): string {
  return `node_${Date.now()}_${++nodeIdCounter}`;
}

export function generateEdgeId(
  source: string,
  target: string,
  sourceHandle?: string,
  targetHandle?: string
): string {
  return `e_${source}_${sourceHandle || 's'}_${target}_${targetHandle || 't'}`;
}

// ============================================================================
// DAG Validation
// ============================================================================

export function isValidDAG(
  nodes: { id: string }[],
  edges: { source: string; target: string }[]
): boolean {
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of nodes) {
    adjacency.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }

  const queue: string[] = [];
  for (const [nodeId, degree] of inDegree) {
    if (degree === 0) queue.push(nodeId);
  }

  let visited = 0;
  while (queue.length > 0) {
    const current = queue.shift()!;
    visited++;
    for (const neighbor of adjacency.get(current) || []) {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  return visited === nodes.length;
}

export function getExecutionOrder(
  nodes: { id: string }[],
  edges: { source: string; target: string }[]
): string[] {
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of nodes) {
    adjacency.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }

  const queue: string[] = [];
  for (const [nodeId, degree] of inDegree) {
    if (degree === 0) queue.push(nodeId);
  }

  const order: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);
    for (const neighbor of adjacency.get(current) || []) {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  return order;
}

/**
 * Groups nodes into topological levels for parallel execution.
 * All nodes within a level are independent and can run concurrently.
 */
export function getExecutionLevels(
  nodes: { id: string }[],
  edges: { source: string; target: string }[]
): string[][] {
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of nodes) {
    adjacency.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }

  let queue: string[] = [];
  for (const [nodeId, degree] of inDegree) {
    if (degree === 0) queue.push(nodeId);
  }

  const levels: string[][] = [];
  while (queue.length > 0) {
    levels.push([...queue]);
    const nextQueue: string[] = [];
    for (const current of queue) {
      for (const neighbor of adjacency.get(current) || []) {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) nextQueue.push(neighbor);
      }
    }
    queue = nextQueue;
  }

  return levels;
}

// ============================================================================
// Connection Validation
// ============================================================================

const OUTPUT_TYPES: Record<string, Record<string, string>> = {
  text: { output: 'text' },
  uploadImage: { output: 'image' },
  uploadVideo: { output: 'video' },
  llm: { output: 'text' },
  cropImage: { output: 'image' },
  extractFrame: { output: 'image' },
};

const INPUT_TYPES: Record<string, Record<string, string>> = {
  llm: {
    system_prompt: 'text',
    user_message: 'text',
    images: 'image',
  },
  cropImage: {
    image_url: 'image',
    x_percent: 'text',
    y_percent: 'text',
    width_percent: 'text',
    height_percent: 'text',
  },
  extractFrame: {
    video_url: 'video',
    timestamp: 'text',
  },
};

export function validateConnection(
  sourceType: string,
  sourceHandle: string,
  targetType: string,
  targetHandle: string
): boolean {
  const outputType = OUTPUT_TYPES[sourceType]?.[sourceHandle];
  const inputType = INPUT_TYPES[targetType]?.[targetHandle];

  if (!outputType || !inputType) return false;

  // text can connect to text inputs
  if (outputType === 'text' && inputType === 'text') return true;
  // image can connect to image inputs
  if (outputType === 'image' && inputType === 'image') return true;
  // video can connect to video inputs
  if (outputType === 'video' && inputType === 'video') return true;

  return false;
}

// ============================================================================
// Workflow Export/Import
// ============================================================================

export function exportWorkflowJSON(workflow: unknown): string {
  return JSON.stringify(workflow, null, 2);
}

export function importWorkflowJSON(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    throw new Error('Invalid JSON format');
  }
}

// ============================================================================
// Auto Layout
// ============================================================================

export function getAutoLayoutPosition(existingNodes: { position: { x: number; y: number } }[]): { x: number; y: number } {
  if (existingNodes.length === 0) return { x: 250, y: 100 };
  
  const maxY = Math.max(...existingNodes.map(n => n.position.y));
  const avgX = existingNodes.reduce((sum, n) => sum + n.position.x, 0) / existingNodes.length;
  
  return { x: avgX + 50, y: maxY + 200 };
}

export function formatTimestamp(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
