'use client';

import { memo, useState, useCallback } from 'react';
import { Position, Handle, type NodeProps } from '@xyflow/react';
import { useWorkflowStore, type WorkflowState } from '@/stores/workflowStore';
import type { CropImageFlowNode } from '@/types/workflow.types';
import { CROP_IMAGE_HANDLES } from '@/types/workflow.types';
import { Crop, Trash2, Play, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

function CropImageNodeComponent({ id, data, selected }: NodeProps<CropImageFlowNode>) {
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

  const hasImageConnection = connectedHandles.includes(CROP_IMAGE_HANDLES.IMAGE_URL);
  const hasXConnection = connectedHandles.includes(CROP_IMAGE_HANDLES.X_PERCENT);
  const hasYConnection = connectedHandles.includes(CROP_IMAGE_HANDLES.Y_PERCENT);
  const hasWidthConnection = connectedHandles.includes(CROP_IMAGE_HANDLES.WIDTH_PERCENT);
  const hasHeightConnection = connectedHandles.includes(CROP_IMAGE_HANDLES.HEIGHT_PERCENT);

  // Resolve connected image url
  const resolveImageUrl = useCallback(() => {
    const imageEdge = edges.find((e) => e.target === id && e.targetHandle === CROP_IMAGE_HANDLES.IMAGE_URL);
    if (!imageEdge) return null;

    const sourceNode = nodes.find((n) => n.id === imageEdge.source);
    if (!sourceNode) return null;

    const sourceData = sourceNode.data as {
      images?: { imageUrl: string }[];
      outputImageUrl?: string;
    };

    if (sourceData.outputImageUrl) return sourceData.outputImageUrl;
    if (sourceData.images?.[0]?.imageUrl) return sourceData.images[0].imageUrl;
    return null;
  }, [id, edges, nodes]);

  // Run crop
  const handleCrop = useCallback(async () => {
    setIsRunning(true);
    updateNodeData(id, { error: undefined, outputImageUrl: undefined, isProcessing: true });

    try {
      const imageUrl = resolveImageUrl();
      if (!imageUrl) {
        throw new Error('No image connected. Connect an image node to image_url input.');
      }

      const response = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'crop-image',
          payload: {
            imageUrl,
            x: data.x,
            y: data.y,
            width: data.width,
            height: data.height,
          },
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed to trigger crop task');

      // Poll
      const pollResult = async (runId: string): Promise<string> => {
        for (let i = 0; i < 120; i++) {
          const pollRes = await fetch(`/api/trigger?runId=${runId}`);
          const pollData = await pollRes.json();

          if (pollData.isCompleted) return pollData.output?.outputImageUrl || '';
          if (pollData.isFailed) throw new Error(pollData.error || 'Crop task failed');

          await new Promise((r) => setTimeout(r, 1000));
        }
        throw new Error('Task timed out');
      };

      const outputUrl = await pollResult(result.runId);
      updateNodeData(id, { outputImageUrl: outputUrl, isProcessing: false });
    } catch (error) {
      updateNodeData(id, {
        error: error instanceof Error ? error.message : 'Unknown error',
        isProcessing: false,
      });
    } finally {
      setIsRunning(false);
    }
  }, [id, data.x, data.y, data.width, data.height, resolveImageUrl, updateNodeData]);

  const handlePositions = {
    [CROP_IMAGE_HANDLES.IMAGE_URL]: '15%',
    [CROP_IMAGE_HANDLES.X_PERCENT]: '30%',
    [CROP_IMAGE_HANDLES.Y_PERCENT]: '45%',
    [CROP_IMAGE_HANDLES.WIDTH_PERCENT]: '60%',
    [CROP_IMAGE_HANDLES.HEIGHT_PERCENT]: '75%',
  };

  return (
    <div
      className={cn(
        'bg-[#141414] border rounded-xl w-[300px] shadow-lg transition-all',
        selected ? 'border-[#8b5cf6]' : 'border-[#222222]',
        (isExecuting || isRunning) && 'node-executing'
      )}
    >
      {/* Input Handles */}
      {Object.entries(handlePositions).map(([handleId, top]) => (
        <Handle
          key={handleId}
          type="target"
          position={Position.Left}
          id={handleId}
          style={{ top }}
          className={cn(
            '!w-3 !h-3',
            handleId === CROP_IMAGE_HANDLES.IMAGE_URL
              ? '!bg-green-500 !border-green-400'
              : '!bg-orange-500 !border-orange-400'
          )}
        />
      ))}

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-500/20 rounded flex items-center justify-center">
            <Crop className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <span className="text-sm font-medium text-white">{data.label || 'Crop Image'}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCrop}
            disabled={isRunning}
            className="text-green-400 hover:text-green-300 transition-colors p-1 disabled:opacity-50"
            title="Crop"
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
            <div className={cn('w-2 h-2 rounded-full', hasImageConnection ? 'bg-green-500' : 'bg-[#333333]')} />
            <span className="text-[#a0a0a0]">image_url</span>
          </div>
        </div>

        {/* Crop Params */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-[#a0a0a0] uppercase tracking-wider mb-0.5 block flex items-center gap-1">
              X %
              <span className={cn('w-1.5 h-1.5 rounded-full', hasXConnection ? 'bg-orange-500' : 'bg-[#333333]')} />
            </label>
            <input
              type="number"
              value={data.x}
              onChange={(e) => updateNodeData(id, { x: Number(e.target.value) })}
              disabled={hasXConnection}
              min={0}
              max={100}
              className="nodrag w-full bg-[#0a0a0a] border border-[#222222] rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-[#8b5cf6]/50 disabled:opacity-40"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#a0a0a0] uppercase tracking-wider mb-0.5 block flex items-center gap-1">
              Y %
              <span className={cn('w-1.5 h-1.5 rounded-full', hasYConnection ? 'bg-orange-500' : 'bg-[#333333]')} />
            </label>
            <input
              type="number"
              value={data.y}
              onChange={(e) => updateNodeData(id, { y: Number(e.target.value) })}
              disabled={hasYConnection}
              min={0}
              max={100}
              className="nodrag w-full bg-[#0a0a0a] border border-[#222222] rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-[#8b5cf6]/50 disabled:opacity-40"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#a0a0a0] uppercase tracking-wider mb-0.5 block flex items-center gap-1">
              Width %
              <span className={cn('w-1.5 h-1.5 rounded-full', hasWidthConnection ? 'bg-orange-500' : 'bg-[#333333]')} />
            </label>
            <input
              type="number"
              value={data.width}
              onChange={(e) => updateNodeData(id, { width: Number(e.target.value) })}
              disabled={hasWidthConnection}
              min={0}
              max={100}
              className="nodrag w-full bg-[#0a0a0a] border border-[#222222] rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-[#8b5cf6]/50 disabled:opacity-40"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#a0a0a0] uppercase tracking-wider mb-0.5 block flex items-center gap-1">
              Height %
              <span className={cn('w-1.5 h-1.5 rounded-full', hasHeightConnection ? 'bg-orange-500' : 'bg-[#333333]')} />
            </label>
            <input
              type="number"
              value={data.height}
              onChange={(e) => updateNodeData(id, { height: Number(e.target.value) })}
              disabled={hasHeightConnection}
              min={0}
              max={100}
              className="nodrag w-full bg-[#0a0a0a] border border-[#222222] rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-[#8b5cf6]/50 disabled:opacity-40"
            />
          </div>
        </div>

        {/* Image Preview */}
        {resolveImageUrl() && (
          <div className="relative rounded-lg overflow-hidden border border-[#222222]">
            <img
              src={resolveImageUrl()!}
              alt="Input"
              className="w-full h-24 object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white/40" />
            </div>
          </div>
        )}

        {/* Output Preview */}
        {data.outputImageUrl && (
          <div>
            <label className="text-[10px] text-green-400 uppercase tracking-wider mb-1 block">Cropped Output</label>
            <div className="rounded-lg overflow-hidden border border-green-500/20">
              <img src={data.outputImageUrl} alt="Cropped" className="w-full h-24 object-contain bg-black" />
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
            <span>Cropping image...</span>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id={CROP_IMAGE_HANDLES.OUTPUT}
        className="!w-3 !h-3 !bg-yellow-500 !border-yellow-400"
      />
    </div>
  );
}

const CropImageNode = memo(CropImageNodeComponent);
export default CropImageNode;