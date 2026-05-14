import { create } from "zustand";
import type { RecurringRule } from "@/types";
import * as executionCommands from "@/lib/commands/execution";
import type { CreateRecurringRuleInput } from "@/lib/commands/execution";
import { useAppStore } from "./appStore";
import { parseInvokeError } from "@/lib/utils";

interface RecurringState {
  rules: RecurringRule[];
  isLoading: boolean;

  loadRules: () => Promise<void>;
  createRule: (input: CreateRecurringRuleInput) => Promise<RecurringRule | null>;
  toggleRule: (id: string, is_active: boolean) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
}

export const useRecurringStore = create<RecurringState>((set, get) => ({
  rules: [],
  isLoading: false,

  loadRules: async () => {
    set({ isLoading: true });
    try {
      const rules = await executionCommands.getRecurringRules();
      set({ rules, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },

  createRule: async (input) => {
    try {
      const rule = await executionCommands.createRecurringRule(input);
      set((s) => ({ rules: [...s.rules, rule] }));
      return rule;
    } catch (err) {
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
      return null;
    }
  },

  toggleRule: async (id, is_active) => {
    set((s) => ({
      rules: s.rules.map((r) => (r.id === id ? { ...r, is_active } : r)),
    }));
    try {
      await executionCommands.toggleRecurringRule(id, is_active);
    } catch (err) {
      await get().loadRules();
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },

  deleteRule: async (id) => {
    set((s) => ({ rules: s.rules.filter((r) => r.id !== id) }));
    try {
      await executionCommands.deleteRecurringRule(id);
    } catch (err) {
      await get().loadRules();
      useAppStore.getState().addNotification({ type: "error", message: parseInvokeError(err) });
    }
  },
}));
