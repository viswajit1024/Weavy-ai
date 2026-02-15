import type { Node, Edge } from "reactflow";

export type LLMInput =
  | { type: "text"; value: string }
  | { type: "image"; data: string; mimeType: string };

export function collectLLMInputs(
  llmNodeId: string,
  nodes: Node[],
  edges: Edge[]
): { inputs: LLMInput[]; systemPrompt?: string } {
  if (!llmNodeId || !Array.isArray(nodes) || !Array.isArray(edges)) return { inputs: [] };

  const nodeById = new Map<string, Node>();
  for (const n of nodes) nodeById.set(String(n.id), n);

  // only consider edges that target the LLM node
  const incoming = edges.filter((e) => String(e.target) === String(llmNodeId));
  if (!incoming.length) return { inputs: [] };

  const inputs: LLMInput[] = [];
  let systemPrompt: string | undefined;

  for (const edge of incoming) {
    try {
      const srcId = String(edge.source);
      const sourceNode = nodeById.get(srcId);
      if (!sourceNode) {
        if (process.env.NODE_ENV !== "production")
          console.warn("collectLLMInputs: source node not found", srcId, edge);
        continue;
      }

      const nodeType = String(sourceNode.type || "");
      // When collecting inputs for an LLM node, the edge's targetHandle
      // indicates which handle on the LLM node this connection went to
      // (e.g. 'text', 'system', 'image'). Use that to infer input types.
      const handle = String((edge as any).targetHandle ?? "");

      // If the connection targets the LLM's `system` handle, treat that prompt
      // as the system prompt (take first encountered).
      if (handle === "system" && nodeType === "prompt") {
        const text = sourceNode.data?.text;
        if (typeof text === "string" && text.trim() !== "") {
          if (!systemPrompt) systemPrompt = text;
        }
        continue;
      }

      // Text prompts (connection targets 'text' handle or legacy connections)
      if (nodeType === "prompt" && (handle === "text" || handle === "")) {
        const text = sourceNode.data?.text;
        if (typeof text === "string" && text.trim() !== "") {
          inputs.push({ type: "text", value: text });
        }
        continue;
      }

      if (nodeType === "image" || handle === "image") {
        const base64 = sourceNode.data?.imageBase64;
        const mimeType = sourceNode.data?.mimeType ?? "image/png";
        if (typeof base64 === "string" && base64.length > 0) {
          inputs.push({ type: "image", data: base64, mimeType });
        }
        continue;
      }

      if (nodeType === "llm") {
        const out = sourceNode.data?.output;
        if (typeof out === "string" && out.trim() !== "") {
          inputs.push({ type: "text", value: out });
        }
        continue;
      }

      if (process.env.NODE_ENV !== "production")
        console.warn("collectLLMInputs: unsupported source node type", nodeType, sourceNode);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error("collectLLMInputs error", err);
      continue;
    }
  }

  return { inputs, systemPrompt };
}
