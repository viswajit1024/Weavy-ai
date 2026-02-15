'use client';

import { memo, useRef } from 'react';
import { Position, Handle, type NodeProps } from '@xyflow/react';
import { useWorkflowStore, type WorkflowState } from '@/stores/workflowStore';
import type { VideoFlowNode } from '@/types/workflow.types';
import { Video, Trash2, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

function UploadVideoNodeComponent({ id, data, selected }: NodeProps<VideoFlowNode>) {
  const updateNodeData = useWorkflowStore((s: WorkflowState) => s.updateNodeData);
  const deleteNode = useWorkflowStore((s: WorkflowState) => s.deleteNode);
  const executingNodes = useWorkflowStore((s: WorkflowState) => s.executingNodes);
  const isExecuting = executingNodes.has(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    updateNodeData(id, { videoUrl: url, fileName: file.name });
  };

  const removeVideo = () => {
    updateNodeData(id, { videoUrl: undefined, fileName: undefined });
  };

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
          <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
            <Video className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="text-sm font-medium text-white">{data.label || 'Upload Video'}</span>
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
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
          onChange={handleFileUpload}
          className="hidden"
        />

        {data.videoUrl ? (
          <div className="relative rounded-lg overflow-hidden bg-black">
            <video
              src={data.videoUrl}
              className="w-full max-h-[150px] object-contain"
              controls
              muted
            />
            <button
              onClick={removeVideo}
              className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-red-500/80 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
            {data.fileName && (
              <p className="text-[10px] text-[#a0a0a0] mt-1 truncate px-1">
                {data.fileName}
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="nodrag w-full border-2 border-dashed border-[#222222] rounded-lg p-6 flex flex-col items-center gap-2 hover:border-[#8b5cf6]/30 transition-colors"
          >
            <Upload className="w-6 h-6 text-[#555555]" />
            <span className="text-xs text-[#555555]">
              Click to upload
            </span>
            <span className="text-[10px] text-[#444444]">
              MP4, MOV, WebM, M4V
            </span>
          </button>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!w-3 !h-3 !bg-purple-500 !border-purple-400"
      />
    </div>
  );
}

const UploadVideoNode = memo(UploadVideoNodeComponent);
export default UploadVideoNode;