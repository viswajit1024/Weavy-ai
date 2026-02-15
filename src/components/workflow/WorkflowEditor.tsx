'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflowStore } from '@/stores/workflowStore';
import WorkflowCanvas from './WorkflowCanvas';
import Sidebar from './Sidebar';
import HistoryPanel from './HistoryPanel';
import { Save, Play, Loader2, ArrowLeft, ChevronRight, History, Download, Upload, Sparkles, Undo2, Redo2 } from 'lucide-react';
import { exportWorkflowJSON, importWorkflowJSON } from '@/lib/utils';
import { sampleWorkflowName, sampleNodes, sampleEdges } from '@/lib/sampleWorkflow';
import type { WorkflowRun } from '@/types/workflow.types';
import { useTemporalStore } from '@/stores/workflowStore';

interface WorkflowEditorProps {
  user: { id: string; clerkId: string };
  workflow: {
    id: string;
    name: string;
    description?: string | null;
    nodes: unknown;
    edges: unknown;
    runs?: { id: string; status: string; scope: string; nodeResults: unknown; startedAt: string; completedAt?: string; duration?: number }[];
  } | null;
}

export default function WorkflowEditor({ user, workflow }: WorkflowEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const { undo, redo } = useTemporalStore();

  const {
    workflowId,
    workflowName,
    nodes,
    edges,
    isExecuting,
    setWorkflowId,
    setWorkflowName,
    setNodes,
    setEdges,
    setWorkflowRuns,
    startExecution,
    stopExecution,
    setNodeExecuting,
    addWorkflowRun,
  } = useWorkflowStore();

  // Initialize workflow data
  useEffect(() => {
    if (workflow) {
      setWorkflowId(workflow.id);
      setWorkflowName(workflow.name);
      setNodes(workflow.nodes as never[]);
      setEdges(workflow.edges as never[]);
      if (workflow.runs) {
        const runs: WorkflowRun[] = workflow.runs.map((r) => ({
          id: r.id,
          workflowId: workflow.id,
          status: r.status as WorkflowRun['status'],
          scope: r.scope as WorkflowRun['scope'],
          startedAt: r.startedAt,
          completedAt: r.completedAt,
          duration: r.duration ?? undefined,
          nodeResults: (r.nodeResults as WorkflowRun['nodeResults']) || [],
        }));
        setWorkflowRuns(runs);
      }
    } else {
      setWorkflowId(null);
      setWorkflowName('Untitled Workflow');
      setNodes([]);
      setEdges([]);
      setWorkflowRuns([]);
    }
  }, [workflow, setWorkflowId, setWorkflowName, setNodes, setEdges, setWorkflowRuns]);

  // Save workflow
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/workflows', {
        method: workflowId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: workflowId,
          name: workflowName,
          nodes,
          edges,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (data.id && !workflowId) {
        setWorkflowId(data.id);
        router.push(`/workflow/${data.id}`);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [workflowId, workflowName, nodes, edges, user.id, setWorkflowId, router]);

  // Execute workflow
  const handleExecute = useCallback(async () => {
    if (!workflowId) {
      await handleSave();
    }
    if (!workflowId) return;

    startExecution();
    nodes.forEach((node) => setNodeExecuting(node.id, true));

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId,
          nodes,
          edges,
          scope: 'full',
        }),
      });

      const data = await response.json();

      if (data.runId) {
        // Poll for results
        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/execute?runId=${data.runId}`);
            const run = await statusRes.json();

            if (run.status === 'completed' || run.status === 'failed' || run.status === 'partial') {
              clearInterval(pollInterval);
              stopExecution();

              const workflowRun: WorkflowRun = {
                id: run.id,
                workflowId: workflowId!,
                status: run.status,
                scope: run.scope || 'full',
                startedAt: run.startedAt,
                completedAt: run.completedAt,
                duration: run.duration,
                nodeResults: run.nodeResults || [],
              };
              addWorkflowRun(workflowRun);
            }
          } catch {
            clearInterval(pollInterval);
            stopExecution();
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Execution error:', error);
      stopExecution();
    }
  }, [workflowId, nodes, edges, startExecution, stopExecution, setNodeExecuting, addWorkflowRun, handleSave]);

  // Export workflow
  const handleExport = useCallback(() => {
    const json = exportWorkflowJSON({ name: workflowName, nodes, edges });
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [workflowName, nodes, edges]);

  // Import workflow
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const data = importWorkflowJSON(text) as { name?: string; nodes?: never[]; edges?: never[] };
        if (data.name) setWorkflowName(data.name);
        if (data.nodes) setNodes(data.nodes);
        if (data.edges) setEdges(data.edges);
      } catch {
        alert('Invalid workflow file');
      }
    };
    input.click();
  }, [setWorkflowName, setNodes, setEdges]);

  // Load sample workflow
  const handleLoadSample = useCallback(() => {
    setWorkflowName(sampleWorkflowName);
    setNodes(sampleNodes as never[]);
    setEdges(sampleEdges as never[]);
  }, [setWorkflowName, setNodes, setEdges]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 border-b border-[#222222] bg-[#0a0a0a] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[#a0a0a0] hover:text-white transition-colors p-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-[#222222]" />
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="bg-transparent text-white font-semibold text-base outline-none border-none hover:bg-[#141414] px-2 py-1 rounded transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSample}
            className="text-[#a0a0a0] hover:text-white p-2 rounded-lg hover:bg-[#141414] transition-colors"
            title="Load Sample Workflow"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={() => undo()}
            className="text-[#a0a0a0] hover:text-white p-2 rounded-lg hover:bg-[#141414] transition-colors"
            title="Undo (⌘Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => redo()}
            className="text-[#a0a0a0] hover:text-white p-2 rounded-lg hover:bg-[#141414] transition-colors"
            title="Redo (⌘⇧Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleImport}
            className="text-[#a0a0a0] hover:text-white p-2 rounded-lg hover:bg-[#141414] transition-colors"
            title="Import Workflow"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="text-[#a0a0a0] hover:text-white p-2 rounded-lg hover:bg-[#141414] transition-colors"
            title="Export Workflow"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-lg transition-colors ${
              showHistory ? 'text-[#8b5cf6] bg-[#8b5cf6]/10' : 'text-[#a0a0a0] hover:text-white hover:bg-[#141414]'
            }`}
            title="Toggle History"
          >
            <History className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-[#222222]" />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 text-sm font-medium bg-[#141414] border border-[#222222] text-white px-4 py-2 rounded-lg hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
          <button
            onClick={handleExecute}
            disabled={isExecuting || nodes.length === 0}
            className="flex items-center gap-2 text-sm font-medium bg-[#8b5cf6] text-white px-4 py-2 rounded-lg hover:bg-[#7c3aed] transition-colors disabled:opacity-50"
          >
            {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isExecuting ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {showSidebar && <Sidebar />}
        {!showSidebar && (
          <button
            onClick={() => setShowSidebar(true)}
            className="w-8 border-r border-[#222222] flex items-center justify-center text-[#a0a0a0] hover:text-white hover:bg-[#141414] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Canvas */}
        <div className="flex-1 relative">
          <WorkflowCanvas />
        </div>

        {/* Right Sidebar - History */}
        {showHistory && <HistoryPanel />}
      </div>
    </div>
  );
}