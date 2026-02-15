'use client';

import { memo, useState, useCallback } from 'react';
import { Position, Handle, type NodeProps } from '@xyflow/react';
import { useWorkflowStore, type WorkflowState } from '@/stores/workflowStore';
import type { ExtractFrameFlowNode } from '@/types/workflow.types';
import { EXTRACT_FRAME_HANDLES } from '@/types/workflow.types';
import { Film, Trash2, Play, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function ExtractFrameNodeComponent({ id, data, selected }: NodeProps<ExtractFrameFlowNode>) {
  const updateNodeData = useWorkflowStore((s: WorkflowState) => s.updateNodeData);
  const deleteNode = useWorkflowStore((s: WorkflowState) => s.deleteNode);
  const executingNodes = useWorkflowStore((s: WorkflowState) => s.executingNodes);
  const edges = useWorkflowStore((s: WorkflowState) => s.edges);
  const nodes = useWorkflowStore((s: WorkflowState) => s.nodes);
  const isExecuting = executingNodes.has(id);
  const [isRunning, setIsRunning] = useState(false);

  // Check connections
  const connectedHandles = edges
    .filter((e) => e.target === id)
    .map((e) => e.targetHandle);

  const hasVideoConnection = connectedHandles.includes(EXTRACT_FRAME_HANDLES.VIDEO_URL);
  const hasTimestampConnection = connectedHandles.includes(EXTRACT_FRAME_HANDLES.TIMESTAMP);

  // Resolve connected video url
  const resolveVideoUrl = useCallback(() => {
    const videoEdge = edges.find(
      (e) => e.target === id && e.targetHandle === EXTRACT_FRAME_HANDLES.VIDEO_URL
    );
    if (!videoEdge) return null;

    const sourceNode = nodes.find((n) => n.id === videoEdge.source);
    if (!sourceNode) return null;

    const sourceData = sourceNode.data as { videoUrl?: string };
    return sourceData.videoUrl || null;
  }, [id, edges, nodes]);

  // Run extraction
  const handleExtract = useCallback(async () => {
    setIsRunning(true);
    updateNodeData(id, { error: undefined, outputFrameUrl: undefined, isProcessing: true });

    try {
      const videoUrl = resolveVideoUrl();
      if (!videoUrl) {
        throw new Error('No video connected. Connect a Video Upload node to video_url input.');
      }

      const response = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'extract-frame',
          payload: {
            videoUrl,
            timestamp: data.timestamp,
          },
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed to trigger extract task');

      // Poll
      const pollResult = async (runId: string): Promise<string> => {
        for (let i = 0; i < 120; i++) {
          const pollRes = await fetch(`/api/trigger?runId=${runId}`);
          const pollData = await pollRes.json();

          if (pollData.isCompleted) return pollData.output?.outputFrameUrl || '';
          if (pollData.isFailed) throw new Error(pollData.error || 'Frame extraction failed');

          await new Promise((r) => setTimeout(r, 1000));
        }
        throw new Error('Task timed out');
      };

      const outputUrl = await pollResult(result.runId);
      updateNodeData(id, { outputFrameUrl: outputUrl, isProcessing: false });
    } catch (error) {
      updateNodeData(id, {
        error: error instanceof Error ? error.message : 'Unknown error',
        isProcessing: false,
      });
    } finally {
      setIsRunning(false);
    }
  }, [id, data.timestamp, resolveVideoUrl, updateNodeData]);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={cn(
        'bg-[#141414] border rounded-xl w-[280px] shadow-lg transition-all',
        selected ? 'border-[#8b5cf6]' : 'border-[#222222]',
        (isExecuting || isRunning) && 'node-executing'
      )}
    >
      {/* Input Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id={EXTRACT_FRAME_HANDLES.VIDEO_URL}
        style={{ top: '30%' }}
        className="!w-3 !h-3 !bg-purple-500 !border-purple-400"
      />
      <Handle
        type="target"
        position={Position.Left}
        id={EXTRACT_FRAME_HANDLES.TIMESTAMP}
        style={{ top: '60%' }}
        className="!w-3 !h-3 !bg-orange-500 !border-orange-400"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-pink-500/20 rounded flex items-center justify-center">
            <Film className="w-3.5 h-3.5 text-pink-400" />
          </div>
          <span className="text-sm font-medium text-white">{data.label || 'Extract Frame'}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleExtract}
            disabled={isRunning}
            className="text-green-400 hover:text-green-300 transition-colors p-1 disabled:opacity-50"
            title="Extract frame"
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
        {/* Handle Labels */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[10px]">
            <div className={cn('w-2 h-2 rounded-full', hasVideoConnection ? 'bg-purple-500' : 'bg-[#333333]')} />
            <span className="text-[#a0a0a0]">video_url</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <div className={cn('w-2 h-2 rounded-full', hasTimestampConnection ? 'bg-orange-500' : 'bg-[#333333]')} />
            <span className="text-[#a0a0a0]">timestamp</span>
            <span className="text-[#555555]">(seconds)</span>
          </div>
        </div>

        {/* Timestamp Input */}
        <div>
          <label className="text-[10px] text-[#a0a0a0] uppercase tracking-wider mb-1 block">
            Timestamp (seconds)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={data.timestamp}
              onChange={(e) => updateNodeData(id, { timestamp: Number(e.target.value) })}
              disabled={hasTimestampConnection}
              min={0}
              step={0.1}
              className="nodrag flex-1 bg-[#0a0a0a] border border-[#222222] rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-[#8b5cf6]/50 disabled:opacity-40"
            />
            <span className="text-xs text-[#555555] font-mono">{formatTime(data.timestamp)}</span>
          </div>
          <input
            type="range"
            value={data.timestamp}
            onChange={(e) => updateNodeData(id, { timestamp: Number(e.target.value) })}
            disabled={hasTimestampConnection}
            min={0}
            max={300}
            step={0.1}
            className="nodrag w-full mt-1.5 accent-[#8b5cf6] h-1 disabled:opacity-40"
          />
        </div>

        {/* Video Preview (from connected node) */}
        {resolveVideoUrl() && (
          <div>
            <label className="text-[10px] text-[#a0a0a0] uppercase tracking-wider mb-1 block">Source</label>
            <div className="rounded-lg overflow-hidden border border-[#222222] bg-black">
              <video
                src={resolveVideoUrl()!}
                className="w-full h-20 object-cover"
                muted
              />
            </div>
          </div>
        )}

        {/* Output Preview */}
        {data.outputFrameUrl && (
          <div>
            <label className="text-[10px] text-green-400 uppercase tracking-wider mb-1 block">
              Extracted Frame
            </label>
            <div className="rounded-lg overflow-hidden border border-green-500/20">
              <img src={data.outputFrameUrl} alt="Extracted frame" className="w-full h-24 object-contain bg-black" />
            </div>
          </div>
        )}

        {/* Error */}
        {data.error && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-2.5">
            <p className="text-xs text-red-400">{data.error}</p>
          </div>
        )}

        {/* Loading */}
        {isRunning && (
          <div className="flex items-center gap-2 text-xs text-[#a0a0a0]">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8b5cf6]" />
            <span>Extracting frame...</span>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id={EXTRACT_FRAME_HANDLES.OUTPUT}
        className="!w-3 !h-3 !bg-pink-500 !border-pink-400"
      />
    </div>
  );
}

const ExtractFrameNode = memo(ExtractFrameNodeComponent);
export default ExtractFrameNode;