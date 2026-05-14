import { create } from "zustand";
import * as executionCommands from "@/lib/commands/execution";
import { useAppStore } from "@/stores/appStore";
import type { TimeBlock } from "@/types";

function getMondayOfWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const d = new Date(now);
  d.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  return d.toISOString().slice(0, 10);
}

function addDaysToDate(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

interface WeeklyState {
  weekStart: string;
  blocksByDate: Record<string, TimeBlock[]>;
  isLoading: boolean;
  setWeekStart: (date: string) => void;
  loadWeek: (weekStart: string) => Promise<void>;
  addBlockForDate: (date: string, block: TimeBlock) => void;
}

export const useWeeklyStore = create<WeeklyState>((set, get) => ({
  weekStart: getMondayOfWeek(),
  blocksByDate: {},
  isLoading: false,

  setWeekStart: (date: string) => {
    set({ weekStart: date });
    void get().loadWeek(date);
  },

  loadWeek: async (weekStart: string) => {
    set({ isLoading: true });
    try {
      const endDate = addDaysToDate(weekStart, 6);
      const blocks = await executionCommands.getTimeBlocksRange(weekStart, endDate);
      const byDate: Record<string, TimeBlock[]> = {};
      for (let i = 0; i < 7; i++) byDate[addDaysToDate(weekStart, i)] = [];
      for (const block of blocks) {
        (byDate[block.date] ??= []).push(block);
      }
      set({ blocksByDate: byDate, isLoading: false });
    } catch (err) {
      useAppStore.getState().addNotification({ type: "error", message: String(err) });
      set({ isLoading: false });
    }
  },

  addBlockForDate: (date: string, block: TimeBlock) => {
    set((s) => ({
      blocksByDate: {
        ...s.blocksByDate,
        [date]: [...(s.blocksByDate[date] ?? []), block].sort((a, b) =>
          a.start_time.localeCompare(b.start_time)
        ),
      },
    }));
  },
}));
