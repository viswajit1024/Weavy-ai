"use client";

import { ArrowRight, Info } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Props = {
  node: any;
  onClose: () => void;
  onUpdate: (patch: any) => void;
  onRun: () => void;
};

export default function LLMSidebar({
  node,
  onClose,
  onUpdate,
  onRun,
}: Props) {
  const data = node.data ?? {};

  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<null | { type: "info" | "error"; text: string }>(null);

  useEffect(() => {
    function onStart(e: Event) {
      const ev = e as CustomEvent<{ nodeId: string }>;
      if (ev?.detail?.nodeId === node.id) {
        setIsRunning(true);
        setIsLoading(false);
        setNotice({ type: "info", text: "Running..." });
      }
    }

    function onEnd(e: Event) {
      const ev = e as CustomEvent<{ nodeId: string } & Record<string, any>>;
      if (ev?.detail?.nodeId === node.id) {
        setIsRunning(false);
        setIsLoading(false);
        if (ev.detail.success) setNotice({ type: "info", text: "Run complete" });
        else setNotice({ type: "error", text: ev.detail.error || "Run failed" });
      }
    }

    window.addEventListener("llm-run-start", onStart);
    window.addEventListener("llm-run-end", onEnd);
    return () => {
      window.removeEventListener("llm-run-start", onStart);
      window.removeEventListener("llm-run-end", onEnd);
    };
  }, [node.id]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  const safeUpdate = useCallback((patch: any) => {
    try {
      onUpdate(patch);
    } catch (err: any) {
      console.error("LLMSidebar update error", err);
      setNotice({ type: "error", text: err?.message || "Update failed" });
    }
  }, [onUpdate]);

  const handleRun = useCallback(() => {
    setIsLoading(true);
    try {
      onRun();
    } catch (err: any) {
      console.error("LLMSidebar run error", err);
      setIsLoading(false);
      setNotice({ type: "error", text: err?.message || "Run failed" });
    }
  }, [onRun]);

  return (
    <aside
      className="
        w-[270px]
        h-screen
        bg-[#212126]
        border-l border-white/10
        text-white
        flex flex-col
      "
    >
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="text-xs font-medium">Any LLM</div>
        <div className="text-white text-sm">
         ✳︎ 1 
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        
        <div>
          <label className="flex items-center gap-1 text-xs text-white/60 mb-1">
            Model Name
            <Info size={12} className="text-white/30" />
          </label>

          <select
            value={data.model ?? "gemini-2.5-flash"}
            onChange={(e) => onUpdate({ model: e.target.value })}
            className="
              w-full
              border border-white/10
              rounded-md
              px-2 py-1.5
              text-sm
              focus:outline-none
              focus:border-cyan-400/60
              bg-[#353539]
            "
          >
            <option value="gemini-2.5-flash">
              google/gemini-2.5-flash
            </option>
            <option value="gemini-2.5-pro">
              google/gemini-2.5-pro
            </option>
            <option value="gemini-2.0-flash-lite">
              google/gemini-2.0-flash-lite
            </option>
            <option value="gemini-2.0-flash">
              google/gemini-2.0-flash
            </option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.thinking ?? false}
            onChange={(e) => onUpdate({ thinking: e.target.checked })}
            className="accent-cyan-400"
          />
          <span className="text-xs text-white/70 flex items-center gap-1">
            Thinking
            <Info size={12} className="text-white/30" />
          </span>
        </div>


        <div>
          <label className="flex items-center gap-1 text-xs text-white/60 mb-2">
            Temperature
            <Info size={12} className="text-white/30" />
          </label>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={data.temperature ?? 0.6}
              onChange={(e) =>
                onUpdate({ temperature: Number(e.target.value) })
              }
              className="flex-1 accent-white"
            />

            <div
              className="
                w-12
                text-center
                text-sm
                border border-white/10
                rounded-md
                py-1
              "
            >
              {(data.temperature ?? 0.6).toFixed(1)}
            </div>
          </div>
        </div>
      </div>


      <div className="border-t border-white/10 px-4 py-4 space-y-4">
      
        {(isLoading || notice) && (
          <div className="mb-2">
            {isLoading && <div className="rounded-md bg-black/60 text-white px-3 py-1 text-sm">Starting…</div>}
            {notice && (
              <div className={`mt-2 rounded-md px-3 py-1 text-sm ${notice.type === "error" ? "bg-red-700 text-white" : "bg-emerald-700 text-white"}`}>
                {notice.text}
              </div>
            )}
          </div>
        )}
        
        <div className="text-xs text-white/60">
          <div className="flex justify-between mb-1">
            <span>Runs</span>
            <span>1</span>
          </div>
          <div className="flex justify-between">
            <span>Total cost</span>
            <span className="text-white">✳︎ 1 credits</span>
          </div>
        </div>


        <button
          onClick={handleRun}
          disabled={isRunning || isLoading}
          className={`
            w-full
            ${isRunning || isLoading ? "bg-gray-700 text-white/60 cursor-not-allowed" : "bg-[#FCFFDC] text-black hover:bg-[#F5F8C6]"}
            rounded-md
            py-2
            text-sm
            font-medium
            flex items-center justify-center gap-2
          `}
        >
          <ArrowRight size={14} />
          {isRunning ? "Running" : "Run selected"}
        </button>
      </div>
    </aside>
  );
}
