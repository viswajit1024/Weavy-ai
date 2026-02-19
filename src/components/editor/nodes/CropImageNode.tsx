"use client";

import { Handle, Position, type NodeProps, useReactFlow } from "reactflow";
import { Crop, Play, Loader2 } from "lucide-react";
import clsx from "clsx";
import { useCallback, useState } from "react";

// Client-side image crop using Canvas API
function cropImageClientSide(
  imageSrc: string,
  xPct: number,
  yPct: number,
  wPct: number,
  hPct: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const sx = Math.round((xPct / 100) * img.naturalWidth);
        const sy = Math.round((yPct / 100) * img.naturalHeight);
        const sw = Math.round((wPct / 100) * img.naturalWidth);
        const sh = Math.round((hPct / 100) * img.naturalHeight);

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(sw, 1);
        canvas.height = Math.max(sh, 1);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image for cropping"));
    img.src = imageSrc;
  });
}

export default function CropImageNode({ id, data, selected }: NodeProps) {
  const { setNodes, getNodes, getEdges } = useReactFlow();
  const [isRunning, setIsRunning] = useState(false);

  // Get connected image URL from source node
  const resolveImageUrl = useCallback(() => {
    const edges = getEdges();
    const nodes = getNodes();

    // First try to find edge connected to image_url handle
    let imageEdge = edges.find((e) => e.target === id && e.targetHandle === "image_url");

    // If not found, look for any edge to this node from an image-providing source
    if (!imageEdge) {
      imageEdge = edges.find((e) => {
        if (e.target !== id) return false;
        const srcNode = nodes.find((n) => n.id === e.source);
        return srcNode?.data?.previewUrl || srcNode?.data?.imageBase64 || srcNode?.data?.outputImageUrl;
      });
    }

    if (!imageEdge) return null;

    const sourceNode = nodes.find((n) => n.id === imageEdge.source);
    if (!sourceNode) return null;

    if (sourceNode.data?.outputImageUrl) return sourceNode.data.outputImageUrl;
    if (sourceNode.data?.previewUrl) return sourceNode.data.previewUrl;
    if (sourceNode.data?.imageBase64) {
      const mimeType = sourceNode.data.mimeType || "image/jpeg";
      return `data:${mimeType};base64,${sourceNode.data.imageBase64}`;
    }
    return null;
  }, [id, getEdges, getNodes]);

  const updateData = useCallback(
    (updates: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, ...updates } } : node
        )
      );
    },
    [id, setNodes]
  );

  const handleCrop = useCallback(async () => {
    setIsRunning(true);
    updateData({ error: undefined, outputImageUrl: undefined });

    try {
      const imageUrl = resolveImageUrl();
      if (!imageUrl) {
        throw new Error("No image connected. Connect an image node to image_url input.");
      }

      const croppedDataUrl = await cropImageClientSide(
        imageUrl,
        Number(data.x ?? 0),
        Number(data.y ?? 0),
        Number(data.width ?? 100),
        Number(data.height ?? 100)
      );

      updateData({ outputImageUrl: croppedDataUrl });
    } catch (error) {
      updateData({ error: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      setIsRunning(false);
    }
  }, [id, data.x, data.y, data.width, data.height, resolveImageUrl, updateData]);

  const imageUrl = resolveImageUrl();

  return (
    <div
      className={clsx(
        "relative w-[300px] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)]",
        selected ? "bg-[#2B2B2F]" : "bg-[#212126]"
      )}
    >
      {/* Input Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="image_url"
        style={{ top: "20%" }}
        className="!w-3 !h-3 !bg-green-500 !border-green-400"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="x_percent"
        style={{ top: "35%" }}
        className="!w-3 !h-3 !bg-orange-500 !border-orange-400"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="y_percent"
        style={{ top: "50%" }}
        className="!w-3 !h-3 !bg-orange-500 !border-orange-400"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="width_percent"
        style={{ top: "65%" }}
        className="!w-3 !h-3 !bg-orange-500 !border-orange-400"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="height_percent"
        style={{ top: "80%" }}
        className="!w-3 !h-3 !bg-orange-500 !border-orange-400"
      />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 text-[14px]">
        <Crop size={14} className="text-yellow-400" />
        Crop Image
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleCrop}
            disabled={isRunning}
            className="text-green-400 hover:text-green-300 transition-colors p-1 disabled:opacity-50"
            title="Run crop"
          >
            {isRunning ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Play size={14} />
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-3">
        {/* Handle labels */}
        <div className="space-y-1 text-[10px] text-white/60">
          <div className="flex items-center gap-2">
            <div className={clsx("w-2 h-2 rounded-full", imageUrl ? "bg-green-500" : "bg-[#333]")} />
            image_url
          </div>
        </div>

        {/* Crop params */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-white/60 mb-0.5 block">X %</label>
            <input
              type="number"
              value={data.x ?? 0}
              onChange={(e) => updateData({ x: Number(e.target.value) })}
              min={0}
              max={100}
              className="nodrag w-full bg-[#0a0a0a] border border-[#222] rounded px-2 py-1 text-xs text-white outline-none focus:border-purple-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-white/60 mb-0.5 block">Y %</label>
            <input
              type="number"
              value={data.y ?? 0}
              onChange={(e) => updateData({ y: Number(e.target.value) })}
              min={0}
              max={100}
              className="nodrag w-full bg-[#0a0a0a] border border-[#222] rounded px-2 py-1 text-xs text-white outline-none focus:border-purple-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-white/60 mb-0.5 block">Width %</label>
            <input
              type="number"
              value={data.width ?? 100}
              onChange={(e) => updateData({ width: Number(e.target.value) })}
              min={0}
              max={100}
              className="nodrag w-full bg-[#0a0a0a] border border-[#222] rounded px-2 py-1 text-xs text-white outline-none focus:border-purple-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-white/60 mb-0.5 block">Height %</label>
            <input
              type="number"
              value={data.height ?? 100}
              onChange={(e) => updateData({ height: Number(e.target.value) })}
              min={0}
              max={100}
              className="nodrag w-full bg-[#0a0a0a] border border-[#222] rounded px-2 py-1 text-xs text-white outline-none focus:border-purple-500/50"
            />
          </div>
        </div>

        {/* Preview */}
        {imageUrl && (
          <div className="rounded-lg overflow-hidden border border-[#222]">
            <img src={imageUrl} alt="Input" className="w-full h-20 object-cover" />
          </div>
        )}

        {/* Output */}
        {data.outputImageUrl && (
          <div>
            <label className="text-[10px] text-green-400 mb-1 block">Cropped Output</label>
            <div className="rounded-lg overflow-hidden border border-green-500/20">
              <img src={data.outputImageUrl} alt="Cropped" className="w-full h-20 object-contain bg-black" />
            </div>
          </div>
        )}

        {/* Error */}
        {data.error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
            <p className="text-xs text-red-400">{data.error}</p>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!w-3 !h-3 !bg-yellow-500 !border-yellow-400"
      />
    </div>
  );
}
