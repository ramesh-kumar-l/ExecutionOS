import { create } from "zustand";
import type { TimeBlock, CreateTimeBlockInput } from "@/types";
import * as executionCommands from "@/lib/commands/execution";
import { useAppStore } from "./appStore";
import { parseInvokeError, todayIso } from "@/lib/utils";

interface ExecutionState {
  blocks: TimeBlock[];
  currentDate: string;
  isLoading: boolean;

  loadBlocks: (date?: string) => Promise<void>;
  createBlock: (input: CreateTimeBlockInput) => Promise<TimeBlock | null>;
  completeBlock: (id: string) => Promise<void>;
  skipBlock: (id: string) => Promise<void>;
}

export const useExecutionStore = create<ExecutionState>((set, get) => ({
  blocks: [],
  currentDate: todayIso(),
  isLoading: false,

  loadBlocks: async (date) => {
    const d = date ?? get().currentDate;
    set({ isLoading: true, currentDate: d });
    try {
      const blocks = await executionCommands.getTimeBlocks(d);
      set({ blocks, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },

  createBlock: async (input) => {
    try {
      const block = await executionCommands.createTimeBlock(input);
      set((s) => ({
        blocks: [...s.blocks, block].sort((a, b) =>
          a.start_time.localeCompare(b.start_time)
        ),
      }));
      return block;
    } catch (err) {
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
      return null;
    }
  },

  completeBlock: async (id) => {
    set((s) => ({
      blocks: s.blocks.map((b) =>
        b.id === id ? { ...b, status: "completed" as const } : b
      ),
    }));
    try {
      await executionCommands.completeTimeBlock(id);
    } catch (err) {
      await get().loadBlocks();
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },

  skipBlock: async (id) => {
    set((s) => ({
      blocks: s.blocks.map((b) =>
        b.id === id ? { ...b, status: "skipped" as const } : b
      ),
    }));
    try {
      await executionCommands.skipTimeBlock(id);
    } catch (err) {
      await get().loadBlocks();
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },
}));
