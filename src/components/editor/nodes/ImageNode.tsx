"use client";

import {
  Handle,
  Position,
  type NodeProps,
  useReactFlow,
} from "reactflow";
import { Image as ImageIcon, Plus, X } from "lucide-react";
import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";

export default function ImageNode({ id, data, selected }: NodeProps) {
  const { setNodes } = useReactFlow();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const readerRef = useRef<FileReader | null>(null);

  useEffect(() => {
    return () => {
      if (readerRef.current) {
        try {
          readerRef.current.onload = null;
          readerRef.current.onerror = null;
        } catch {}
        readerRef.current = null;
      }
    };
  }, []);

  const onFileSelect = useCallback((file: File) => {
    setIsProcessing(true);
    setNotice(null);

    const reader = new FileReader();
    readerRef.current = reader;

    reader.onload = () => {
      try {
        const base64 = reader.result as string;

        setNodes((nds) =>
          nds.map((node) =>
            node.id === id
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    imageBase64: base64.split(",")[1], 
                    mimeType: file.type,
                    previewUrl: base64,
                  },
                }
              : node
          )
        );

        setNotice("Image added");
      } catch (err) {
        console.error("Failed to set image", err);
        setNotice("Failed to process image");
      } finally {
        setIsProcessing(false);
        readerRef.current = null;
      }
    };

    reader.onerror = (err) => {
      console.error("FileReader error", err);
      setNotice("Failed to read file");
      setIsProcessing(false);
      readerRef.current = null;
    };

    try {
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("readAsDataURL failed", err);
      setNotice("Failed to read file");
      setIsProcessing(false);
      readerRef.current = null;
    }
  }, [id, setNodes]);

  const clearImage = useCallback(() => {
    try {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {},
              }
            : node
        )
      );
      setNotice("Image cleared");
    } catch (err) {
      console.error("Failed to clear image", err);
      setNotice("Failed to clear image");
    }
  }, [id, setNodes]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={clsx(
        "relative w-[360px] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)]",
        selected ? "bg-[#2B2B2F]" : " bg-[#212126]"
      )}
    >

      <div className="flex items-center gap-2 px-3 py-2 text-[14px] ">
        <ImageIcon size={14} className="text-green-400" />
        Image
        <div className="ml-auto text-xs text-white/60">{isProcessing ? "Processing…" : notice ?? ""}</div>
      </div>


      <div className="p-3">
        <label
          className="
            relative
            h-[160px]
            rounded-xl
            bg-[#353539]
            focus:bg-[#353539]
            flex items-center justify-center
            cursor-pointer
            overflow-hidden
          "
        >
          {data?.previewUrl ? (
            <>
              <img
                src={data.previewUrl}
                alt="Uploaded"
                className="object-cover w-full h-full"
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  clearImage();
                }}
                className="absolute top-2 right-2 bg-black/60 rounded-full p-1 hover:bg-black/80"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-white/50">
              <Plus size={18} />
              <span className="text-xs">Add image</span>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelect(file);
            }}
          />
        </label>
      </div>


      <Handle
        id="image"
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-400 rounded-full"
      />

      {isHovered && (
        <div aria-hidden className="pointer-events-none">
          <div
            style={{ top: "50%", right: -92, transform: "translateY(-50%)" }}
            className="absolute flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <div className="rounded-md bg-black/60 text-white text-xs px-2 py-1">Image</div>
          </div>
        </div>
      )}

    </div>
  );
}
