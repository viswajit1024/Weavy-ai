'use client';

import { memo } from 'react';
import { Position, Handle, type NodeProps } from '@xyflow/react';
import { useWorkflowStore, type WorkflowState } from '@/stores/workflowStore';
import type { TextFlowNode } from '@/types/workflow.types';
import { Type, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function TextNodeComponent({ id, data, selected }: NodeProps<TextFlowNode>) {
  const updateNodeData = useWorkflowStore((s: WorkflowState) => s.updateNodeData);
  const deleteNode = useWorkflowStore((s: WorkflowState) => s.deleteNode);
  const executingNodes = useWorkflowStore((s: WorkflowState) => s.executingNodes);
  const isExecuting = executingNodes.has(id);

  return (
    <div
      className={cn(
        'bg-[#141414] border rounded-xl w-[280px] shadow-lg transition-all',
        selected ? 'border-[#8b5cf6]' : 'border-[#222222]',
        isExecuting && 'node-executing'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
            <Type className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <span className="text-sm font-medium text-white">{data.label || 'Text'}</span>
        </div>
        <button
          onClick={() => deleteNode(id)}
          className="text-[#555555] hover:text-red-400 transition-colors p-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-3">
        <textarea
          value={data.text || ''}
          onChange={(e) => updateNodeData(id, { text: e.target.value })}
          placeholder="Enter your text here..."
          className="nodrag w-full bg-[#0a0a0a] border border-[#222222] rounded-lg p-2.5 text-xs text-white placeholder-[#555555] resize-none outline-none focus:border-[#8b5cf6]/50 transition-colors min-h-[80px]"
          rows={4}
        />
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!w-3 !h-3 !bg-blue-500 !border-blue-400"
      />
    </div>
  );
}

const TextNode = memo(TextNodeComponent);
export default TextNode;