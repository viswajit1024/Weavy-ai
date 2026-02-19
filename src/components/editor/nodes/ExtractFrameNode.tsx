"use client";

import { Handle, Position, type NodeProps, useReactFlow } from "reactflow";
import { Film, Play, Loader2 } from "lucide-react";
import clsx from "clsx";
import { useCallback, useState } from "react";

// Client-side frame extraction using Canvas + Video element
function extractFrameClientSide(
  videoSrc: string,
  timestamp: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.preload = "auto";

    video.onloadedmetadata = () => {
      // Clamp timestamp to video duration
      const seekTo = Math.min(timestamp, video.duration || 0);
      video.currentTime = seekTo;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };

    video.onerror = () => reject(new Error("Failed to load video for frame extraction"));
    video.src = videoSrc;
  });
}

export default function ExtractFrameNode({ id, data, selected }: NodeProps) {
  const { setNodes, getNodes, getEdges } = useReactFlow();
  const [isRunning, setIsRunning] = useState(false);

  // Get connected video URL from source node
  const resolveVideoUrl = useCallback(() => {
    const edges = getEdges();
    const nodes = getNodes();

    // First try to find edge connected to video_url handle
    let videoEdge = edges.find((e) => e.target === id && e.targetHandle === "video_url");

    // If not found, look for any edge to this node from a video-providing source
    if (!videoEdge) {
      videoEdge = edges.find((e) => {
        if (e.target !== id) return false;
        const srcNode = nodes.find((n) => n.id === e.source);
        return srcNode?.data?.videoUrl;
      });
    }

    if (!videoEdge) return null;

    const sourceNode = nodes.find((n) => n.id === videoEdge.source);
    if (!sourceNode) return null;

    return sourceNode.data?.videoUrl || null;
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

  const handleExtract = useCallback(async () => {
    setIsRunning(true);
    updateData({ error: undefined, outputFrameUrl: undefined });

    try {
      const videoUrl = resolveVideoUrl();
      if (!videoUrl) {
        throw new Error("No video connected. Connect a Video Upload node to video_url input.");
      }

      const frameDataUrl = await extractFrameClientSide(
        videoUrl,
        Number(data.timestamp ?? 0)
      );

      updateData({ outputFrameUrl: frameDataUrl });
    } catch (error) {
      updateData({ error: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      setIsRunning(false);
    }
  }, [id, data.timestamp, resolveVideoUrl, updateData]);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const videoUrl = resolveVideoUrl();

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
        id="video_url"
        style={{ top: "30%" }}
        className="!w-3 !h-3 !bg-purple-500 !border-purple-400"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="timestamp"
        style={{ top: "60%" }}
        className="!w-3 !h-3 !bg-orange-500 !border-orange-400"
      />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 text-[14px]">
        <Film size={14} className="text-pink-400" />
        Extract Frame
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleExtract}
            disabled={isRunning}
            className="text-green-400 hover:text-green-300 transition-colors p-1 disabled:opacity-50"
            title="Extract frame"
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
            <div className={clsx("w-2 h-2 rounded-full", videoUrl ? "bg-purple-500" : "bg-[#333]")} />
            video_url
          </div>
        </div>

        {/* Timestamp input */}
        <div>
          <label className="text-[10px] text-white/60 mb-1 block">Timestamp (seconds)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={data.timestamp ?? 0}
              onChange={(e) => updateData({ timestamp: Number(e.target.value) })}
              min={0}
              step={0.1}
              className="nodrag flex-1 bg-[#0a0a0a] border border-[#222] rounded px-2 py-1 text-xs text-white outline-none focus:border-purple-500/50"
            />
            <span className="text-xs text-white/40 font-mono">{formatTime(data.timestamp ?? 0)}</span>
          </div>
          <input
            type="range"
            value={data.timestamp ?? 0}
            onChange={(e) => updateData({ timestamp: Number(e.target.value) })}
            min={0}
            max={300}
            step={0.1}
            className="nodrag w-full mt-2 accent-purple-500 h-1"
          />
        </div>

        {/* Video preview */}
        {videoUrl && (
          <div>
            <label className="text-[10px] text-white/60 mb-1 block">Source Video</label>
            <div className="rounded-lg overflow-hidden border border-[#222] bg-black">
              <video src={videoUrl} className="w-full h-16 object-cover" muted />
            </div>
          </div>
        )}

        {/* Output frame */}
        {data.outputFrameUrl && (
          <div>
            <label className="text-[10px] text-green-400 mb-1 block">Extracted Frame</label>
            <div className="rounded-lg overflow-hidden border border-green-500/20">
              <img src={data.outputFrameUrl} alt="Extracted frame" className="w-full h-20 object-contain bg-black" />
            </div>
          </div>
        )}

        {/* Error */}
        {data.error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
            <p className="text-xs text-red-400">{data.error}</p>
          </div>
        )}

        {/* Loading */}
        {isRunning && (
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Loader2 size={14} className="animate-spin text-purple-500" />
            <span>Extracting frame...</span>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!w-3 !h-3 !bg-pink-500 !border-pink-400"
      />
    </div>
  );
}
