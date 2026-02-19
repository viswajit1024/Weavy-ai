"use client";

import { Handle, Position, type NodeProps } from "reactflow";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";

export default function RunLLMNode({ id, data, selected }: NodeProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // listen for global start/end events for this node
    useEffect(() => {
        function onStart(e: Event) {
            const ev = e as CustomEvent<{ nodeId: string }>;
            if (ev?.detail?.nodeId === id) setIsRunning(true);
        }

        function onEnd(e: Event) {
            const ev = e as CustomEvent<{ nodeId: string } & Record<string, any>>;
            if (ev?.detail?.nodeId === id) setIsRunning(false);
        }

        window.addEventListener("llm-run-start", onStart);
        window.addEventListener("llm-run-end", onEnd);
        return () => {
            window.removeEventListener("llm-run-start", onStart);
            window.removeEventListener("llm-run-end", onEnd);
        };
    }, [id]);

    const handleRun = useCallback(() => {
        setIsRunning(true);
        window.dispatchEvent(
            new CustomEvent("run-llm-node", {
                detail: { nodeId: id },
            })
        );
    }, [id]);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={clsx(
                "relative w-[360px] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)]",
                selected
                    ? "bg-[#2B2B2F]"
                    : " bg-[#212126]"
            )}
        >
            <div className="flex items-center gap-2 px-3 py-2 text-[14px]">
                <div>Any LLM</div>
                <div className="ml-auto text-xs text-white/60">{isRunning ? "Running…" : ""}</div>
            </div>

            <div className="p-3">
                <div
                    role="region"
                    aria-label="LLM output"
                    onPointerDownCapture={(e) => e.stopPropagation()}
                    onMouseDownCapture={(e) => e.stopPropagation()}
                    onTouchStartCapture={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className="w-full h-50 
                    max-h-125 overflow-auto rounded-xl px-4 py-3 text-[12px] font-medium 
                    leading-5 text-white/40 bg-[#353539] whitespace-pre-wrap 
                    wrap-break-words select-text cursor-text"
                >
                    {data?.output || "The generated text will appear here"}
                </div>
            </div>

            <div className="flex justify-end px-3 py-2">
                <button
                    onClick={handleRun}
                    disabled={isRunning}
                    aria-busy={isRunning}
                    className={clsx("flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs", 
                        isRunning 
                        ? "bg-gray-700 text-white/60 cursor-not-allowed" 
                        : "hover:bg-[#323237]"
                    )}
                >
                    <ArrowRight size={12} />
                    {isRunning ? "Running" : "Run Model"}
                </button>
            </div>

            <Handle
                id="text"
                type="target"
                position={Position.Left}
                style={{ top: "35%" }}
                className="w-3 h-3 bg-green-400 rounded-full"
            />

            <Handle
                id="system"
                type="target"
                position={Position.Left}
                style={{ top: "50%" }}
                className="w-3 h-3 bg-yellow-400 rounded-full"
            />

            <Handle
                id="image"
                type="target"
                position={Position.Left}
                style={{ top: "65%" }}
                className="w-3 h-3 bg-cyan-400 rounded-full"
            />

            {isHovered && (
                <div aria-hidden className="pointer-events-none">
                    <div style={{ top: "35%", left: -92, transform: "translateY(-50%)" }} className="absolute flex items-center gap-2">
                        <div className="rounded-md bg-black/60 text-white text-xs px-2 py-1">Prompt</div>
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                    </div>

                    <div style={{ top: "50%", left: -92, transform: "translateY(-50%)" }} className="absolute flex items-center gap-2">
                        <div className="rounded-md bg-black/60 text-white text-xs px-2 py-1">System</div>
                        <span className="w-2 h-2 rounded-full bg-yellow-400" />
                    </div>

                    <div style={{ top: "65%", left: -84, transform: "translateY(-50%)" }} className="absolute flex items-center gap-2">
                        <div className="rounded-md bg-black/60 text-white text-xs px-2 py-1">Image</div>
                        <span className="w-2 h-2 rounded-full  bg-green-400" />
                    </div>
                </div>
            )}

            <Handle
                id="text"
                type="source"
                position={Position.Right}
                className="w-3 h-3 bg-cyan-400 rounded-full"
            />
        </div>
    );
}
