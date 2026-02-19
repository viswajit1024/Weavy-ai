"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, Copy, Download, Share2, Check } from "lucide-react";

type Props = {
  id: string;
  name: string;
  updatedAt: string;
  onRefresh: () => void;
};

type MenuItemProps = {
  icon?: React.ReactNode;
  children: string;
  onClick: () => void | Promise<void>;
  danger?: boolean;
  closeMenu: () => void;
};

function MenuItem({ icon, children, onClick, danger = false, closeMenu }: MenuItemProps) {
  const handle = useCallback(async () => {
    try {
      await onClick();
    } finally {
      closeMenu();
    }
  }, [onClick, closeMenu]);

  return (
    <button
      onClick={handle}
      className={`w-full px-3 py-2 flex items-center gap-2 text-left ${
        danger ? "text-red-400 hover:bg-red-500/10" : "text-white hover:bg-white/5"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

export default function WorkflowCard({ id, name, updatedAt, onRefresh }: Props) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(name);

  useEffect(() => setDraftName(name), [name]);

  // Close menu when clicking outside of it
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const el = menuRef.current;
      if (!el) return setMenu(null);
      if (e.target instanceof Node && !el.contains(e.target)) setMenu(null);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const formattedUpdated = useMemo(() => {
    try {
      return new Date(updatedAt).toLocaleString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return updatedAt;
    }
  }, [updatedAt]);

  const closeMenu = useCallback(() => setMenu(null), []);

  const handleDelete = useCallback(async () => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const res = await fetch("/api/workflow/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      json?.success && onRefresh();
    } catch (err) {
      console.error("Delete failed", err);
    }
  }, [id, name, onRefresh]);

  const saveRename = useCallback(async () => {
    const trimmed = draftName.trim();
    if (!trimmed || trimmed === name) {
      setIsRenaming(false);
      setDraftName(name);
      return;
    }

    try {
      const res = await fetch("/api/workflow/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: trimmed }),
      });
      const json = await res.json();
      if (json?.success) onRefresh();
      else setDraftName(name);
    } catch (err) {
      console.error("Rename failed", err);
      setDraftName(name);
    } finally {
      setIsRenaming(false);
    }
  }, [draftName, id, name, onRefresh]);

  const handleDuplicate = useCallback(async () => {
    try {
      const res = await fetch("/api/workflow/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      json?.success && onRefresh();
    } catch (err) {
      console.error("Duplicate failed", err);
    }
  }, [id, onRefresh]);

  const exportWorkflow = useCallback(async () => {
    try {
      const res = await fetch(`/api/workflow/export/${id}`);
      const json = await res.json();
      if (!json?.success) return;
      const blob = new Blob([JSON.stringify(json.workflow, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${json.workflow.name}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    }
  }, [id]);

  const handleOpen = useCallback(
    (e?: React.MouseEvent) => {
      router.push(`/workflow/${id}`);
    },
    [id, router]
  );

  return (
    <>
      <div
        onClick={handleOpen}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenu({ x: e.clientX, y: e.clientY });
        }}
        className="group w-[220px] cursor-pointer"
      >
        <div className="h-[200px] rounded-2xl bg-[#212126] border border-white/10 flex items-center justify-center transition group-hover:bg-[#424247]">
          <Share2 size={36} className="text-white/70" />
        </div>

        <div className="mt-3 px-1">
          {!isRenaming ? (
            <div className="text-sm font-medium text-white truncate hover:underline">{name}</div>
          ) : (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={() => {
                  setDraftName(name);
                  setIsRenaming(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveRename();
                  if (e.key === "Escape") {
                    setDraftName(name);
                    setIsRenaming(false);
                  }
                }}
                className="bg-transparent border-b-2 border-blue-500 text-sm text-white focus:outline-none w-full"
              />
              <button onClick={saveRename} className="text-blue-400 hover:text-blue-300 z-10">
                <Check size={16} />
              </button>
            </div>
          )}

          <div className="text-xs text-white/50 mt-0.5">Last edited {formattedUpdated}</div>
        </div>
      </div>

      {menu && (
        <div
          ref={menuRef}
          style={{ top: menu.y, left: menu.x }}
          className="fixed z-50 w-44 rounded-lg bg-[#1b1d26] border border-white/10 shadow-xl text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem onClick={() => router.push(`/workflow/${id}`)} closeMenu={closeMenu}>
            Open
          </MenuItem>
          <MenuItem icon={<Pencil size={14} />} onClick={() => setIsRenaming(true)} closeMenu={closeMenu}>
            Rename
          </MenuItem>
          <MenuItem icon={<Copy size={14} />} onClick={handleDuplicate} closeMenu={closeMenu}>
            Duplicate
          </MenuItem>

          <div className="h-px bg-white/10 my-1" />

          <MenuItem icon={<Trash2 size={14} />} onClick={handleDelete} closeMenu={closeMenu} danger>
            Delete
          </MenuItem>

          <div className="h-px bg-white/10 my-1" />

          <MenuItem icon={<Download size={14} />} onClick={exportWorkflow} closeMenu={closeMenu}>
            Export
          </MenuItem>
        </div>
      )}
    </>
  );
}
