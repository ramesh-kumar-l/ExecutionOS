import { create } from "zustand";
import type { Goal, CreateGoalInput, UpdateGoalInput } from "@/types";
import * as goalCommands from "@/lib/commands/goals";
import { useAppStore } from "./appStore";
import { parseInvokeError } from "@/lib/utils";

interface GoalsFilter {
  domain_id?: string;
  status?: Goal["status"];
}

interface GoalsState {
  goals: Goal[];
  activeGoalId: string | null;
  filter: GoalsFilter;
  isLoading: boolean;

  loadGoals: (filter?: GoalsFilter) => Promise<void>;
  createGoal: (input: CreateGoalInput) => Promise<Goal | null>;
  updateGoal: (input: UpdateGoalInput) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  setActiveGoal: (id: string | null) => void;
  setFilter: (filter: GoalsFilter) => void;
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  activeGoalId: null,
  filter: {},
  isLoading: false,

  loadGoals: async (filter) => {
    const activeFilter = filter ?? get().filter;
    set({ isLoading: true, filter: activeFilter });
    try {
      const goals = await goalCommands.getGoals(activeFilter);
      set({ goals, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },

  createGoal: async (input) => {
    try {
      const goal = await goalCommands.createGoal(input);
      set((s) => ({ goals: [goal, ...s.goals] }));
      return goal;
    } catch (err) {
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
      return null;
    }
  },

  updateGoal: async (input) => {
    // Optimistic update
    set((s) => ({
      goals: s.goals.map((g) =>
        g.id === input.id ? { ...g, ...input } : g
      ),
    }));
    try {
      const updated = await goalCommands.updateGoal(input);
      set((s) => ({
        goals: s.goals.map((g) => (g.id === updated.id ? updated : g)),
      }));
    } catch (err) {
      await get().loadGoals();
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },

  deleteGoal: async (id) => {
    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
    try {
      await goalCommands.deleteGoal(id);
    } catch (err) {
      await get().loadGoals();
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },

  setActiveGoal: (id) => set({ activeGoalId: id }),
  setFilter: (filter) => set({ filter }),
}));
