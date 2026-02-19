"use client";

import { Plus, Folder } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomeSidebar() {
  const router = useRouter();

  return (
    <aside className="hidden min-[750px]:block w-[240px] bg-[#0E0E13] border-r border-white/5 p-4">
      <div
        className="cursor-pointer w-full flex items-center justify-center gap-2
          rounded-md bg-lime-200 text-black
          text-sm font-medium py-2
          hover:bg-lime-300"
        onClick={() => router.push("/workflow/new")}
      >
        <Plus size={16} />
        Create New File
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/5 text-sm">
          <Folder size={16} />
          My Files
        </div>
      </div>
    </aside>
  );
}
