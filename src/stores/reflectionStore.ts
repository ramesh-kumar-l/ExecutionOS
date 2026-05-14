import { create } from "zustand";
import type { ReflectionEntry, ReflectionType } from "@/types";
import * as reflectionCommands from "@/lib/commands/reflection";
import { useAppStore } from "./appStore";
import { parseInvokeError } from "@/lib/utils";

interface CreateReflectionInput {
  type: ReflectionType;
  content: Record<string, string>;
  mood?: number;
  energy?: number;
}

interface ReflectionState {
  entries: ReflectionEntry[];
  isLoading: boolean;

  loadEntries: () => Promise<void>;
  createEntry: (input: CreateReflectionInput) => Promise<ReflectionEntry | null>;
}

export const useReflectionStore = create<ReflectionState>((set) => ({
  entries: [],
  isLoading: false,

  loadEntries: async () => {
    set({ isLoading: true });
    try {
      const entries = await reflectionCommands.getReflections();
      set({ entries, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },

  createEntry: async (input) => {
    try {
      const entry = await reflectionCommands.createReflection(input);
      set((s) => ({ entries: [entry, ...s.entries] }));
      useAppStore.getState().addNotification({ type: "success", message: "Reflection saved." });
      return entry;
    } catch (err) {
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
      return null;
    }
  },
}));
