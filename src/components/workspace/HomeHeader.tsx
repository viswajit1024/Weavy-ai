"use client";

import { Plus, Upload, Settings, Sparkles, FileBox } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

export default function HomeHeader() {
  const router = useRouter();
  const [creatingDemo, setCreatingDemo] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const json = JSON.parse(text);

    const res = await fetch("/api/workflow/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(json),
    });

    const data = await res.json();

    if (data.success) {
      router.push(`/workflow/${data.workflowId}`);
    }
  }

  async function handleCreateSample() {
    setCreatingDemo(true);
    try {
      const res = await fetch("/api/workflow/sample", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/workflow/${data.workflow.id}`);
      }
    } catch (err) {
      console.error("Failed to create sample workflow", err);
    } finally {
      setCreatingDemo(false);
    }
  }

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-white/5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-bold text-white">
          weavy<span className="text-[#8b5cf6]">.ai</span>
        </span>
      </div>

      <h1 className="text-lg font-medium">My Workspace</h1>

      <div className="flex items-center gap-3">
        <button
          onClick={handleCreateSample}
          disabled={creatingDemo}
          className="flex items-center gap-2 rounded-md bg-purple-500/20 text-purple-300 text-sm font-medium px-4 py-2 hover:bg-purple-500/30 disabled:opacity-50"
        >
          <FileBox size={16} />
          {creatingDemo ? "Creating..." : "Try Sample Workflow"}
        </button>

        <label className="cursor-pointer flex items-center gap-2 rounded-md bg-lime-200 text-black text-sm font-medium py-2 px-3 hover:bg-lime-300">
          <Upload size={16} />
          <span>Import workflow</span>
          <input type="file" accept=".json" hidden onChange={handleFile} />
        </label>

        <button
          onClick={() => router.push("/workflow/new")}
          className="flex items-center gap-2 rounded-md bg-lime-200 text-black text-sm font-medium px-4 py-2 hover:bg-lime-300"
        >
          <Plus size={16} />
          Create New File
        </button>

        <Link
          href="/settings"
          className="text-[#a0a0a0] hover:text-white p-2 rounded-lg hover:bg-[#141414] transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Link>

        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
