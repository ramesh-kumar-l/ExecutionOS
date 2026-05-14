import { create } from "zustand";
import type { Goal, Milestone, CreateGoalInput, UpdateGoalInput } from "@/types";
import * as goalCommands from "@/lib/commands/goals";
import { useAppStore } from "./appStore";
import { parseInvokeError } from "@/lib/utils";

interface GoalsFilter {
  domain_id?: string;
  status?: Goal["status"];
}

interface GoalsState {
  goals: Goal[];
  milestones: Record<string, Milestone[]>;
  activeGoalId: string | null;
  filter: GoalsFilter;
  isLoading: boolean;
  loadingMilestones: Record<string, boolean>;

  loadGoals: (filter?: GoalsFilter) => Promise<void>;
  createGoal: (input: CreateGoalInput) => Promise<Goal | null>;
  updateGoal: (input: UpdateGoalInput) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  setActiveGoal: (id: string | null) => void;
  setFilter: (filter: GoalsFilter) => void;

  loadMilestones: (goalId: string) => Promise<void>;
  addMilestone: (goalId: string, title: string, targetDate?: string) => Promise<void>;
  completeMilestone: (milestoneId: string, goalId: string) => Promise<void>;
  deleteMilestone: (milestoneId: string, goalId: string) => Promise<void>;
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  milestones: {},
  activeGoalId: null,
  filter: {},
  isLoading: false,
  loadingMilestones: {},

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
    set((s) => ({
      goals: s.goals.map((g) => (g.id === input.id ? { ...g, ...input } : g)),
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

  loadMilestones: async (goalId) => {
    if (get().loadingMilestones[goalId]) return;
    set((s) => ({ loadingMilestones: { ...s.loadingMilestones, [goalId]: true } }));
    try {
      const ms = await goalCommands.getMilestones(goalId);
      set((s) => ({
        milestones: { ...s.milestones, [goalId]: ms },
        loadingMilestones: { ...s.loadingMilestones, [goalId]: false },
      }));
    } catch (err) {
      set((s) => ({ loadingMilestones: { ...s.loadingMilestones, [goalId]: false } }));
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },

  addMilestone: async (goalId, title, targetDate) => {
    try {
      const ms = await goalCommands.createMilestone(goalId, title, targetDate);
      set((s) => ({
        milestones: {
          ...s.milestones,
          [goalId]: [...(s.milestones[goalId] ?? []), ms],
        },
      }));
    } catch (err) {
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },

  completeMilestone: async (milestoneId, goalId) => {
    // Optimistic update
    set((s) => ({
      milestones: {
        ...s.milestones,
        [goalId]: (s.milestones[goalId] ?? []).map((m) =>
          m.id === milestoneId
            ? { ...m, completed_at: new Date().toISOString() }
            : m
        ),
      },
    }));
    try {
      await goalCommands.completeMilestone(milestoneId);
      // Recalculate goal progress from milestones
      const ms = get().milestones[goalId] ?? [];
      const completed = ms.filter((m) => m.completed_at).length;
      const progress = ms.length > 0 ? Math.round((completed / ms.length) * 100) : 0;
      await get().updateGoal({ id: goalId, progress });
    } catch (err) {
      await get().loadMilestones(goalId);
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },

  deleteMilestone: async (milestoneId, goalId) => {
    set((s) => ({
      milestones: {
        ...s.milestones,
        [goalId]: (s.milestones[goalId] ?? []).filter((m) => m.id !== milestoneId),
      },
    }));
    try {
      await goalCommands.deleteMilestone(milestoneId);
    } catch (err) {
      await get().loadMilestones(goalId);
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },
}));
