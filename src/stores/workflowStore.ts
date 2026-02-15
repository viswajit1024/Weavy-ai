'use client';

import { create } from 'zustand';
import { temporal } from 'zundo';
import {
  type Node,
  type Edge,
  type Connection,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import type { WorkflowRun, NodeType } from '@/types/workflow.types';
import { getDefaultNodeData } from '@/types/workflow.types';
import { generateNodeId, generateEdgeId, getAutoLayoutPosition } from '@/lib/utils';

export interface WorkflowState {
  // Workflow data
  workflowId: string | null;
  workflowName: string;
  nodes: Node[];
  edges: Edge[];

  // Execution state
  isExecuting: boolean;
  executingNodes: Set<string>;
  executionResults: Map<string, unknown>;

  // History
  workflowRuns: WorkflowRun[];
  selectedRun: WorkflowRun | null;

  // Actions - Workflow
  setWorkflowId: (id: string | null) => void;
  setWorkflowName: (name: string) => void;

  // Actions - Nodes & Edges
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: NodeType) => void;
  updateNodeData: <T extends Node>(nodeId: string, data: Partial<T['data']>) => void;
  deleteNode: (nodeId: string) => void;

  // Actions - Execution
  startExecution: () => void;
  stopExecution: () => void;
  setNodeExecuting: (nodeId: string, executing: boolean) => void;
  setNodeResult: (nodeId: string, result: unknown) => void;

  // Actions - History
  setWorkflowRuns: (runs: WorkflowRun[]) => void;
  addWorkflowRun: (run: WorkflowRun) => void;
  setSelectedRun: (run: WorkflowRun | null) => void;

  // Actions - Reset
  resetWorkflow: () => void;
}

export const useWorkflowStore = create<WorkflowState>()(temporal((set, get) => ({
  // Initial state
  workflowId: null,
  workflowName: 'Untitled Workflow',
  nodes: [],
  edges: [],
  isExecuting: false,
  executingNodes: new Set(),
  executionResults: new Map(),
  workflowRuns: [],
  selectedRun: null,

  // Workflow actions
  setWorkflowId: (id) => set({ workflowId: id }),
  setWorkflowName: (name) => set({ workflowName: name }),

  // Node and Edge actions
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    const newEdge: Edge = {
      id: generateEdgeId(connection.source!, connection.target!, connection.sourceHandle ?? undefined, connection.targetHandle ?? undefined),
      source: connection.source!,
      target: connection.target!,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: 'default',
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
    };
    set({ edges: addEdge(newEdge, get().edges) });
  },

  addNode: (type) => {
    const data = getDefaultNodeData(type);
    const position = getAutoLayoutPosition(get().nodes);
    const newNode: Node = {
      id: generateNodeId(),
      type,
      position,
      data,
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    });
  },

  // Execution actions
  startExecution: () => set({ isExecuting: true }),
  stopExecution: () =>
    set({
      isExecuting: false,
      executingNodes: new Set(),
    }),

  setNodeExecuting: (nodeId, executing) => {
    const current = new Set(get().executingNodes);
    if (executing) {
      current.add(nodeId);
    } else {
      current.delete(nodeId);
    }
    set({ executingNodes: current });
  },

  setNodeResult: (nodeId, result) => {
    const current = new Map(get().executionResults);
    current.set(nodeId, result);
    set({ executionResults: current });
  },

  // History actions
  setWorkflowRuns: (runs) => set({ workflowRuns: runs }),
  addWorkflowRun: (run) =>
    set({ workflowRuns: [run, ...get().workflowRuns] }),
  setSelectedRun: (run) => set({ selectedRun: run }),

  // Reset
  resetWorkflow: () => {
    set({
      workflowId: null,
      workflowName: 'Untitled Workflow',
      nodes: [],
      edges: [],
      isExecuting: false,
      executingNodes: new Set(),
      executionResults: new Map(),
      selectedRun: null,
    });
  },
}), {
  // Temporal (undo/redo) config
  limit: 100,
  // Only track nodes and edges for undo/redo — not execution state or history
  partialize: (state) => ({
    nodes: state.nodes,
    edges: state.edges,
  }),
  // Equality check to avoid duplicate history entries
  equality: (pastState, currentState) =>
    JSON.stringify(pastState) === JSON.stringify(currentState),
}));

// Export temporal store hook for undo/redo buttons
export const useTemporalStore = () => useWorkflowStore.temporal.getState();
