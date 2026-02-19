"use client";

import { useEffect, useState } from "react";
import WorkflowCard from "./WorkflowCard";

type Workflow = {
  id: string;
  name: string;
  updatedAt: string;
};

export default function WorkflowGrid() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflows();

    window.addEventListener("focus", fetchWorkflows);
    return () => window.removeEventListener("focus", fetchWorkflows);
  }, []);

  async function fetchWorkflows() {
    try {
      setLoading(true);
      const res = await fetch("/api/workflow/list");
      const json = await res.json();

      if (json.success) {
        setWorkflows(json.workflows);
      }
    } catch (err) {
      console.error("Failed to load workflows", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/40">
        Loading workflows…
      </div>
    );
  }

  return (
    <div className="flex-1 px-8 py-6 overflow-y-auto">
      <h2 className="text-sm font-medium text-white/60 mb-4">My files</h2>

      {workflows.length === 0 ? (
        <div className="text-white/40">No workflows yet</div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {workflows.map((wf) => (
            <WorkflowCard key={wf.id} {...wf} onRefresh={fetchWorkflows} />
          ))}
        </div>
      )}
    </div>
  );
}
