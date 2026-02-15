'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  BackgroundVariant,
  type Connection,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '@/stores/workflowStore';
import { validateConnection } from '@/lib/utils';
import TextNode from '@/components/nodes/TextNode';
import UploadImageNode from '@/components/nodes/UploadImageNode';
import UploadVideoNode from '@/components/nodes/UploadVideoNode';
import LLMNode from '@/components/nodes/LLMNode';
import CropImageNode from '@/components/nodes/CropImageNode';
import ExtractFrameNode from '@/components/nodes/ExtractFrameNode';

export default function WorkflowCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useWorkflowStore();

  // Define custom node types
  const nodeTypes = useMemo(
    () => ({
      text: TextNode,
      uploadImage: UploadImageNode,
      uploadVideo: UploadVideoNode,
      llm: LLMNode,
      cropImage: CropImageNode,
      extractFrame: ExtractFrameNode,
    }),
    []
  );

  // Validate connections before allowing them
  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) return false;

      // Prevent self-connection
      if (connection.source === connection.target) return false;

      return validateConnection(
        sourceNode.type || '',
        connection.sourceHandle || '',
        targetNode.type || '',
        connection.targetHandle || ''
      );
    },
    [nodes]
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = nodes.filter((n) => n.selected);
        const store = useWorkflowStore.getState();
        selectedNodes.forEach((n) => store.deleteNode(n.id));
      }
    },
    [nodes]
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'default',
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
    }),
    []
  );

  return (
    <div className="w-full h-full" onKeyDown={handleKeyDown} tabIndex={0}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        isValidConnection={isValidConnection}
        connectionMode={ConnectionMode.Strict}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        className="bg-[#0a0a0a]"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#333333"
        />
        <Controls
          showInteractive={false}
          className="!bg-[#141414] !border-[#222222] !rounded-lg"
        />
        <MiniMap
          nodeColor="#8b5cf6"
          maskColor="rgba(0, 0, 0, 0.7)"
          className="!bg-[#141414] !border-[#222222] !rounded-lg"
        />
      </ReactFlow>
    </div>
  );
}