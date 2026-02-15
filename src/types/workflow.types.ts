import type { Node, Edge } from '@xyflow/react';

// ============================================================================
// Node Data Types
// ============================================================================

export interface TextNodeData {
  text: string;
  label: string;
  isLocked?: boolean;
  isProcessing?: boolean;
  [key: string]: unknown;
}

export interface ImageItem {
  imageUrl: string;
  fileName?: string;
}

export interface ImageNodeData {
  images: ImageItem[];
  currentIndex: number;
  viewMode: 'single' | 'grid';
  label: string;
  isLocked?: boolean;
  isProcessing?: boolean;
  [key: string]: unknown;
}

export interface VideoNodeData {
  videoUrl?: string;
  fileName?: string;
  label: string;
  isLocked?: boolean;
  isProcessing?: boolean;
  [key: string]: unknown;
}

export interface LLMNodeData {
  model: GeminiModel;
  result?: string;
  error?: string;
  label: string;
  isLocked?: boolean;
  isProcessing?: boolean;
  [key: string]: unknown;
}

export interface CropImageNodeData {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: 'custom' | '16:9' | '4:3' | '1:1' | '9:16' | '3:4';
  inputImageUrl?: string;
  outputImageUrl?: string;
  error?: string;
  label: string;
  isLocked?: boolean;
  isProcessing?: boolean;
  [key: string]: unknown;
}

export interface ExtractFrameNodeData {
  timestamp: number;
  frameNumber?: number;
  videoDuration?: number;
  inputVideoUrl?: string;
  outputFrameUrl?: string;
  error?: string;
  label: string;
  isLocked?: boolean;
  isProcessing?: boolean;
  [key: string]: unknown;
}

// ============================================================================
// Node Type Unions
// ============================================================================

export type TextFlowNode = Node<TextNodeData, 'text'>;
export type ImageFlowNode = Node<ImageNodeData, 'uploadImage'>;
export type VideoFlowNode = Node<VideoNodeData, 'uploadVideo'>;
export type LLMFlowNode = Node<LLMNodeData, 'llm'>;
export type CropImageFlowNode = Node<CropImageNodeData, 'cropImage'>;
export type ExtractFrameFlowNode = Node<ExtractFrameNodeData, 'extractFrame'>;

export type WorkflowNode =
  | TextFlowNode
  | ImageFlowNode
  | VideoFlowNode
  | LLMFlowNode
  | CropImageFlowNode
  | ExtractFrameFlowNode;

export type WorkflowEdge = Edge;

// ============================================================================
// Handle Definitions
// ============================================================================

export const LLM_HANDLES = {
  SYSTEM_PROMPT: 'system_prompt',
  USER_MESSAGE: 'user_message',
  IMAGES: 'images',
  OUTPUT: 'output',
} as const;

export const CROP_IMAGE_HANDLES = {
  IMAGE_URL: 'image_url',
  X_PERCENT: 'x_percent',
  Y_PERCENT: 'y_percent',
  WIDTH_PERCENT: 'width_percent',
  HEIGHT_PERCENT: 'height_percent',
  OUTPUT: 'output',
} as const;

export const EXTRACT_FRAME_HANDLES = {
  VIDEO_URL: 'video_url',
  TIMESTAMP: 'timestamp',
  OUTPUT: 'output',
} as const;

// ============================================================================
// Gemini Models
// ============================================================================

export type GeminiModel =
  | 'gemini-2.5-flash'
  | 'gemini-1.5-flash'
  | 'gemini-1.5-pro'
  | 'gemini-1.0-pro';

export const GEMINI_MODELS: { value: GeminiModel; label: string }[] = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { value: 'gemini-1.0-pro', label: 'Gemini 1.0 Pro' },
];

// ============================================================================
// Workflow History Types
// ============================================================================

export type RunTaskStatus = 'running' | 'completed' | 'failed';
export type RunScope = 'full' | 'selected' | 'single';
export type RunStatus = 'running' | 'completed' | 'failed' | 'partial';

export interface NodeRunResult {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  status: RunTaskStatus;
  duration?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: RunStatus;
  scope: RunScope;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  nodeResults: NodeRunResult[];
}

// ============================================================================
// Node Type Definition
// ============================================================================

export type NodeType = 'text' | 'uploadImage' | 'uploadVideo' | 'cropImage' | 'extractFrame' | 'llm';

export function getDefaultNodeData(
  type: NodeType
): TextNodeData | ImageNodeData | VideoNodeData | CropImageNodeData | ExtractFrameNodeData | LLMNodeData {
  switch (type) {
    case 'text':
      return { text: '', label: 'Text' };
    case 'uploadImage':
      return { images: [], currentIndex: 0, viewMode: 'single' as const, label: 'Upload Image' };
    case 'uploadVideo':
      return { label: 'Upload Video' };
    case 'cropImage':
      return {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        aspectRatio: 'custom' as const,
        label: 'Crop Image',
      };
    case 'extractFrame':
      return { timestamp: 0, label: 'Extract Frame' };
    case 'llm':
      return { model: 'gemini-2.5-flash' as GeminiModel, label: 'Run Any LLM' };
  }
}
