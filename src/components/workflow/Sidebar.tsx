'use client';

import { useWorkflowStore } from '@/stores/workflowStore';
import { Type, ImageIcon, Video, Brain, Crop, Film, Search, ChevronLeft } from 'lucide-react';
import { useCallback, useState } from 'react';
import type { NodeType } from '@/types/workflow.types';

const NODE_TYPES: {
  type: NodeType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}[] = [
  {
    type: 'text',
    label: 'Text',
    icon: Type,
    color: 'bg-blue-500/20 text-blue-400',
    description: 'Input text data',
  },
  {
    type: 'uploadImage',
    label: 'Upload Image',
    icon: ImageIcon,
    color: 'bg-green-500/20 text-green-400',
    description: 'Upload image files',
  },
  {
    type: 'uploadVideo',
    label: 'Upload Video',
    icon: Video,
    color: 'bg-purple-500/20 text-purple-400',
    description: 'Upload video files',
  },
  {
    type: 'llm',
    label: 'Run Any LLM',
    icon: Brain,
    color: 'bg-indigo-500/20 text-indigo-400',
    description: 'Run AI model',
  },
  {
    type: 'cropImage',
    label: 'Crop Image',
    icon: Crop,
    color: 'bg-yellow-500/20 text-yellow-400',
    description: 'Crop image with FFmpeg',
  },
  {
    type: 'extractFrame',
    label: 'Extract Frame',
    icon: Film,
    color: 'bg-pink-500/20 text-pink-400',
    description: 'Extract video frame',
  },
];

export default function Sidebar() {
  const addNode = useWorkflowStore((s) => s.addNode);

  const onDragStart = useCallback(
    (event: React.DragEvent, nodeType: NodeType) => {
      event.dataTransfer.setData('application/reactflow', nodeType);
      event.dataTransfer.effectAllowed = 'move';
    },
    []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const filteredNodes = NODE_TYPES.filter(
    (n) =>
      n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (collapsed) {
    return (
      <div className="w-12 border-r border-[#222222] bg-[#0a0a0a] flex flex-col items-center pt-3">
        <button
          onClick={() => setCollapsed(false)}
          className="text-[#a0a0a0] hover:text-white p-1.5 rounded-lg hover:bg-[#141414] transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </button>
        {NODE_TYPES.map((nodeType) => {
          const Icon = nodeType.icon;
          return (
            <button
              key={nodeType.type}
              onClick={() => addNode(nodeType.type)}
              className="p-2 rounded-lg hover:bg-[#141414] transition-colors mb-1"
              title={nodeType.label}
            >
              <Icon className={`w-4 h-4 ${nodeType.color.split(' ')[1]}`} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-56 border-r border-[#222222] bg-[#0a0a0a] flex flex-col shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-[#222222]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">
            Nodes
          </span>
          <button
            onClick={() => setCollapsed(true)}
            className="text-[#a0a0a0] hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555555]" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141414] border border-[#222222] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#555555] outline-none focus:border-[#8b5cf6]/50 transition-colors"
          />
        </div>
      </div>

      {/* Quick Access */}
      <div className="p-3 flex-1 overflow-y-auto">
        <p className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider mb-2">
          Quick Access
        </p>
        <div className="space-y-1">
          {filteredNodes.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <button
                key={nodeType.type}
                onClick={() => addNode(nodeType.type)}
                draggable
                onDragStart={(e) => onDragStart(e, nodeType.type)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#141414] transition-colors text-left group cursor-grab active:cursor-grabbing"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${nodeType.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {nodeType.label}
                  </p>
                  <p className="text-xs text-[#555555] truncate">
                    {nodeType.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}