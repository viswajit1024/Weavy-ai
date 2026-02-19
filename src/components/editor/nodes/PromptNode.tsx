"use client";

import { Handle, Position, type NodeProps, useReactFlow } from "reactflow";
import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";

export default function PromptNode({ id, data, selected }: NodeProps) {
  const { setNodes } = useReactFlow();

  const [localText, setLocalText] = useState<string>(data?.text ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setLocalText(data?.text ?? "");
  }, [data?.text]);

  const persist = useCallback(async (value: string) => {
    setIsSaving(true);
    try {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, text: value } } : node
        )
      );


      setNotice("Saved");
      window.setTimeout(() => setNotice(null), 1200);
    } catch (err) {
      console.error("Failed to persist node text", err);
      setNotice("Save failed");
    } finally {
      setIsSaving(false);
    }
  }, [id, setNodes]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalText(value);


    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void persist(value);
    }, 600);
  }, [persist]);

  const handleBlur = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
      void persist(localText);
    }
  }, [localText, persist]);


  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);




  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={clsx(
        "relative w-[360px] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)]",
        selected ? "bg-[#2B2B2F]" : " bg-[#212126]"
      )}
    >

      <div className="flex items-center justify-between gap-2 px-4 py-3 text-[14px] ">
        <div>Prompt</div>
        <div className="text-xs text-white/60">
          {isSaving ? "Saving…" : notice ?? ""}
        </div>
      </div>

      <div className="px-4 pb-4">
        <textarea
          value={localText}
          placeholder="Write your prompt here..."
          onChange={handleChange}
          onBlur={handleBlur}
          onPointerDownCapture={(e) => e.stopPropagation()}
          onMouseDownCapture={(e) => e.stopPropagation()}
          onTouchStartCapture={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="w-full min-h-[140px] resize-none rounded-xl px-4 py-3 text-[16px] leading-[24px] text-white  placeholder:text-white/40 focus:outline-none bg-[#353539]"
        />
      </div>


      {isHovered && (
        <div aria-hidden className="pointer-events-none">
          <div
            style={{ top: "50%", right: -92, transform: "translateY(-50%)" }}
            className="absolute flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <div className="rounded-md bg-black/60 text-white text-xs px-2 py-1">Output</div>
          </div>
        </div>
      )}

      <Handle
        id="text"
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-purple-400 rounded-full"
      />

    </div>
  );
}
