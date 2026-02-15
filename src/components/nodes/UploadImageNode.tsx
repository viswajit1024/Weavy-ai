'use client';

import { memo, useRef } from 'react';
import { Position, Handle, type NodeProps } from '@xyflow/react';
import { useWorkflowStore, type WorkflowState } from '@/stores/workflowStore';
import type { ImageFlowNode } from '@/types/workflow.types';
import { ImageIcon, Trash2, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

function UploadImageNodeComponent({ id, data, selected }: NodeProps<ImageFlowNode>) {
  const updateNodeData = useWorkflowStore((s: WorkflowState) => s.updateNodeData);
  const deleteNode = useWorkflowStore((s: WorkflowState) => s.deleteNode);
  const executingNodes = useWorkflowStore((s: WorkflowState) => s.executingNodes);
  const isExecuting = executingNodes.has(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      // For now, create a local URL. In production, this goes through Transloadit
      const url = URL.createObjectURL(file);
      const newImage = { imageUrl: url, fileName: file.name };
      const currentImages = data.images || [];
      updateNodeData(id, { images: [...currentImages, newImage] });
    }
  };

  const removeImage = (index: number) => {
    const images = [...(data.images || [])];
    images.splice(index, 1);
    updateNodeData(id, { images });
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
          <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
            <ImageIcon className="w-3.5 h-3.5 text-green-400" />
          </div>
          <span className="text-sm font-medium text-white">{data.label || 'Upload Image'}</span>
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
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />

        {data.images && data.images.length > 0 ? (
          <div className="space-y-2">
            {data.images.map((img, idx) => (
              <div key={idx} className="relative rounded-lg overflow-hidden bg-[#0a0a0a]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.imageUrl}
                  alt={img.fileName || 'Uploaded image'}
                  className="w-full max-h-[120px] object-contain"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-red-500/80 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="nodrag w-full text-xs text-[#8b5cf6] hover:text-[#a78bfa] py-1 transition-colors"
            >
              + Add more images
            </button>
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
              JPG, PNG, WebP, GIF
            </span>
          </button>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!w-3 !h-3 !bg-green-500 !border-green-400"
      />
    </div>
  );
}

const UploadImageNode = memo(UploadImageNodeComponent);
export default UploadImageNode;