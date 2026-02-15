import { create } from "zustand";
import type { Node, Edge } from "reactflow";

type Snapshot = {
  nodes: Node[];
  edges: Edge[];
};

type HistoryStore = {
  history: Snapshot[];
  index: number;
  push: (snapshot: Snapshot) => void;
  undo: () => Snapshot | null;
  redo: () => Snapshot | null;
};

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  history: [],
  index: -1,

  push: (snapshot) => {
    set((state) => {
      try {
        const newHistory = state.history.slice(0, state.index + 1);
        newHistory.push(snapshot);
        return {
          history: newHistory,
          index: newHistory.length - 1,
        };
      } catch (err) {
        console.error("historyStore.push error", err);
        return state;
      }
    });
  },

  undo: () => {
    const state = get();
    if (state.index <= 0) return null;

    const newIndex = state.index - 1;
    set({ index: newIndex });
    const s = get();
    return s.history?.[newIndex] ?? null;
  },

  redo: () => {
    const state = get();
    if (state.index >= state.history.length - 1) return null;

    const newIndex = state.index + 1;
    set({ index: newIndex });
    const s = get();
    return s.history?.[newIndex] ?? null;
  },
}));
