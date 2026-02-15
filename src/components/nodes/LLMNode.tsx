'use client';

import { memo, useState, useCallback } from 'react';
import { Position, Handle, type NodeProps } from '@xyflow/react';
import { useWorkflowStore, type WorkflowState } from '@/stores/workflowStore';
import type { LLMFlowNode } from '@/types/workflow.types';
import { LLM_HANDLES, GEMINI_MODELS } from '@/types/workflow.types';
import { Brain, Trash2, Play, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function LLMNodeComponent({ id, data, selected }: NodeProps<LLMFlowNode>) {
  const updateNodeData = useWorkflowStore((s: WorkflowState) => s.updateNodeData);
  const deleteNode = useWorkflowStore((s: WorkflowState) => s.deleteNode);
  const executingNodes = useWorkflowStore((s: WorkflowState) => s.executingNodes);
  const edges = useWorkflowStore((s: WorkflowState) => s.edges);
  const nodes = useWorkflowStore((s: WorkflowState) => s.nodes);
  const isExecuting = executingNodes.has(id);
  const [isRunning, setIsRunning] = useState(false);

  // Check which handles have connections
  const connectedHandles = edges
    .filter((e) => e.target === id)
    .map((e) => e.targetHandle);

  const hasSystemPromptConnection = connectedHandles.includes(LLM_HANDLES.SYSTEM_PROMPT);
  const hasUserMessageConnection = connectedHandles.includes(LLM_HANDLES.USER_MESSAGE);
  const hasImagesConnection = connectedHandles.includes(LLM_HANDLES.IMAGES);

  // Gather inputs from connected nodes
  const gatherInputs = useCallback(() => {
    let systemPrompt = '';
    let userMessage = '';
    const images: string[] = [];

    for (const edge of edges) {
      if (edge.target !== id) continue;
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (!sourceNode) continue;

      if (edge.targetHandle === LLM_HANDLES.SYSTEM_PROMPT) {
        const sourceData = sourceNode.data as { text?: string; result?: string };
        systemPrompt = sourceData.text || sourceData.result || '';
      }
      if (edge.targetHandle === LLM_HANDLES.USER_MESSAGE) {
        const sourceData = sourceNode.data as { text?: string; result?: string };
        userMessage = sourceData.text || sourceData.result || '';
      }
      if (edge.targetHandle === LLM_HANDLES.IMAGES) {
        const sourceData = sourceNode.data as {
          images?: { imageUrl: string }[];
          outputImageUrl?: string;
          outputFrameUrl?: string;
        };
        if (sourceData.images) {
          images.push(...sourceData.images.map((img) => img.imageUrl));
        }
        if (sourceData.outputImageUrl) images.push(sourceData.outputImageUrl);
        if (sourceData.outputFrameUrl) images.push(sourceData.outputFrameUrl);
      }
    }

    return { systemPrompt, userMessage, images };
  }, [id, edges, nodes]);

  // Run LLM
  const handleRun = useCallback(async () => {
    setIsRunning(true);
    updateNodeData(id, { error: undefined, result: undefined, isProcessing: true });

    try {
      const { systemPrompt, userMessage, images } = gatherInputs();

      if (!userMessage) {
        throw new Error('User message is required. Connect a Text node to the user_message input.');
      }

      const response = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'llm',
          payload: {
            model: data.model,
            systemPrompt,
            userMessage,
            images,
          },
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to trigger LLM task');
      }

      // Poll for result
      const pollResult = async (runId: string): Promise<string> => {
        for (let i = 0; i < 180; i++) {
          const pollRes = await fetch(`/api/trigger?runId=${runId}`);
          const pollData = await pollRes.json();

          if (pollData.isCompleted) {
            return pollData.output?.output || '';
          }
          if (pollData.isFailed) {
            throw new Error(pollData.error || 'LLM task failed');
          }

          await new Promise((r) => setTimeout(r, 1000));
        }
        throw new Error('Task timed out');
      };

      const output = await pollResult(result.runId);
      updateNodeData(id, { result: output, isProcessing: false });
    } catch (error) {
      updateNodeData(id, {
        error: error instanceof Error ? error.message : 'Unknown error',
        isProcessing: false,
      });
    } finally {
      setIsRunning(false);
    }
  }, [id, data.model, gatherInputs, updateNodeData]);

  return (
    <div
      className={cn(
        'bg-[#141414] border rounded-xl w-[320px] shadow-lg transition-all',
        selected ? 'border-[#8b5cf6]' : 'border-[#222222]',
        (isExecuting || isRunning) && 'node-executing'
      )}
    >
      {/* Input Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id={LLM_HANDLES.SYSTEM_PROMPT}
        style={{ top: '25%' }}
        className="!w-3 !h-3 !bg-blue-500 !border-blue-400"
      />
      <Handle
        type="target"
        position={Position.Left}
        id={LLM_HANDLES.USER_MESSAGE}
        style={{ top: '50%' }}
        className="!w-3 !h-3 !bg-blue-500 !border-blue-400"
      />
      <Handle
        type="target"
        position={Position.Left}
        id={LLM_HANDLES.IMAGES}
        style={{ top: '75%' }}
        className="!w-3 !h-3 !bg-green-500 !border-green-400"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-500/20 rounded flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="text-sm font-medium text-white">{data.label || 'Run Any LLM'}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="text-green-400 hover:text-green-300 transition-colors p-1 disabled:opacity-50"
            title="Run this node"
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={() => deleteNode(id)}
            className="text-[#555555] hover:text-red-400 transition-colors p-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-3">
        {/* Model Selector */}
        <div>
          <label className="text-[10px] text-[#a0a0a0] uppercase tracking-wider mb-1 block">Model</label>
          <select
            value={data.model}
            onChange={(e) => updateNodeData(id, { model: e.target.value })}
            className="nodrag w-full bg-[#0a0a0a] border border-[#222222] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#8b5cf6]/50 transition-colors"
          >
            {GEMINI_MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Handle Labels */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[10px]">
            <div className={cn('w-2 h-2 rounded-full', hasSystemPromptConnection ? 'bg-blue-500' : 'bg-[#333333]')} />
            <span className="text-[#a0a0a0]">system_prompt</span>
            <span className="text-[#555555]">(optional)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <div className={cn('w-2 h-2 rounded-full', hasUserMessageConnection ? 'bg-blue-500' : 'bg-[#333333]')} />
            <span className="text-[#a0a0a0]">user_message</span>
            <span className="text-[#555555]">(required)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <div className={cn('w-2 h-2 rounded-full', hasImagesConnection ? 'bg-green-500' : 'bg-[#333333]')} />
            <span className="text-[#a0a0a0]">images</span>
            <span className="text-[#555555]">(optional)</span>
          </div>
        </div>

        {/* Result Display */}
        {data.result && (
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-2.5 max-h-[200px] overflow-y-auto">
            <label className="text-[10px] text-green-400 uppercase tracking-wider mb-1 block">Output</label>
            <p className="text-xs text-[#a0a0a0] whitespace-pre-wrap break-words">{data.result}</p>
          </div>
        )}

        {/* Error Display */}
        {data.error && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-2.5">
            <p className="text-xs text-red-400">{data.error}</p>
          </div>
        )}

        {/* Loading State */}
        {isRunning && (
          <div className="flex items-center gap-2 text-xs text-[#a0a0a0]">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8b5cf6]" />
            <span>Running LLM...</span>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id={LLM_HANDLES.OUTPUT}
        className="!w-3 !h-3 !bg-indigo-500 !border-indigo-400"
      />
    </div>
  );
}

const LLMNode = memo(LLMNodeComponent);
export default LLMNode;