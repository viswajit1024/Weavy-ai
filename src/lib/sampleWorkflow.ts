// Sample Workflow: Product Marketing Kit Generator
// As specified in instructions.txt
//
// Branch A: Upload Image → Crop Image → Text (system prompt) + Text (user message) → LLM Node #1
// Branch B: Upload Video → Extract Frame
// Convergence: LLM #1 output + Extract Frame output + Text (system prompt #2) + Text (user message #2) → LLM Node #2

import type { Node, Edge } from '@xyflow/react';

export const sampleWorkflowName = 'Product Marketing Kit Generator';

export const sampleNodes: Node[] = [
  // === Branch A ===
  {
    id: 'node-upload-image-1',
    type: 'uploadImage',
    position: { x: 50, y: 100 },
    data: {
      label: 'Product Photo',
      images: [],
    },
  },
  {
    id: 'node-crop-1',
    type: 'cropImage',
    position: { x: 350, y: 80 },
    data: {
      label: 'Crop Product',
      x: 10,
      y: 10,
      width: 80,
      height: 80,
      outputImageUrl: undefined,
    },
  },
  {
    id: 'node-text-system-1',
    type: 'text',
    position: { x: 350, y: 340 },
    data: {
      label: 'System Prompt',
      text: 'You are a marketing expert. Analyze the product image and generate a compelling marketing description.',
    },
  },
  {
    id: 'node-text-user-1',
    type: 'text',
    position: { x: 350, y: 500 },
    data: {
      label: 'User Message',
      text: 'Describe this product in a way that highlights its key features and benefits for an e-commerce listing.',
    },
  },
  {
    id: 'node-llm-1',
    type: 'llm',
    position: { x: 700, y: 200 },
    data: {
      label: 'Product Description Generator',
      model: 'gemini-1.5-flash',
      result: undefined,
    },
  },

  // === Branch B ===
  {
    id: 'node-upload-video-1',
    type: 'uploadVideo',
    position: { x: 50, y: 650 },
    data: {
      label: 'Product Demo Video',
      videoUrl: undefined,
    },
  },
  {
    id: 'node-extract-frame-1',
    type: 'extractFrame',
    position: { x: 350, y: 680 },
    data: {
      label: 'Best Frame',
      timestamp: 5,
      outputFrameUrl: undefined,
    },
  },

  // === Convergence ===
  {
    id: 'node-text-system-2',
    type: 'text',
    position: { x: 700, y: 550 },
    data: {
      label: 'System Prompt 2',
      text: 'You are a senior marketing strategist. Combine the product description with the video frame analysis to create a complete marketing kit.',
    },
  },
  {
    id: 'node-text-user-2',
    type: 'text',
    position: { x: 700, y: 710 },
    data: {
      label: 'User Message 2',
      text: 'Using the product description and video frame, create a marketing kit that includes: 1) A headline, 2) A short description (50 words), 3) A long description (200 words), 4) Three key selling points, 5) A suggested social media post.',
    },
  },
  {
    id: 'node-llm-2',
    type: 'llm',
    position: { x: 1100, y: 450 },
    data: {
      label: 'Marketing Kit Assembler',
      model: 'gemini-1.5-pro',
      result: undefined,
    },
  },
];

export const sampleEdges: Edge[] = [
  // Branch A: Upload Image → Crop Image
  {
    id: 'edge-1',
    source: 'node-upload-image-1',
    target: 'node-crop-1',
    sourceHandle: 'output',
    targetHandle: 'image_url',
    animated: true,
    style: { stroke: '#8b5cf6' },
  },
  // Branch A: Crop → LLM #1 (images)
  {
    id: 'edge-2',
    source: 'node-crop-1',
    target: 'node-llm-1',
    sourceHandle: 'output',
    targetHandle: 'images',
    animated: true,
    style: { stroke: '#8b5cf6' },
  },
  // Branch A: System Prompt → LLM #1
  {
    id: 'edge-3',
    source: 'node-text-system-1',
    target: 'node-llm-1',
    sourceHandle: 'output',
    targetHandle: 'system_prompt',
    animated: true,
    style: { stroke: '#8b5cf6' },
  },
  // Branch A: User Message → LLM #1
  {
    id: 'edge-4',
    source: 'node-text-user-1',
    target: 'node-llm-1',
    sourceHandle: 'output',
    targetHandle: 'user_message',
    animated: true,
    style: { stroke: '#8b5cf6' },
  },

  // Branch B: Upload Video → Extract Frame
  {
    id: 'edge-5',
    source: 'node-upload-video-1',
    target: 'node-extract-frame-1',
    sourceHandle: 'output',
    targetHandle: 'video_url',
    animated: true,
    style: { stroke: '#8b5cf6' },
  },

  // Convergence: LLM #1 → LLM #2 (user_message — passes the description)
  {
    id: 'edge-6',
    source: 'node-llm-1',
    target: 'node-llm-2',
    sourceHandle: 'output',
    targetHandle: 'user_message',
    animated: true,
    style: { stroke: '#8b5cf6' },
  },
  // Convergence: Extract Frame → LLM #2 (images — passes the frame)
  {
    id: 'edge-7',
    source: 'node-extract-frame-1',
    target: 'node-llm-2',
    sourceHandle: 'output',
    targetHandle: 'images',
    animated: true,
    style: { stroke: '#8b5cf6' },
  },
  // Convergence: System Prompt 2 → LLM #2
  {
    id: 'edge-8',
    source: 'node-text-system-2',
    target: 'node-llm-2',
    sourceHandle: 'output',
    targetHandle: 'system_prompt',
    animated: true,
    style: { stroke: '#8b5cf6' },
  },
  // Convergence: User Message 2 → LLM #2
  {
    id: 'edge-9',
    source: 'node-text-user-2',
    target: 'node-llm-2',
    sourceHandle: 'output',
    targetHandle: 'user_message',
    animated: true,
    style: { stroke: '#8b5cf6' },
  },
];
