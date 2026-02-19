"use client";

import CanvasShell from "@/components/editor/canvas/CanvasShell";
import { ReactFlowProvider } from "reactflow";

export default function WorkflowEditorClient({
  workflowId,
}: {
  workflowId: string | null;
}) {
  return (
    <div className="flex h-screen w-screen bg-[#0E0E13]">
      <ReactFlowProvider>
        <CanvasShell workflowId={workflowId} />
      </ReactFlowProvider>
    </div>
  );
}
