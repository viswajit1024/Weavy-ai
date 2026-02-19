"use client";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import PromptNode from "../nodes/PromptNode";
import ImageNode from "../nodes/ImageNode";
import RunLLMNode from "../nodes/RunLLMNode";
import UploadVideoNode from "../nodes/UploadVideoNode";
import CropImageNode from "../nodes/CropImageNode";
import ExtractFrameNode from "../nodes/ExtractFrameNode";
import { useFlowStore } from "@/lib/store/flowStore";
import { useHistoryStore } from "@/lib/store/historyStore";
import { collectLLMInputs } from "@/lib/graph/collectLLMInputs";
import LLMSidebar from "../sidebar/LLMSidebar";
import EditorSidebar from "../sidebar/EditorSidebar";
import { DotLoader } from "react-spinners";
import { History, Clock, CheckCircle, XCircle, Loader2, ChevronDown, ChevronRight } from "lucide-react";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

const nodeTypes = {
  prompt: PromptNode,
  image: ImageNode,
  llm: RunLLMNode,
  uploadVideo: UploadVideoNode,
  cropImage: CropImageNode,
  extractFrame: ExtractFrameNode,
};

const INITIAL_NODES: Node[] = [
  { id: "prompt-1", type: "prompt", position: { x: 150, y: 150 }, data: {} },
  { id: "image-1", type: "image", position: { x: 150, y: 350 }, data: {} },
  { id: "llm-1", type: "llm", position: { x: 500, y: 250 }, data: {} },
];

export default function CanvasShell({
  workflowId: initialWorkflowId,
}: {
  workflowId: string | null;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [workflowName, setWorkflowName] = useState("Untitled workflow");
  const [workflowId, setWorkflowId] = useState<string | null>(initialWorkflowId);

  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<null | { type: "info" | "error"; text: string }>(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showWorkflowName, setShowWorkflowName] = useState<boolean>(true);
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showHistory, setShowHistory] = useState(true);
  const [runHistory, setRunHistory] = useState<
    { id: string; nodeId: string; status: "running" | "completed" | "failed"; startedAt: string; error?: string }[]
  >([]);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();

  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);
  const isHydrating = useRef(true);
  const lastSnapshot = useRef<string>("");

  const registerAddNode = useFlowStore((s) => s.registerAddNode);
  const { push, undo, redo } = useHistoryStore();

  // Auto clear notices after a short delay
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  /* ---------------- Hydration ---------------- */
  useEffect(() => {
    async function hydrate() {
      setIsLoading(true);
      try {
        if (!initialWorkflowId) {
          setNodes(INITIAL_NODES);
          setEdges([]);
          isHydrating.current = false;
          return;
        }

        const res = await fetch(`/api/workflow/load/${initialWorkflowId}`);
        if (!res.ok) throw new Error(`Failed to load workflow (${res.status})`);
        const json = await res.json();

        if (json.success) {
          setNodes(json.workflow.nodes);
          setEdges(json.workflow.edges);
          setWorkflowId(json.workflow.id);
          setWorkflowName(json.workflow.name || "Untitled workflow");
        } else {
          setNotice({ type: "error", text: json.error || "Failed to load workflow" });
        }
      } catch (err: any) {
        console.error("Hydrate error", err);
        setNotice({ type: "error", text: err?.message || "Failed to load workflow" });
      } finally {
        isHydrating.current = false;
        setIsLoading(false);
      }
    }

    hydrate();
  }, [initialWorkflowId]);

  /* ---------------- Sidebar → Canvas ---------------- */
  useEffect(() => {
    registerAddNode((node) => {
      setNodes((nds) => [...nds, node]);
    });
  }, [registerAddNode, setNodes]);

  /* ---------------- History ---------------- */
  useEffect(() => {
    if (isHydrating.current) return;

    const snapshot = JSON.stringify({ nodes, edges });
    if (snapshot !== lastSnapshot.current) {
      const cloned = JSON.parse(JSON.stringify({ nodes, edges }));
      push(cloned);
      lastSnapshot.current = snapshot;
    }
  }, [nodes, edges, push]);

  /* ---------------- LLM Execution ---------------- */
  const handleRunLLM = useCallback(
    async (e: Event) => {
      const event = e as CustomEvent<{ nodeId: string }>;
      const { nodeId } = event.detail;

      const node = nodes.find((n) => n.id === nodeId);

      if (!node || node.type !== "llm") {
        console.warn("LLM node not found");
        setNotice({ type: "error", text: "LLM node not found" });
        return;
      }

      const { inputs, systemPrompt } = collectLLMInputs(nodeId, nodes, edges);

      if (!inputs.length) {
        setNotice({ type: "error", text: "No inputs connected to LLM node" });
        window.dispatchEvent(
          new CustomEvent("llm-run-end", {
            detail: { nodeId, success: false, error: "No inputs connected to LLM node" },
          })
        );
        return;
      }
      const hasText = inputs.some((item) => item.type === "text");

      if (!hasText) {
        setNotice({ type: "error", text: "Message Prompt is Required" });
        window.dispatchEvent(
          new CustomEvent("llm-run-end", {
            detail: { nodeId, success: false, error: "Message Prompt is Required" },
          })
        );
        return;
      }

      setIsLoading(true);
      setNotice({ type: "info", text: "Running LLM..." });

      try {
        window.dispatchEvent(new CustomEvent("llm-run-start", { detail: { nodeId } }));

        const res = await fetch("/api/llm/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: node.data?.model ?? "gemini-2.5-flash",
            temperature: node.data?.temperature ?? 0.6,
            thinking: node.data?.thinking ?? false,
            systemPrompt: systemPrompt ?? "You are a helpful AI",
            inputs,
          }),
        });

        if (!res.ok) throw new Error(`LLM request failed (${res.status})`);
        if (!res.body) throw new Error("No response body from LLM");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          accumulated += decoder.decode(value, { stream: true });

          setNodes((nds) =>
            nds.map((n) =>
              n.id === nodeId ? { ...n, data: { ...n.data, output: accumulated } } : n
            )
          );
        }

        setNotice({ type: "info", text: "LLM run complete" });
        window.dispatchEvent(new CustomEvent("llm-run-end", { detail: { nodeId, success: true } }));
      } catch (err: any) {
        console.error("LLM run error", err);
        setNotice({ type: "error", text: err?.message || "LLM run failed" });
        window.dispatchEvent(
          new CustomEvent("llm-run-end", {
            detail: { nodeId, success: false, error: err?.message },
          })
        );
      } finally {
        setIsLoading(false);
      }
    },
    [nodes, edges, setNodes]
  );

  useEffect(() => {
    window.addEventListener("run-llm-node", handleRunLLM);
    return () => window.removeEventListener("run-llm-node", handleRunLLM);
  }, [handleRunLLM]);

  /* ---------------- Run History Tracking ---------------- */
  useEffect(() => {
    const onStart = (e: Event) => {
      const { nodeId } = (e as CustomEvent<{ nodeId: string }>).detail;
      const runId = `${nodeId}-${Date.now()}`;
      setRunHistory((prev) => [
        { id: runId, nodeId, status: "running", startedAt: new Date().toISOString() },
        ...prev,
      ]);
    };

    const onEnd = (e: Event) => {
      const { nodeId, success, error } = (e as CustomEvent<{ nodeId: string; success: boolean; error?: string }>).detail;
      setRunHistory((prev) => {
        const idx = prev.findIndex((r) => r.nodeId === nodeId && r.status === "running");
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], status: success ? "completed" : "failed", error };
        return updated;
      });
    };

    window.addEventListener("llm-run-start", onStart);
    window.addEventListener("llm-run-end", onEnd);
    return () => {
      window.removeEventListener("llm-run-start", onStart);
      window.removeEventListener("llm-run-end", onEnd);
    };
  }, []);

  /* ---------------- Autosave ---------------- */
  useEffect(() => {
    if (isHydrating.current) return;
    if (!nodes.length) return;

    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
    }

    autosaveTimer.current = setTimeout(() => {
      saveWorkflow();
    }, 1000);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [nodes, edges, workflowName]);

  const saveWorkflow = useCallback(async () => {
    setSaveStatus("saving");

    try {
      const res = await fetch("/api/workflow/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: workflowId,
          name: workflowName,
          nodes,
          edges,
        }),
      });

      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Save failed");

      if (!workflowId) {
        setWorkflowId(json.workflow.id);
        window.history.replaceState({}, "", `/workflow/${json.workflow.id}`);
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
    } catch (err: any) {
      console.error("Save failed", err);
      setSaveStatus("error");
    }
  }, [nodes, edges, workflowId, workflowName]);

  /* ---------------- select Node ---------------- */
  const updateSelectedNodeData = useCallback(
    (patch: any) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === selectedNodeId ? { ...n, data: { ...n.data, ...patch } } : n))
      );
    },
    [selectedNodeId, setNodes]
  );

  /* ---------------- edge validation ---------------- */
  const isValidConnection = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) return false;

      // Prevent self-connection
      if (connection.source === connection.target) return false;

      const srcType = sourceNode.type ?? "";
      const tgtType = targetNode.type ?? "";
      const targetHandle = connection.targetHandle ?? "";

      // ─── Image node connections ───
      // image -> llm (only to "image" handle)
      if (srcType === "image" && tgtType === "llm") {
        return targetHandle === "image" || targetHandle === "";
      }
      // image -> cropImage (to "image_url" handle or any)
      if (srcType === "image" && tgtType === "cropImage") {
        return targetHandle === "image_url" || targetHandle === "";
      }
      // image -> prompt: disallow
      if (srcType === "image" && tgtType === "prompt") return false;

      // ─── Video node connections ───
      // uploadVideo -> extractFrame (to "video_url" handle or any)
      if (srcType === "uploadVideo" && tgtType === "extractFrame") {
        return targetHandle === "video_url" || targetHandle === "";
      }
      // uploadVideo -> llm: disallow (no sense)
      if (srcType === "uploadVideo" && tgtType === "llm") return false;

      // ─── CropImage output connections ───
      // cropImage -> llm (to "image" handle)
      if (srcType === "cropImage" && tgtType === "llm") {
        return targetHandle === "image" || targetHandle === "";
      }

      // ─── ExtractFrame output connections ───
      // extractFrame -> llm (to "image" handle — it outputs a frame image)
      if (srcType === "extractFrame" && tgtType === "llm") {
        return targetHandle === "image" || targetHandle === "";
      }

      // ─── Prompt connections ───
      // prompt -> llm (to "text" or "system", not "image")
      if (srcType === "prompt" && tgtType === "llm") {
        return targetHandle !== "image";
      }
      // prompt -> cropImage (to param handles)
      if (srcType === "prompt" && tgtType === "cropImage") {
        return ["x_percent", "y_percent", "width_percent", "height_percent"].includes(targetHandle);
      }
      // prompt -> extractFrame (to timestamp handle)
      if (srcType === "prompt" && tgtType === "extractFrame") {
        return targetHandle === "timestamp";
      }

      // ─── LLM output connections ───
      // llm -> llm (text to text/system)
      if (srcType === "llm" && tgtType === "llm") {
        return targetHandle !== "image";
      }

      // By default, allow the connection if source has a source handle and target has a target handle
      return true;
    },
    [nodes]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      const type = e.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const bounds = reactFlowWrapper.current!.getBoundingClientRect();
      const position = project({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      });

      setNodes((nds) => [
        ...nds,
        {
          id: `${type}-${Date.now()}`,
          type,
          position,
          data: {},
        },
      ]);
    },
    [project, setNodes]
  );

  const handleNodeClick = useCallback((_: any, node: Node) => {
    if (node.type === "llm") setSelectedNodeId(node.id);
    else setSelectedNodeId(null);
  }, []);

  const handleConnect = useCallback(
    (connection: Connection) => {
      const targetHandle = connection.targetHandle ?? "";

      // Determine edge color and label based on target handle
      let edgeColor = "#94A3B8";
      let label = "";

      switch (targetHandle) {
        case "text":
          edgeColor = "#A855F7";
          label = "Prompt";
          break;
        case "image":
          edgeColor = "#22C55E";
          label = "Image";
          break;
        case "system":
          edgeColor = "#F59E0B";
          label = "System";
          break;
        case "image_url":
          edgeColor = "#22C55E";
          label = "Image";
          break;
        case "video_url":
          edgeColor = "#8B5CF6";
          label = "Video";
          break;
        case "timestamp":
          edgeColor = "#F97316";
          label = "Timestamp";
          break;
        case "x_percent":
        case "y_percent":
        case "width_percent":
        case "height_percent":
          edgeColor = "#F97316";
          label = targetHandle.replace("_percent", " %");
          break;
        default:
          edgeColor = "#94A3B8";
          label = "";
      }

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            label,
            style: { stroke: edgeColor, strokeWidth: 2 },
            labelStyle: { fill: "#fff", fontSize: 12 },
            labelBgStyle: { fill: "#212126" },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const handlePaneClick = useCallback(() => setSelectedNodeId(null), []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const ctrl = navigator.platform.includes("Mac") ? e.metaKey : e.ctrlKey;

      if (ctrl && e.key === "z") {
        e.preventDefault();
        const snapshot = (e as any).shiftKey ? redo() : undo();
        if (snapshot) {
          setNodes(snapshot.nodes);
          setEdges(snapshot.edges);
        }
      }
    },
    [undo, redo]
  );

  if (isHydrating.current) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <DotLoader
          color="#ffffff"
          loading={true}
          cssOverride={override}
          size={80}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
  }

  return (
    <main className="flex flex-1 bg-[#0E0E13]" tabIndex={0} onKeyDown={handleKeyDown}>
      <EditorSidebar name={workflowName} showName={setShowWorkflowName} />

      <div className="flex-1 relative">
        {showWorkflowName && (
          <div className="absolute top-3 left-4 z-50">
            <input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="
            bg-[#212126]
            border border-transparent
            hover:border-white/20
            focus:border-white/10
            rounded-md
            px-6 py-2
            text-sm
            text-white
            focus:outline-none
            max-w-[260px]
          "
            />
          </div>
        )}

        <div className="absolute top-3 right-4 z-50 flex items-center gap-3">
          <span className="text-xs text-white/70">
            {saveStatus === "saving" && "Saving…"}
            {saveStatus === "saved" && "Saved"}
            {saveStatus === "error" && "Save failed"}
          </span>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-lg transition-colors ${
              showHistory
                ? "text-cyan-400 bg-cyan-500/10"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
            title="Toggle History"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={saveWorkflow}
            className="rounded-md bg-cyan-500/90 hover:bg-cyan-400 text-black px-4 py-2 text-sm font-medium"
          >
            Save
          </button>
        </div>

        {(isHydrating.current || isLoading || notice) && (
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-50">
            {isHydrating.current || isLoading ? (
              <div className="rounded-md bg-black/60 text-white px-3 py-1 text-sm">Loading…</div>
            ) : null}

            {notice ? (
              <div
                className={`mt-2 rounded-md px-3 py-1 text-sm ${
                  notice.type === "error" ? "bg-red-700 text-white" : "bg-emerald-700 text-white"
                }`}
              >
                {notice.text}
              </div>
            ) : null}
          </div>
        )}

        {/* For Drag and Drop from side nav */}
        <div
          ref={reactFlowWrapper}
          className="flex-1 h-full"
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
          }}
          onDrop={handleDrop}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={handleNodeClick}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            deleteKeyCode={["Backspace", "Delete"]}
            onPaneClick={handlePaneClick}
            isValidConnection={isValidConnection}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1.3} color="#44424A" />
            <Controls />
            <MiniMap
              maskColor="rgba(0,0,0,0.6)"
              nodeColor={() => "#1f2937"}
              className="rounded-lg border border-white/10"
            />
          </ReactFlow>
        </div>
      </div>

      {selectedNode && selectedNode.type === "llm" && (
        <LLMSidebar
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onUpdate={updateSelectedNodeData}
          onRun={() =>
            window.dispatchEvent(
              new CustomEvent("run-llm-node", {
                detail: { nodeId: selectedNode.id },
              })
            )
          }
        />
      )}

      {/* Right Sidebar - History Panel */}
      {showHistory && (
        <div className="w-72 border-l border-white/10 bg-[#111116] flex flex-col shrink-0">
          {/* Header */}
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/50" />
              <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                Run History
              </span>
            </div>
          </div>

          {/* Runs List */}
          <div className="flex-1 overflow-y-auto">
            {runHistory.length === 0 ? (
              <div className="p-4 text-center">
                <Clock className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-xs text-white/30">No runs yet</p>
                <p className="text-xs text-white/20 mt-1">
                  Run an LLM node to see history here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {runHistory.map((run) => {
                  const node = nodes.find((n) => n.id === run.nodeId);
                  const label = node?.data?.model || run.nodeId;
                  return (
                    <div key={run.id} className="hover:bg-white/5 transition-colors">
                      <button
                        className="w-full p-3 text-left flex items-center gap-2"
                        onClick={() =>
                          setExpandedRunId(expandedRunId === run.id ? null : run.id)
                        }
                      >
                        {expandedRunId === run.id ? (
                          <ChevronDown className="w-3.5 h-3.5 text-white/40 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-white/40 shrink-0" />
                        )}
                        {run.status === "running" && (
                          <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                        )}
                        {run.status === "completed" && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                        {run.status === "failed" && (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-white truncate">
                              {label}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                run.status === "completed"
                                  ? "text-green-400 bg-green-500/10"
                                  : run.status === "failed"
                                  ? "text-red-400 bg-red-500/10"
                                  : "text-yellow-400 bg-yellow-500/10"
                              }`}
                            >
                              {run.status}
                            </span>
                          </div>
                          <span className="text-[10px] text-white/30 mt-0.5 block">
                            {new Date(run.startedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </button>

                      {expandedRunId === run.id && (
                        <div className="px-3 pb-3">
                          <div className="bg-white/5 border border-white/10 rounded-lg p-2">
                            <div className="text-[10px] text-white/50">
                              <p><span className="text-white/30">Node:</span> {run.nodeId}</p>
                              <p><span className="text-white/30">Started:</span> {new Date(run.startedAt).toLocaleString()}</p>
                              {run.error && (
                                <p className="text-red-400 mt-1">{run.error}</p>
                              )}
                              {run.status === "completed" && node?.data?.output && (
                                <div className="mt-1.5 text-white/40 bg-black/30 rounded p-1.5 max-h-24 overflow-y-auto break-all">
                                  {typeof node.data.output === "string"
                                    ? node.data.output.slice(0, 300)
                                    : JSON.stringify(node.data.output, null, 2).slice(0, 300)}
                                  {(node.data.output?.length || 0) > 300 && "…"}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
